import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MusicPlayerPage from '@/components/MusicPlayerPage';
import { getSongs } from '@/lib/db';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kho Âm Nhạc OSAD - 96+ Bản Hit & Collab | Fandom Ô Mai',
  description:
    'Nghe toàn bộ sản phẩm âm nhạc, bản hit, collab và các tiết mục bùng nổ tại Anh Trai Vượt Ngàn Chông Gai của Chủ Tịch Mai (OSAD - Mai Quang Nam).',
};

export default async function MusicPage() {
  const songs = await getSongs();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MusicPlayerPage songs={songs} />
      </main>
      <Footer />
    </>
  );
}
