import { NextResponse } from 'next/server';
import { getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    const gallery = await getGallery();
    return NextResponse.json({ gallery });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải gallery' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.imageUrl || !body.title) {
      return NextResponse.json({ error: 'Thiếu đường dẫn ảnh hoặc tiêu đề' }, { status: 400 });
    }

    const newItem = await addGalleryItem(body);
    return NextResponse.json({ item: newItem, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi thêm ảnh vào gallery' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID ảnh' }, { status: 400 });
    }

    const updated = await updateGalleryItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy ảnh' }, { status: 404 });
    }

    return NextResponse.json({ item: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật ảnh' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID ảnh' }, { status: 400 });
    }

    await deleteGalleryItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa ảnh' }, { status: 500 });
  }
}

