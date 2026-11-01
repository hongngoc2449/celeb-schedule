import { NextResponse } from 'next/server';
import { deleteSong } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteSong(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy bài hát cần xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bài hát khỏi danh sách' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa bài hát' }, { status: 500 });
  }
}

