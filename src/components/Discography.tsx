import Link from 'next/link';
import { Music, Play, ArrowRight, Sparkles } from 'lucide-react';
import { GeoCluster, GeoCircle, GeoTriangle, GeoCross } from '@/components/GeometricDecor';

const FEATURED_TRACKS = [
  {
    title: 'Người Âm Phủ',
    tag: 'MEGA HIT',
    year: '2018',
    views: '110M+ Views',
    color: 'bg-brand-yellow',
  },
  {
    title: 'Củ Lạc',
    tag: 'VIRAL HIT',
    year: '2018',
    views: '45M+ Views',
    color: 'bg-brand-pink',
  },
  {
    title: 'Như Một Người Rưng',
    tag: 'NEW COLLAB',
    year: '2024',
    views: 'ft. Hà An Huy',
    color: 'bg-brand-lightgreen',
  },
  {
    title: 'Thăng Hoa',
    tag: 'ATVNCG',
    year: '2024',
    views: 'Nhà Thăng Hoa',
    color: 'bg-brand-purple',
  },
  {
    title: 'Anh Mệt Rồi',
    tag: 'HIT SINGLE',
    year: '2020',
    views: '20M+ Views',
    color: 'bg-brand-lightblue',
  },
  {
    title: 'Và Tôi Cũng Yêu Em',
    tag: 'STAGE LIVE',
    year: '2024',
    views: 'Anh Trai Vượt Ngàn Chông Gai',
    color: 'bg-amber-200',
  },
];

export default function Discography() {
  return (
    <section id="music" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-[#faf7f2] relative overflow-hidden">
      {/* Background Decors */}
      <div className="absolute top-10 left-8 hidden md:block opacity-40 -rotate-12 pointer-events-none">
        <GeoCross className="w-10 h-10" color="#2563EB" />
      </div>
      <div className="absolute bottom-10 right-8 hidden md:block opacity-40 rotate-12 pointer-events-none">
        <GeoTriangle className="w-10 h-10" color="#16A34A" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="neo-sticker bg-brand-yellow text-black -rotate-1 text-xs sm:text-sm font-black">
              🎵 DISCOGRAPHY
            </span>
            <GeoCluster className="hidden sm:inline-flex" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            ÂM NHẠC & BẢN HIT NỔI BẬT
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            Những bản hit làm nên tên tuổi của OSAD (Chủ Tịch Mai). Toàn bộ danh sách 96+ ca khúc đã được tổng hợp tại trang nghe nhạc riêng.
          </p>
        </div>

        {/* Featured Mini Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {FEATURED_TRACKS.map((track, idx) => (
            <div
              key={idx}
              className={`neo-box p-5 ${track.color} hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="neo-sticker bg-black text-white text-[10px] font-black">
                    {track.tag}
                  </span>
                  <span className="text-xs font-black text-black border border-black bg-white px-2 py-0.5 rounded-full">
                    {track.year}
                  </span>
                </div>

                <h4 className="text-xl font-black text-black uppercase font-cocogoose mb-1">
                  {track.title}
                </h4>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-black" />
                  {track.views}
                </p>
              </div>

              <div className="pt-6">
                <Link
                  href="/music"
                  className="neo-btn bg-white hover:bg-black hover:text-white text-black text-xs px-3 py-1.5 w-full gap-2 font-black shadow-brutal-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mở Trang Phát Nhạc (96+ Bài)</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Big Banner Link to /music */}
        <div className="neo-box p-6 sm:p-8 bg-brand-yellow text-center space-y-4 shadow-brutal-lg max-w-3xl mx-auto border-3 border-black">
          <div className="inline-flex items-center gap-2 neo-sticker bg-white text-black text-xs font-black">
            <Sparkles className="w-4 h-4 text-amber-600" />
            KHO ÂM NHẠC ĐẦY ĐỦ NHẤT
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-black uppercase font-cocogoose">
            96+ BÀI HÁT, COLLAB & SÂN KHẤU CỦA OSAD
          </h3>
          <p className="text-xs sm:text-sm font-bold text-gray-800 max-w-lg mx-auto">
            Nghe trực tiếp từng bài hát với trình phát YouTube tích hợp, tìm kiếm theo tên hoặc nghệ sĩ đồng hành.
          </p>
          <div>
            <Link
              href="/music"
              className="neo-btn bg-brand-red text-white hover:bg-red-700 px-6 py-3 text-sm sm:text-base font-black gap-2 shadow-brutal"
            >
              <span>Vào Trang Nghe Nhạc Trực Tuyến</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
