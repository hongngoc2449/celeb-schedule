import { NextResponse } from 'next/server';
import { getSongs, createSong } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    const songs = await getSongs();
    return NextResponse.json({ songs });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải danh sách âm nhạc' }, { status: 500 });
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
      return NextResponse.json({ error: 'Vui lòng nhập tên bài hát' }, { status: 400 });
    }

    const newSong = await createSong(body);
    return NextResponse.json({ song: newSong, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi thêm bài hát mới' }, { status: 500 });
  }
}

