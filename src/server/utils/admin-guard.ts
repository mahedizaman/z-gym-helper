import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { connectToDatabase } from '@/server/db';
import { UserModel } from '@/server/models/user.model';

export interface AdminSessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'admin';
}

export type AdminAuthResult =
  | { authorized: true; user: AdminSessionUser }
  | { authorized: false; response: NextResponse };

/**
 * Validates that the active request session belongs to an authorized administrator.
 * Evaluated strictly on the server by checking session role, DB status, and ADMIN_EMAILS.
 */
export async function requireServerAdmin(): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  const email = session.user.email.toLowerCase().trim();
  const isAdminEmail = userService.isAdminEmail(email);

  await connectToDatabase();
  const dbUser = await UserModel.findById(session.user.id).select('role disabled').lean();

  if (!dbUser || dbUser.disabled) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden: Account is disabled or non-existent' },
        { status: 403 }
      ),
    };
  }

  // User is admin if role is admin in DB or email matches ADMIN_EMAILS
  if (dbUser.role !== 'admin' && !isAdminEmail) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: {
      id: session.user.id,
      email,
      name: session.user.name,
      role: 'admin',
    },
  };
}
