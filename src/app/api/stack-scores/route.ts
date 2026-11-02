import { NextResponse } from 'next/server';
import { createStackScore, getStackScores } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Lấy top 10 điểm minigame.
 */
export async function GET() {
  try {
    const scores = await getStackScores();
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('GET /api/stack-scores failed:', error);
    return NextResponse.json({ error: 'Không lấy được bảng xếp hạng' }, { status: 500 });
  }
}

/**
 * Gửi điểm sau khi thua / kết thúc ván.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authorName = String(body?.authorName || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 24);
    const score = Number(body?.score);

    if (!authorName) {
      return NextResponse.json({ error: 'Nhập tên để lưu điểm' }, { status: 400 });
    }
    if (!Number.isFinite(score) || score < 1 || score > 999999) {
      return NextResponse.json({ error: 'Điểm không hợp lệ' }, { status: 400 });
    }

    const scores = await createStackScore({
      authorName,
      score: Math.floor(score),
    });
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('POST /api/stack-scores failed:', error);
    return NextResponse.json({ error: 'Không lưu được điểm' }, { status: 500 });
  }
}
