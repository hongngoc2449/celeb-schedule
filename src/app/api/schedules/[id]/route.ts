import { NextResponse } from 'next/server';
import { updateSchedule, deleteSchedule } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateSchedule(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 });
    }

    return NextResponse.json({ schedule: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật lịch trình' }, { status: 500 });
  }
}

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
    const deleted = await deleteSchedule(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện cần xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa sự kiện thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa lịch trình' }, { status: 500 });
  }
}

