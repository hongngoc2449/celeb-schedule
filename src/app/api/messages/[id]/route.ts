import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { deleteFanMessage, setFanMessagePinned } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Ghim / bỏ ghim lời nhắn. Body: `{ pinned: boolean }`.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (typeof body?.pinned !== 'boolean') {
      return NextResponse.json({ error: 'Thiếu trạng thái ghim' }, { status: 400 });
    }
    const message = await setFanMessagePinned(id, body.pinned);
    if (!message) {
      return NextResponse.json({ error: 'Không tìm thấy lời nhắn' }, { status: 404 });
    }
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Pin fan message failed:', error);
    return NextResponse.json({ error: 'Không cập nhật được trạng thái ghim' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteFanMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy lời nhắn' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete fan message failed:', error);
    return NextResponse.json({ error: 'Không xóa được lời nhắn' }, { status: 500 });
  }
}
