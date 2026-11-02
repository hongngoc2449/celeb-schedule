import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { deleteFanMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
