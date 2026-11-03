import { NextResponse } from 'next/server';
import { reactFanMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Reaction tim công khai. Body: `{ liked: boolean }` — true = +1, false = -1.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (typeof body?.liked !== 'boolean') {
      return NextResponse.json({ error: 'Thiếu trạng thái reaction' }, { status: 400 });
    }
    const message = await reactFanMessage(id, body.liked ? 1 : -1);
    if (!message) {
      return NextResponse.json({ error: 'Không tìm thấy lời nhắn' }, { status: 404 });
    }
    return NextResponse.json({ message });
  } catch (error) {
    console.error('React fan message failed:', error);
    return NextResponse.json({ error: 'Không cập nhật được reaction' }, { status: 500 });
  }
}
