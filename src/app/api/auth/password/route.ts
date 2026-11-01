import { NextResponse } from 'next/server';
import { checkAdminAuth, getAdminSession, verifyCredentials } from '@/lib/auth';
import { updateUserPassword } from '@/lib/db';

export async function PUT(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 });
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Phiên đăng nhập không hợp lệ' }, { status: 401 });
    }

    const { currentPassword, newPassword, targetUsername } = await req.json();

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 4 ký tự' },
        { status: 400 }
      );
    }

    // Username to change
    const usernameToChange = targetUsername || session.user;

    // If changing own password, verify current password first
    if (!targetUsername || targetUsername === session.user) {
      const verify = await verifyCredentials(session.user, currentPassword);
      if (!verify.success) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không chính xác' },
          { status: 400 }
        );
      }
    }

    const result = await updateUserPassword(usernameToChange, newPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Lỗi khi đổi mật khẩu' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi đổi mật khẩu' }, { status: 500 });
  }
}

