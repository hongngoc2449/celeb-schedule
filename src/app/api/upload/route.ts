import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/db';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file ảnh' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Optimize image using Sharp (Auto-rotate EXIF orientation, max width 1600px, WebP format)
    let optimizedBuffer: Buffer;
    let contentType = 'image/webp';
    let fileExt = '.webp';

    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn('Sharp optimization warning, using raw buffer:', sharpErr);
      optimizedBuffer = rawBuffer;
      contentType = file.type || 'image/jpeg';
      fileExt = path.extname(file.name) || '.jpg';
    }

    // 2. If Cloudinary credentials are configured, try uploading to Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signaturePayload = `folder=osad_celebrity&timestamp=${timestamp}${apiSecret}`;

        const crypto = await import('crypto');
        const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

        const cloudFormData = new FormData();
        cloudFormData.append('file', new Blob([new Uint8Array(optimizedBuffer)], { type: contentType }));
        cloudFormData.append('api_key', apiKey);
        cloudFormData.append('timestamp', timestamp.toString());
        cloudFormData.append('signature', signature);
        cloudFormData.append('folder', 'osad_celebrity');

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: cloudFormData,
          }
        );

        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          return NextResponse.json({
            url: cloudData.secure_url,
            provider: 'cloudinary',
            success: true,
          });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to database storage:', cloudErr);
      }
    }

    // 3. Database Storage (MongoDB Atlas) - 100% reliable on Vercel without read-only filesystem crash
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${imageId}${fileExt}`;

    const imageUrl = await saveUploadedImage({
      id: imageId,
      filename,
      contentType,
      size: optimizedBuffer.length,
      dataBuffer: optimizedBuffer,
    });

    // 4. In local development (non-Vercel), also save a copy to public/uploads as convenient backup
    if (!process.env.VERCEL) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, filename), optimizedBuffer);
      } catch (localFsErr) {
        // Safe to ignore on serverless or restricted disk
      }
    }

    return NextResponse.json({
      url: imageUrl,
      provider: 'mongodb',
      success: true,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message || 'Lỗi tải ảnh lên' }, { status: 500 });
  }
}
