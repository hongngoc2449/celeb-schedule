import { NextResponse } from 'next/server';
import { getSchedules, createSchedule } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET() {
  try {
    const schedules = await getSchedules();
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải lịch trình' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.dateDisplay || !body.month || !body.year) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const newSchedule = await createSchedule(body);
    return NextResponse.json({ schedule: newSchedule, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tạo lịch trình' }, { status: 500 });
  }
}

