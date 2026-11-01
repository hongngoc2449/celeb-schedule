import { NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải thông tin profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateProfile(body);
    return NextResponse.json({ profile: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật profile' }, { status: 500 });
  }
}

