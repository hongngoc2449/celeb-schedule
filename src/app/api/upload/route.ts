import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. If Cloudinary is configured, upload via Cloudinary REST API
    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signaturePayload = `folder=osad_celebrity&timestamp=${timestamp}${apiSecret}`;
      
      const crypto = await import('crypto');
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const cloudFormData = new FormData();
      cloudFormData.append('file', new Blob([buffer], { type: file.type }));
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
    }

    // 2. Local Fallback: Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.png';
    const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeName}`,
      provider: 'local',
      success: true,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Lỗi tải ảnh lên' }, { status: 500 });
  }
}

