import { NextResponse } from 'next/server';
import { getShows, addShow } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    const shows = await getShows();
    return NextResponse.json({ shows });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải danh sách show' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Vui lòng nhập tên show' }, { status: 400 });
    }

    const newShow = await addShow(body);
    return NextResponse.json({ show: newShow, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi thêm show mới' }, { status: 500 });
  }
}
