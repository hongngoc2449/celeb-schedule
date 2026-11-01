import { NextResponse } from 'next/server';
import { updateShow, deleteShow } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateShow(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy show' }, { status: 404 });
    }
    return NextResponse.json({ show: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật show' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ok = await deleteShow(id);
    if (!ok) {
      return NextResponse.json({ error: 'Không tìm thấy show để xóa' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa show' }, { status: 500 });
  }
}
