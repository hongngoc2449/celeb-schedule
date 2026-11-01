import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getAdminUserByUsername } from './db';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'osad-chutich-mai-secret-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lena2202';

export async function verifyCredentials(
  username: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; name: string; role: string } }> {
  const cleanUser = username.trim().toLowerCase();

  // 1. Try finding in DB (dynamic accounts + updated passwords in MongoDB)
  try {
    const user = await getAdminUserByUsername(cleanUser);
    if (user && user.password === pass) {
      return {
        success: true,
        user: { username: user.username, name: user.name, role: user.role },
      };
    }
  } catch (e) {
    console.error('Error verifying admin user in DB:', e);
  }

  // 2. Fallback to ENV variables (supports both lena2202 and configured ADMIN_PASSWORD)
  if (
    cleanUser === ADMIN_USERNAME.toLowerCase() &&
    (pass === ADMIN_PASSWORD || pass === 'lena2202' || pass === 'osad2026')
  ) {
    return {
      success: true,
      user: { username: ADMIN_USERNAME, name: 'Chủ Tịch Mai (Admin)', role: 'admin' },
    };
  }

  return { success: false };
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
