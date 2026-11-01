import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ScheduleBoard from '@/components/ScheduleBoard';
import AboutSection from '@/components/AboutSection';
import Discography from '@/components/Discography';
import GallerySection from '@/components/GallerySection';
import FandomSocialSection from '@/components/FandomSocialSection';
import Footer from '@/components/Footer';
import { getSchedules, getProfile, getGallery } from '@/lib/db';

export const revalidate = 60; // Incremental Static Regeneration every 60s

export default async function HomePage() {
  const [schedules, profile, gallery] = await Promise.all([
    getSchedules(),
    getProfile(),
    getGallery(),
  ]);

  return (
    <>
      <Navbar profile={profile} />
      <main className="flex-1">
        <Hero profile={profile} />
        <ScheduleBoard initialSchedules={schedules} profile={profile} />
        <AboutSection profile={profile} />
        <Discography profile={profile} />
        <GallerySection gallery={gallery} profile={profile} />
        <FandomSocialSection profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
