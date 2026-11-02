'use client';

import { useState } from 'react';
import { CelebrityProfile } from '@/types';
import { Mail, Copy, Check, ExternalLink, Globe, Sparkles, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { OsadOmaiStampBadge, GeoCluster, GeoTriangle, GeoCross, GeoCircle } from '@/components/GeometricDecor';
import { getSiteText } from '@/lib/siteTexts';

export default function FandomSocialSection({ profile }: { profile: CelebrityProfile }) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const blog = profile.blogContact || {
    blogName: 'OwO_Offset with OSAD',
    email: 'owo_offsetwithosad',
    facebook: 'https://www.facebook.com/share/1F3py3TZaL/?mibextid=wwXIfr',
    threads: 'https://www.threads.com/@owo_offsetwithosad?igshid=NTc4MTIwNjQ2YQ==',
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(blog.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#f5ede2] relative overflow-hidden">
      {/* Background Floating Decors */}
      <div className="absolute top-12 left-10 hidden lg:block opacity-40 -rotate-12 pointer-events-none">
        <GeoCross className="w-10 h-10" color="#2563EB" />
      </div>
      <div className="absolute bottom-12 right-10 hidden lg:block opacity-40 rotate-12 pointer-events-none">
        <GeoCircle className="w-10 h-10" color="#DC2626" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="neo-sticker bg-brand-yellow text-black -rotate-1 text-xs sm:text-sm font-black">
              {t('contact_header_tag')}
            </span>
            <GeoCluster className="hidden sm:inline-flex" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black uppercase font-cocogoose">
            {t('contact_section_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-xl mx-auto">
            {t('contact_section_desc')}
          </p>
        </div>

        {/* Main Blog Contact Box */}
        <div className="neo-box p-6 sm:p-10 bg-white border-3 border-black shadow-brutal-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: Mascot & Blog Identity Card (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center text-center p-6 bg-[#fff9e6] rounded-2xl border-3 border-black shadow-brutal-sm space-y-3">
              <div className="w-20 h-20 bg-brand-yellow rounded-2xl border-3 border-black shadow-brutal flex items-center justify-center p-2 rotate-2">
                <Image
                  src="/images/logo 3.png"
                  alt="OwO Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div>
                <span className="neo-sticker bg-brand-red text-white text-[10px] font-black uppercase">
                  {t('contact_blog_tag')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black font-cocogoose mt-2">
                  {blog.blogName || t('contact_blog_name')}
                </h3>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  {t('contact_blog_desc')}
                </p>
              </div>

              <div className="w-full pt-2 flex flex-col items-center gap-2.5">
                <span className="inline-block text-[11px] font-black bg-pink-100 text-pink-900 border border-black px-3 py-1 rounded-full">
                  {t('contact_fandom_tag')}
                </span>
                <OsadOmaiStampBadge className="scale-90" />
              </div>
            </div>

            {/* Right: Direct Contact Links (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Mail Card */}
              <div className="p-4 bg-amber-50 rounded-xl border-2 border-black flex items-center justify-between gap-3 shadow-brutal-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-brand-yellow text-black rounded-lg border-2 border-black flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-red" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-gray-500 block">
                      Mail Liên Hệ
                    </span>
                    <span className="text-sm sm:text-base font-black text-black font-mono truncate block">
                      {blog.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="neo-btn bg-white hover:bg-brand-yellow text-xs px-3 py-1.5 gap-1.5 shrink-0 shadow-brutal-sm"
                  title="Sao chép Mail"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-green-800">Đã copy</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Facebook Card */}
              <a
                href={blog.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-black flex items-center justify-between gap-3 shadow-brutal-sm transition-all group block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-brand-blue text-white rounded-lg border-2 border-black flex items-center justify-center font-black text-lg shrink-0">
                    f
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-blue-800 block">
                      Facebook Fanpage
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-black group-hover:underline truncate block">
                      OwO_Offset with OSAD
                    </span>
                  </div>
                </div>

                <div className="neo-btn bg-white group-hover:bg-brand-blue group-hover:text-white text-xs px-3 py-1.5 gap-1 shrink-0">
                  <span>Truy cập</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

              {/* Threads Card */}
              <a
                href={blog.threads}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-black flex items-center justify-between gap-3 shadow-brutal-sm transition-all group block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-black text-white rounded-lg border-2 border-black flex items-center justify-center font-black text-sm shrink-0">
                    @
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-gray-700 block">
                      Threads
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-black group-hover:underline truncate block">
                      @owo_offsetwithosad
                    </span>
                  </div>
                </div>

                <div className="neo-btn bg-white group-hover:bg-black group-hover:text-white text-xs px-3 py-1.5 gap-1 shrink-0">
                  <span>Theo dõi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
