import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createFanMessage, saveUploadedImage } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Nén ảnh người dùng gửi thành WebP trước khi lưu.
 * @param {File} file File ảnh từ form.
 * @param {number} maxEdge Cạnh dài tối đa, pixel.
 * @returns {Promise<Buffer>} Buffer WebP.
 */
async function optimizeFanImage(file: File, maxEdge: number): Promise<Buffer> {
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  return sharp(rawBuffer)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * Lưu một file ảnh và trả URL public.
 * @param {File} file File đã kiểm tra loại và dung lượng.
 * @param {string} prefix Tiền tố id để phân biệt ảnh và chữ ký.
 * @param {number} maxEdge Cạnh dài tối đa.
 * @returns {Promise<string>} URL /api/images/...
 */
async function storeFanImage(file: File, prefix: string, maxEdge: number): Promise<string> {
  const optimized = await optimizeFanImage(file, maxEdge);
  const imageId = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return saveUploadedImage({
    id: imageId,
    filename: `${imageId}.webp`,
    contentType: 'image/webp',
    size: optimized.length,
    dataBuffer: optimized,
  });
}

/**
 * Từ chối file không phải ảnh hoặc quá nặng.
 * @param {File | null} file File form, có thể trống.
 * @param {string} label Tên trường để báo lỗi.
 * @returns {string | null} Thông báo lỗi, hoặc null nếu hợp lệ.
 */
function validateOptionalImage(file: File | null, label: string): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) return `${label} vượt quá 4MB`;
  if (file.type && !ALLOWED_TYPES.includes(file.type)) return `${label} chỉ nhận JPG, PNG, WEBP hoặc GIF`;
  return null;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const authorName = String(formData.get('authorName') || '').replace(/\s+/g, ' ').trim();
    const text = String(formData.get('text') || '').trim();
    const photo = formData.get('photo');
    const signature = formData.get('signature');
    const photoFile = photo instanceof File ? photo : null;
    const signatureFile = signature instanceof File ? signature : null;

    if (!authorName || authorName.length > 40) {
      return NextResponse.json({ error: 'Tên hiển thị cần từ 1 đến 40 ký tự' }, { status: 400 });
    }
    if (!text || text.length > 800) {
      return NextResponse.json({ error: 'Lời nhắn cần từ 1 đến 800 ký tự' }, { status: 400 });
    }

    const photoError = validateOptionalImage(photoFile, 'Ảnh');
    if (photoError) return NextResponse.json({ error: photoError }, { status: 400 });
    const signatureError = validateOptionalImage(signatureFile, 'Chữ ký');
    if (signatureError) return NextResponse.json({ error: signatureError }, { status: 400 });

    let imageUrl = '';
    let signatureUrl = '';
    if (photoFile && photoFile.size > 0) {
      imageUrl = await storeFanImage(photoFile, 'fan', 1400);
    }
    if (signatureFile && signatureFile.size > 0) {
      signatureUrl = await storeFanImage(signatureFile, 'sign', 800);
    }

    const message = await createFanMessage({
      authorName,
      text,
      imageUrl: imageUrl || undefined,
      signatureUrl: signatureUrl || undefined,
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Create fan message failed:', error);
    return NextResponse.json({ error: 'Không gửi được lời nhắn. Thử lại sau.' }, { status: 500 });
  }
}
