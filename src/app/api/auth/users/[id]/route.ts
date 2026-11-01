import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { deleteAdminUser } from '@/lib/db';

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
    const res = await deleteAdminUser(id);

    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Lỗi khi xóa người dùng' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi xóa người dùng' }, { status: 500 });
  }
}
