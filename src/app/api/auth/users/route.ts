import { NextResponse } from 'next/server';
import { checkAdminAuth, getAdminSession } from '@/lib/auth';
import { getAdminUsers, createAdminUser } from '@/lib/db';

export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const users = await getAdminUsers();
    const session = await getAdminSession();
    return NextResponse.json({ users, currentUser: session });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const { username, password, name, role } = await req.json();

    if (!username || !username.trim()) {
      return NextResponse.json({ error: 'Tên đăng nhập không được để trống' }, { status: 400 });
    }

    if (!password || password.trim().length < 4) {
      return NextResponse.json({ error: 'Mật khẩu phải từ 4 ký tự trở lên' }, { status: 400 });
    }

    const res = await createAdminUser({
      username: username.trim(),
      password: password.trim(),
      name: name || username,
      role: role || 'admin',
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Lỗi tạo tài khoản' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: res.user, message: 'Tạo tài khoản thành công!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo tài khoản' }, { status: 500 });
  }
}
