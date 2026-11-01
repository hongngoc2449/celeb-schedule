import Image from 'next/image';
import { CelebrityProfile } from '@/types';
import { Award, Music, Heart, Mic2 } from 'lucide-react';
import { GeoCircle, GeoCross, GeoTriangle, GeoSquare, GeoCluster } from '@/components/GeometricDecor';

export default function AboutSection({ profile }: { profile: CelebrityProfile }) {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-white relative overflow-hidden">
      {/* Background Geometric Icons */}
      <div className="absolute top-10 right-8 hidden md:block opacity-40 rotate-12 pointer-events-none">
        <GeoSquare className="w-10 h-10" color="#EA580C" />
      </div>
      <div className="absolute bottom-10 left-8 hidden md:block opacity-40 -rotate-12 pointer-events-none">
        <GeoCircle className="w-10 h-10" color="#DC2626" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="neo-sticker bg-brand-pink text-black -rotate-1 text-xs sm:text-sm font-black">
              ⚡ PROFILE & BIO
            </span>
            <GeoCluster className="hidden sm:inline-flex" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            TIỂU SỬ & PHONG CÁCH
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            Hành trình sáng tạo nghệ thuật độc bản và dấu ấn âm nhạc rực rỡ của {profile.fullName} cùng Fandom Ô Mai.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Graphic Card with Mascot */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square bg-[#fff8db] border-3 border-black rounded-3xl p-6 shadow-brutal flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
                  OFFSET W OSAD
                </span>
                <span className="text-xs font-black text-brand-red bg-red-100 px-2 py-0.5 rounded border border-black">
                  FANDOM Ô MAI
                </span>
              </div>

              {/* Mascot Logo Center */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-40 h-24 relative mb-2">
                  <Image
                    src="/images/logo 2.png"
                    alt="Logo OFFSET W OSAD"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-black text-black font-cocogoose">CHỦ TỊCH MAI</h3>
                <p className="text-xs font-bold text-brand-red uppercase">MAI QUANG NAM • RAPPER & SONGWRITER</p>
              </div>

              <div className="bg-white border-2 border-black rounded-xl p-3 text-center shadow-brutal-sm">
                <p className="text-xs font-bold text-gray-800">
                  &quot;Người tạo nên giai điệu vui vẻ, tích cực cho mọi tâm hồn Ô Mai&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bio Details & Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="neo-box p-6 sm:p-8 bg-brand-paper space-y-4">
              <h3 className="text-2xl font-black text-black uppercase font-cocogoose flex items-center gap-2">
                <Mic2 className="w-6 h-6 text-brand-red" />
                Về {profile.stageName} ({profile.title})
              </h3>
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-relaxed">
                {profile.bio}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">Anh Trai Vượt Ngàn Chông Gai</h5>
                    <p className="text-xs font-semibold text-gray-600">Thành viên nổi bật truyền cảm hứng 2024</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Music className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">Kho 96+ Sản Phẩm Âm Nhạc</h5>
                    <p className="text-xs font-semibold text-gray-600">Hit solo, collab, stage và các sản phẩm tự sản xuất</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <Heart className="w-6 h-6 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-sm text-black">Đại Gia Đình Fandom Ô Mai</h5>
                    <p className="text-xs font-semibold text-gray-600">Cộng đồng fan thân yêu & gắn kết nhất</p>
                  </div>
                </div>

                <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm flex items-start gap-3">
                  <span className="text-xl">🎹</span>
                  <div>
                    <h5 className="font-extrabold text-sm text-black">Sáng Tác & Sản Xuất</h5>
                    <p className="text-xs font-semibold text-gray-600">Tự sáng tác lời, giai điệu và tham gia sản xuất âm nhạc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
