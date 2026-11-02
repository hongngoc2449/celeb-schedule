import { NextResponse } from 'next/server';
import { updateGalleryItem, deleteGalleryItem } from '@/lib/db';
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
    const updated = await updateGalleryItem(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy ảnh' }, { status: 404 });
    }

    return NextResponse.json({ item: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật ảnh' }, { status: 500 });
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
    const ok = await deleteGalleryItem(id);
    if (!ok) {
      return NextResponse.json({ error: 'Không tìm thấy ảnh để xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa ảnh' }, { status: 500 });
  }
}

