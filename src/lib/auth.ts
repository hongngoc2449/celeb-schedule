import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'osad-chutich-mai-secret-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'osad2026';

export function verifyCredentials(username: string, pass: string): boolean {
  return username === ADMIN_USERNAME && pass === ADMIN_PASSWORD;
}

export function signAdminToken(): string {
  return jwt.sign({ role: 'admin', user: ADMIN_USERNAME }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded && decoded.role === 'admin';
  } catch (err) {
    return false;
  }
}

