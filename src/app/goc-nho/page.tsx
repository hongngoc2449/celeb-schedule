import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FanCornerPage from '@/components/FanCornerPage';
import { getAdminSession } from '@/lib/auth';
import { getFanMessages, getProfile } from '@/lib/db';
import { resolveStackImages } from '@/lib/stackDropGame';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Góc nhỏ gửi OSAD | Fandom Ô Mai',
  description: 'Gửi lời nhắn, ảnh và chữ ký tới OSAD (Chủ Tịch Mai).',
};

export default async function GocNhoPage() {
  const [messages, profile, session] = await Promise.all([
    getFanMessages(),
    getProfile(),
    getAdminSession(),
  ]);

  return (
    <>
      <Navbar profile={profile} />
      <main className="relative flex-1 overflow-hidden bg-[#fff6f4]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,186,198,0.55),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(255,214,176,0.45),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(244,184,204,0.35),transparent_42%)]"
        />
        <div className="relative">
          <FanCornerPage
            messages={messages}
            canDelete={Boolean(session)}
            siteTexts={profile.siteTexts}
            stackImages={resolveStackImages(profile.stackImages)}
          />
        </div>
      </main>
      <Footer profile={profile} />
    </>
  );
}
