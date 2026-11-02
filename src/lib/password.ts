import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

/**
 * Kiểm tra chuỗi đã là hash bcrypt hay còn plaintext.
 * @param {string | undefined | null} value Giá trị mật khẩu đang lưu.
 * @returns {boolean} true nếu đúng định dạng hash bcrypt.
 */
export function isBcryptHash(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

/**
 * Băm mật khẩu plaintext trước khi ghi xuống MongoDB hoặc data-store.json.
 * @param {string} plainPassword Mật khẩu người dùng nhập.
 * @returns {Promise<string>} Hash bcrypt.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * So khớp mật khẩu đăng nhập với giá trị đã lưu.
 * Hash bcrypt dùng bcrypt.compare. Chuỗi cũ chưa băm chỉ so một lần để migrate.
 * @param {string} plainPassword Mật khẩu người dùng nhập.
 * @param {string | undefined | null} storedPassword Giá trị trong kho.
 * @returns {Promise<boolean>} true nếu khớp.
 */
export async function verifyPassword(
  plainPassword: string,
  storedPassword: string | undefined | null
): Promise<boolean> {
  if (!plainPassword || !storedPassword) return false;

  try {
    if (isBcryptHash(storedPassword)) {
      return bcrypt.compare(plainPassword, storedPassword);
    }
    return storedPassword === plainPassword;
  } catch (error) {
    console.error('Password verify error:', error);
    return false;
  }
}
