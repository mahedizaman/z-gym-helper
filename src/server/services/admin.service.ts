import { connectToDatabase } from '@/server/db';
import { UserModel } from '@/server/models/user.model';
import { FoodModel, IFood } from '@/server/models/food.model';
import { ExerciseModel, IExercise } from '@/server/models/exercise.model';
import { AuditLogModel, IAuditLog } from '@/server/models/audit-log.model';
import { userService } from './user.service';

export interface AdminMetrics {
  totalUsers: number;
  active7Days: number;
  activeRatioString: string;
  activePercentage: number;
  dau: number;
  wau: number;
  mau: number;
  signupsToday: number;
  signups30Days: Array<{ date: string; signups: number }>;
  recentLogins: Array<{
    _id: string;
    nickname: string;
    email: string;
    createdAt: Date;
    lastActiveAt: Date;
    role: string;
    disabled?: boolean;
  }>;
}

export interface FoodInputData {
  nameBn: string;
  nameEn: string;
  aliases?: string[];
  category:
    | 'grains'
    | 'lentils'
    | 'fish'
    | 'poultry_meat'
    | 'eggs_dairy'
    | 'vegetables_bhorta'
    | 'fruits'
    | 'snacks_beverages';
  image?: string;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
    zinc?: number;
  };
  servings: Array<{
    labelBn: string;
    labelEn: string;
    grams: number;
  }>;
  source: string;
  verified: boolean;
}

export interface ExerciseInputData {
  slug: string;
  nameBn: string;
  nameEn: string;
  muscle: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
  secondaryMuscles?: string[];
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  level: 'beginner' | 'intermediate' | 'advanced';
  instructionsBn?: string[];
  instructionsEn?: string[];
  commonMistakesBn?: string[];
  tipsBn?: string;
  tipsEn?: string;
  youtubeId?: string;
  images?: string[];
  reviewed?: boolean;
}

export const adminService = {
  /**
   * Log administrative audit action
   */
  async logAudit(
    adminId: string,
    adminEmail: string,
    action: string,
    details?: Record<string, unknown>,
    targetId?: string,
    ip?: string
  ): Promise<void> {
    await connectToDatabase();
    await AuditLogModel.create({
      adminId,
      adminEmail,
      action,
      targetId,
      details,
      ip,
    });
  },

  /**
   * Aggregate high-level platform metrics for the admin dashboard.
   * STRICT: Admins never receive meal, weight or workout logs.
   */
  async getMetrics(): Promise<AdminMetrics> {
    await connectToDatabase();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today in Asia/Dhaka
    const startOfTodayDhaka = new Date();
    startOfTodayDhaka.setUTCHours(startOfTodayDhaka.getUTCHours() + 6);
    startOfTodayDhaka.setUTCHours(0, 0, 0, 0);
    startOfTodayDhaka.setUTCHours(startOfTodayDhaka.getUTCHours() - 6);

    const [totalUsers, active7Days, dau, mau, signupsToday, recentLogins] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),
      UserModel.countDocuments({ lastActiveAt: { $gte: oneDayAgo } }),
      UserModel.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
      UserModel.countDocuments({ createdAt: { $gte: startOfTodayDhaka } }),
      UserModel.find({})
        .sort({ lastActiveAt: -1 })
        .limit(10)
        .select('_id nickname email createdAt lastActiveAt role disabled')
        .lean(),
    ]);

    const activeRatioString = `${active7Days}/${totalUsers}`;
    const activePercentage = totalUsers > 0 ? Math.round((active7Days / totalUsers) * 100) : 0;

    // 30-Day signup trend
    const signupsByDayMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      signupsByDayMap.set(dateKey, 0);
    }

    const recentSignups = await UserModel.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .select('createdAt')
      .lean();

    for (const u of recentSignups) {
      const dateKey = new Date(u.createdAt).toISOString().split('T')[0];
      if (signupsByDayMap.has(dateKey)) {
        signupsByDayMap.set(dateKey, (signupsByDayMap.get(dateKey) || 0) + 1);
      }
    }

    const signups30Days = Array.from(signupsByDayMap.entries()).map(([date, signups]) => ({
      date,
      signups,
    }));

    return {
      totalUsers,
      active7Days,
      activeRatioString,
      activePercentage,
      dau,
      wau: active7Days,
      mau,
      signupsToday,
      signups30Days,
      recentLogins: recentLogins.map((u) => ({
        _id: u._id.toString(),
        nickname: u.nickname,
        email: u.email,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
        role: u.role,
        disabled: u.disabled,
      })),
    };
  },

  /**
   * Search and paginate user accounts.
   * STRICT: Admins only see account-level data (nickname, email, dates, status).
   */
  async getUsers(search?: string, page = 1, limit = 20) {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ nickname: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id nickname email createdAt lastActiveAt role disabled')
        .lean(),
      UserModel.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Disable or enable a user account.
   * STRICT RULES:
   * 1. Admins cannot disable themselves.
   * 2. Admins cannot disable other admins.
   */
  async toggleUserDisabled(
    admin: { id: string; email: string },
    targetUserId: string,
    disabled: boolean,
    ip?: string
  ): Promise<boolean> {
    await connectToDatabase();

    if (admin.id === targetUserId) {
      throw new Error('Administrators cannot disable their own account');
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user account not found');
    }

    const isTargetAdmin =
      targetUser.role === 'admin' || userService.isAdminEmail(targetUser.email);

    if (isTargetAdmin) {
      throw new Error('Administrators cannot disable another administrator account');
    }

    targetUser.disabled = disabled;
    await targetUser.save();

    await this.logAudit(
      admin.id,
      admin.email,
      disabled ? 'USER_DISABLE' : 'USER_ENABLE',
      { targetUserId, targetEmail: targetUser.email, targetNickname: targetUser.nickname },
      targetUserId,
      ip
    );

    return true;
  },

  /**
   * Create or update food item.
   * STRICT RULE: The `verified` flag can be set `true` ONLY with `source` filled in!
   */
  async saveFood(
    admin: { id: string; email: string },
    data: FoodInputData,
    foodId?: string,
    ip?: string
  ): Promise<IFood> {
    await connectToDatabase();

    if (data.verified && (!data.source || !data.source.trim())) {
      throw new Error('Source citation is mandatory when marking a food item as verified');
    }

    let food: IFood;

    if (foodId) {
      const existing = await FoodModel.findById(foodId);
      if (!existing) throw new Error('Food item not found for editing');

      Object.assign(existing, {
        nameBn: data.nameBn.trim(),
        nameEn: data.nameEn.trim(),
        aliases: data.aliases || [],
        category: data.category,
        image: data.image,
        per100g: data.per100g,
        servings: data.servings,
        source: data.source.trim(),
        verified: Boolean(data.verified),
      });

      food = await existing.save();

      await this.logAudit(
        admin.id,
        admin.email,
        'FOOD_UPDATE',
        { foodId, nameEn: food.nameEn, verified: food.verified },
        foodId,
        ip
      );
    } else {
      food = await FoodModel.create({
        nameBn: data.nameBn.trim(),
        nameEn: data.nameEn.trim(),
        aliases: data.aliases || [],
        category: data.category,
        image: data.image,
        per100g: data.per100g,
        servings: data.servings,
        source: data.source.trim(),
        verified: Boolean(data.verified),
      });

      await this.logAudit(
        admin.id,
        admin.email,
        'FOOD_CREATE',
        { foodId: food._id.toString(), nameEn: food.nameEn, verified: food.verified },
        food._id.toString(),
        ip
      );
    }

    return food;
  },

  /**
   * Create or update exercise.
   * YouTube ID must be validated (11 alphanum characters or empty).
   */
  async saveExercise(
    admin: { id: string; email: string },
    data: ExerciseInputData,
    exerciseId?: string,
    ip?: string
  ): Promise<IExercise> {
    await connectToDatabase();

    let exercise: IExercise;

    const youtubeId = data.youtubeId?.trim() || '';
    if (youtubeId && !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      throw new Error('Invalid YouTube video ID format (must be 11 characters or empty)');
    }

    if (exerciseId) {
      const existing = await ExerciseModel.findById(exerciseId);
      if (!existing) throw new Error('Exercise not found for editing');

      Object.assign(existing, {
        nameBn: data.nameBn.trim(),
        nameEn: data.nameEn.trim(),
        muscle: data.muscle,
        secondaryMuscles: data.secondaryMuscles || [],
        equipment: data.equipment,
        level: data.level,
        instructionsBn: data.instructionsBn || [],
        instructionsEn: data.instructionsEn || [],
        commonMistakesBn: data.commonMistakesBn || [],
        tipsBn: data.tipsBn || '',
        tipsEn: data.tipsEn || '',
        youtubeId,
        images: data.images || [],
        reviewed: Boolean(data.reviewed),
      });

      exercise = await existing.save();

      await this.logAudit(
        admin.id,
        admin.email,
        'EXERCISE_UPDATE',
        { exerciseId, slug: exercise.slug, reviewed: exercise.reviewed },
        exerciseId,
        ip
      );
    } else {
      exercise = await ExerciseModel.create({
        slug: data.slug.trim().toLowerCase(),
        nameBn: data.nameBn.trim(),
        nameEn: data.nameEn.trim(),
        muscle: data.muscle,
        secondaryMuscles: data.secondaryMuscles || [],
        equipment: data.equipment,
        level: data.level,
        instructionsBn: data.instructionsBn || [],
        instructionsEn: data.instructionsEn || [],
        commonMistakesBn: data.commonMistakesBn || [],
        tipsBn: data.tipsBn || '',
        tipsEn: data.tipsEn || '',
        youtubeId,
        images: data.images || [],
        reviewed: Boolean(data.reviewed),
      });

      await this.logAudit(
        admin.id,
        admin.email,
        'EXERCISE_CREATE',
        { exerciseId: exercise._id.toString(), slug: exercise.slug, reviewed: exercise.reviewed },
        exercise._id.toString(),
        ip
      );
    }

    return exercise;
  },

  /**
   * Retrieve latest audit logs for admin overview
   */
  async getAuditLogs(limit = 50): Promise<IAuditLog[]> {
    await connectToDatabase();
    return AuditLogModel.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  },
};
