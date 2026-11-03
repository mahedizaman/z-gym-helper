import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/server/db';
import { UserModel, IUser } from '@/server/models/user.model';

export type AuthResult =
  | { authorized: true; userId: string; user: IUser }
  | { authorized: false; response: NextResponse };

/**
 * Validates authentication on every request and blocks disabled accounts immediately.
 */
export async function requireAuthUser(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  await connectToDatabase();
  const dbUser = await UserModel.findById(session.user.id);

  if (!dbUser) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      ),
    };
  }

  if (dbUser.disabled) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden: Account has been suspended or disabled' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    user: dbUser,
  };
}
