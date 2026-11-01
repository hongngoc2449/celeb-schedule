'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryItem, CelebrityProfile } from '@/types';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { getSiteText } from '@/lib/siteTexts';

export default function GallerySection({ gallery, profile }: { gallery: GalleryItem[]; profile?: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 sm:px-8 border-b-3 border-black bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="neo-sticker bg-brand-lightgreen text-black rotate-1 text-xs sm:text-sm font-black">
            {t('gallery_header_tag')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            {t('gallery_section_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            {t('gallery_section_desc')}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="neo-box p-3 bg-[#fffef9] group cursor-pointer hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
            >
              {/* Photo Canvas */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-black bg-gray-100">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="neo-btn bg-white text-black text-xs px-3 py-1.5 gap-1.5 shadow-brutal-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Phóng to
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="pt-3 pb-1 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-black truncate max-w-[200px] font-cocogoose">
                    {item.title}
                  </h4>
                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                    {item.category}
                  </span>
                </div>
                {item.date && (
                  <span className="text-[10px] font-bold bg-amber-100 border border-black px-1.5 py-0.5 rounded">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <div
              className="neo-box bg-white max-w-3xl w-full p-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute -top-4 -right-4 w-9 h-9 bg-brand-red text-white rounded-full border-2 border-black shadow-brutal flex items-center justify-center hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 border-black bg-black">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="pt-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-black font-cocogoose">
                    {activeImage.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600">
                    Chuyên mục: {activeImage.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

