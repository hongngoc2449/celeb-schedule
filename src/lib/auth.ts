import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getAdminUserByUsername, updateUserPassword } from './db';
import { isBcryptHash, verifyPassword } from './password';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'osad-chutich-mai-secret-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

/**
 * Kiểm tra đăng nhập bằng hash bcrypt của tài khoản đã lưu.
 * Không còn chấp nhận mật khẩu hardcode song song với mật khẩu trong kho.
 * @param {string} username Tên đăng nhập.
 * @param {string} pass Mật khẩu plaintext.
 * @returns {Promise<{ success: boolean; user?: { username: string; name: string; role: string } }>}
 */
export async function verifyCredentials(
  username: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; name: string; role: string } }> {
  const cleanUser = username.trim().toLowerCase();
  if (!cleanUser || !pass) return { success: false };

  try {
    const user = await getAdminUserByUsername(cleanUser);
    if (!user || !(await verifyPassword(pass, user.password))) {
      return { success: false };
    }

    if (user.password && !isBcryptHash(user.password)) {
      await updateUserPassword(user.username, pass);
    }

    return {
      success: true,
      user: { username: user.username, name: user.name, role: user.role },
    };
  } catch (error) {
    console.error('Error verifying admin user:', error);
    return { success: false };
  }
}

export function signAdminToken(user?: { username: string; name?: string; role?: string }): string {
  return jwt.sign(
    {
      role: user?.role || 'admin',
      user: user?.username || ADMIN_USERNAME,
      name: user?.name || 'Admin',
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded && (decoded.role === 'admin' || decoded.role === 'editor');
  } catch (err) {
    return false;
  }
}

export async function getAdminSession(): Promise<{ role: string; user: string; name: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && (decoded.role === 'admin' || decoded.role === 'editor')) {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}
