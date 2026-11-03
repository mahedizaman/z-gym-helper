import { PushTokenModel } from '../models/push-token.model';
import { UserModel, IUserNotificationPreferences } from '../models/user.model';
import { fcmService } from './fcm.service';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';

export const notificationService = {
  async registerToken(userId: string, token: string, userAgent?: string): Promise<void> {
    await connectToDatabase();
    const parsedUserId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    await PushTokenModel.findOneAndUpdate(
      { token },
      {
        userId: parsedUserId,
        token,
        userAgent,
      },
      { upsert: true, new: true }
    );

    // Automatically subscribe token to "announcements" topic
    await fcmService.subscribeToTopic([token], 'announcements');
  },

  async unregisterToken(token: string): Promise<void> {
    await connectToDatabase();
    await PushTokenModel.deleteOne({ token });
    await fcmService.unsubscribeFromTopic([token], 'announcements');
  },

  async updatePreferences(
    userId: string,
    prefs: Partial<IUserNotificationPreferences>
  ): Promise<IUserNotificationPreferences | undefined> {
    await connectToDatabase();
    const user = await UserModel.findById(userId);
    if (!user) return undefined;

    user.notificationPreferences = {
      workoutReminderTime: prefs.workoutReminderTime ?? user.notificationPreferences?.workoutReminderTime ?? '18:00',
      mealReminderTime: prefs.mealReminderTime ?? user.notificationPreferences?.mealReminderTime ?? '13:00',
      notificationsOptOut: prefs.notificationsOptOut ?? user.notificationPreferences?.notificationsOptOut ?? false,
    };

    await user.save();
    return user.notificationPreferences;
  },

  /**
   * Processes reminders for users whose configured reminder time matches current hour.
   * Can be executed safely via cron (external or GitHub Actions).
   */
  async processScheduledReminders(): Promise<{
    workoutRemindersSent: number;
    mealRemindersSent: number;
  }> {
    await connectToDatabase();

    // Find all users who haven't opted out of notifications
    const users = await UserModel.find({
      'notificationPreferences.notificationsOptOut': { $ne: true },
      disabled: { $ne: true },
    }).lean();

    let workoutRemindersSent = 0;
    let mealRemindersSent = 0;

    const now = new Date();

    for (const user of users) {
      const timezone = user.timezone || 'Asia/Dhaka';

      // Format current time in user's timezone to "HH:00"
      let currentHourString: string;
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).formatToParts(now);

        const hour = parts.find((p) => p.type === 'hour')?.value || '00';
        currentHourString = `${hour}:00`;
      } catch {
        currentHourString = '18:00';
      }

      const workoutTime = user.notificationPreferences?.workoutReminderTime || '18:00';
      const mealTime = user.notificationPreferences?.mealReminderTime || '13:00';

      const isWorkoutDue = workoutTime.startsWith(currentHourString.slice(0, 2));
      const isMealDue = mealTime.startsWith(currentHourString.slice(0, 2));

      if (!isWorkoutDue && !isMealDue) continue;

      // Find user tokens
      const tokenDocs = await PushTokenModel.find({ userId: user._id }).lean();
      const tokens = tokenDocs.map((t) => t.token);

      if (tokens.length === 0) continue;

      if (isWorkoutDue) {
        await fcmService.sendToTokens(tokens, {
          title: 'ওয়ার্কআউটের সময় হয়েছে! 🏋️',
          body: `সালাম ${user.nickname}! আজকের জিম সেশনটি সম্পন্ন করে আপনার ফিটনেস স্ট্রিক ধরে রাখুন।`,
          url: '/log',
        });
        workoutRemindersSent += tokens.length;
      }

      if (isMealDue) {
        await fcmService.sendToTokens(tokens, {
          title: 'খাবারের পুষ্টি লগ করার সময়! 🥗',
          body: `আজকের মিল লগ করে আপনার ক্যালোরি লক্ষ্যমাত্রার মধ্যে থাকুন।`,
          url: '/calculator',
        });
        mealRemindersSent += tokens.length;
      }
    }

    return {
      workoutRemindersSent,
      mealRemindersSent,
    };
  },
};
