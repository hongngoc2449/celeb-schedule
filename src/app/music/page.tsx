import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MusicPlayerPage from '@/components/MusicPlayerPage';
import { getSongs, getShows, getProfile } from '@/lib/db';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kho Âm Nhạc & Show/Talkshow OSAD | Fandom Ô Mai',
  description:
    'Nghe các sản phẩm âm nhạc, bản hit, collab và theo dõi các show truyền hình, talkshow, phỏng vấn của Chủ Tịch Mai (OSAD - Mai Quang Nam).',
};

export default async function MusicPage(props: {
  searchParams?: Promise<{ song?: string; tab?: string }>;
}) {
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const [songs, shows, profile] = await Promise.all([getSongs(), getShows(), getProfile()]);

  return (
    <>
      <Navbar profile={profile} />
      <main className="flex-1">
        <MusicPlayerPage
          songs={songs}
          shows={shows}
          profile={profile}
          initialSongId={resolvedParams?.song}
          initialTab={resolvedParams?.tab}
        />
      </main>
      <Footer profile={profile} />
    </>
  );
}
