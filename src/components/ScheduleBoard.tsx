'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ScheduleItem, CelebrityProfile } from '@/types';
import { getSiteText } from '@/lib/siteTexts';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
  CalendarPlus,
  Check,
  ChevronRight,
  Info,
  Ticket,
  Music2,
  Flame,
  X
} from 'lucide-react';
import { GeoCircle, GeoS, GeoTriangle, GeoSquare, GeoArch, GeoBar } from '@/components/GeometricDecor';

interface Props {
  initialSchedules: ScheduleItem[];
  profile?: CelebrityProfile;
}

export default function ScheduleBoard({ initialSchedules, profile }: Props) {
  const t = (id: string) => getSiteText(profile?.siteTexts, id);
  const [schedules] = useState<ScheduleItem[]>(initialSchedules);
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | 11 | 12>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected event for Right-side Detail Panel (default to first event)
  const [activeEvent, setActiveEvent] = useState<ScheduleItem>(initialSchedules[2] || initialSchedules[0]);
  const [copiedLink, setCopiedLink] = useState(false);

  const detailPanelRef = useRef<HTMLDivElement>(null);

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      if (selectedMonth !== 'ALL' && item.month !== selectedMonth) {
        return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchLoc = item.location?.toLowerCase().includes(query) || false;
        const matchDate = item.dateDisplay.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchDate) return false;
      }
      return true;
    });
  }, [schedules, selectedMonth, selectedCategory, searchQuery]);

  // Separate November & December
  const novEvents = filteredSchedules.filter((s) => s.month === 11);
  const decEvents = filteredSchedules.filter((s) => s.month === 12);

  const handleSelectEvent = (item: ScheduleItem) => {
    setActiveEvent(item);
    // On mobile devices, smoothly scroll to the detail panel
    if (window.innerWidth < 1024 && detailPanelRef.current) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCopyEventShare = () => {
    const text = `Lịch diễn OSAD (Chủ Tịch Mai): ${activeEvent.title} - Ngày: ${activeEvent.dateDisplay} ${activeEvent.location ? `tại ${activeEvent.location}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (item: ScheduleItem) => {
    const title = encodeURIComponent(`[OSAD - Chủ Tịch Mai] ${item.title}`);
    const details = encodeURIComponent(
      `Lịch công tác chính thức của OSAD (Mai Quang Nam - Chủ Tịch Mai)\n` +
      `Thời gian: ${item.dateDisplay} ${item.time ? `(${item.time})` : ''}\n` +
      `Địa điểm: ${item.venue ? `${item.venue}, ` : ''}${item.location || 'Việt Nam'}\n` +
      (item.organizer ? `Đơn vị tổ chức: ${item.organizer}\n` : '') +
      (item.lineup ? `Khách mời: ${item.lineup}\n` : '') +
      (item.ticketUrl ? `Link vé / sự kiện: ${item.ticketUrl}\n` : '') +
      (item.note ? `Lưu ý Fandom Ô Mai: ${item.note}\n` : '') +
      `Trạng thái: ${item.status === 'TBU' ? 'Dự kiến (TBU)' : 'Đã xác nhận'}`
    );
    const location = encodeURIComponent(`${item.venue ? `${item.venue}, ` : ''}${item.location || 'Việt Nam'}`);
    const cleanDate = item.startDate.replace(/-/g, '');
    const cleanEndDate = (item.endDate ? item.endDate.replace(/-/g, '') : cleanDate);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${cleanDate}/${cleanEndDate}`;
  };

  // Helper for location badge styling
  const getLocationBadgeClass = (color?: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-amber-300 text-amber-950 border-amber-600';
      case 'purple':
        return 'bg-purple-200 text-purple-950 border-purple-500';
      case 'green':
        return 'bg-emerald-200 text-emerald-950 border-emerald-500';
      case 'pink':
        return 'bg-pink-200 text-pink-950 border-pink-500';
      case 'cyan':
        return 'bg-cyan-200 text-cyan-950 border-cyan-500';
      default:
        return 'bg-gray-200 text-gray-900 border-gray-400';
    }
  };

  return (
    <section id="schedule" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 bg-[#f3ede2] relative overflow-hidden">
      {/* Background Floating Geometric Decors */}
      <div className="absolute top-16 left-6 hidden xl:block opacity-60 -rotate-12 pointer-events-none select-none">
        <GeoTriangle className="w-12 h-12" strokeWidth={3.5} color="#16A34A" />
      </div>
      <div className="absolute top-28 right-8 hidden xl:block opacity-60 rotate-45 pointer-events-none select-none">
        <GeoS className="w-12 h-12" strokeWidth={3.5} color="#2563EB" />
      </div>
      <div className="absolute bottom-20 left-10 hidden xl:block opacity-60 rotate-12 pointer-events-none select-none">
        <GeoCircle className="w-12 h-12" strokeWidth={3.5} color="#DC2626" />
      </div>
      <div className="absolute bottom-32 right-12 hidden xl:block opacity-60 -rotate-6 pointer-events-none select-none">
        <GeoSquare className="w-11 h-11" strokeWidth={3.5} color="#D97706" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header Controls */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 neo-sticker bg-brand-yellow text-black -rotate-1 text-sm font-black">
            <Calendar className="w-4 h-4 text-brand-red" />
            {t('schedule_header_tag')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase font-cocogoose">
            {t('schedule_section_title')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
            {t('schedule_section_desc')}
          </p>

          {/* Filter Bar */}
          <div className="neo-box p-4 bg-white max-w-5xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Month Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedMonth('ALL')}
                  className={`neo-btn px-3.5 py-1.5 text-xs sm:text-sm whitespace-nowrap ${
                    selectedMonth === 'ALL'
                      ? 'bg-brand-red text-white'
                      : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                >
                  {t('schedule_tab_all')} ({schedules.length})
                </button>
                <button
                  onClick={() => setSelectedMonth(11)}
                  className={`neo-btn px-3.5 py-1.5 text-xs sm:text-sm whitespace-nowrap ${
                    selectedMonth === 11
                      ? 'bg-brand-yellow text-black font-black'
                      : 'bg-white hover:bg-amber-100 text-black'
                  }`}
                >
                  {t('schedule_tab_nov')} ({schedules.filter((s) => s.month === 11).length})
                </button>
                <button
                  onClick={() => setSelectedMonth(12)}
                  className={`neo-btn px-3.5 py-1.5 text-xs sm:text-sm whitespace-nowrap ${
                    selectedMonth === 12
                      ? 'bg-brand-green text-white font-black'
                      : 'bg-white hover:bg-emerald-100 text-black'
                  }`}
                >
                  {t('schedule_tab_dec')} ({schedules.filter((s) => s.month === 12).length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('schedule_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="neo-input pl-10 pr-3 py-1.5 text-xs sm:text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* EXPANDED 2-COLUMN LAYOUT: CLIPBOARD (LEFT) + DETAIL PANEL (RIGHT) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: THE REALISTIC CLIPBOARD SCHEDULE (7 COLS)       */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-7 xl:col-span-7 relative">
            {/* Outer Clipboard Frame */}
            <div className="bg-[#b58b56] p-4 sm:p-6 rounded-[26px] border-4 border-black shadow-brutal-xl relative">
              
              {/* Top Metallic Clamp */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className="w-7 h-7 bg-white rounded-full border-3 border-black shadow-brutal-sm mb-1 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 bg-black rounded-full" />
                </div>
                <div className="w-40 sm:w-56 h-10 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-t-lg border-3 border-black shadow-brutal flex items-center justify-around px-4">
                  <div className="w-3 h-3 bg-gray-600 rounded-full border border-black shadow-inner" />
                  <div className="w-16 sm:w-24 h-1.5 bg-gray-500 rounded-full" />
                  <div className="w-3 h-3 bg-gray-600 rounded-full border border-black shadow-inner" />
                </div>
              </div>

              {/* Paper Sheet */}
              <div className="paper-sheet bg-white rounded-[18px] border-3 border-black p-4 sm:p-7 pt-10 sm:pt-14 relative min-h-[850px] shadow-inner">
                
                {/* Header Labels inside Paper */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  {/* Sticker Title */}
                  <div className="neo-box-sm bg-[#1e2a38] text-white px-3.5 py-1.5 rotate-[-3deg] inline-block shadow-brutal border-3 border-black">
                    <span className="block text-sm sm:text-base font-black text-amber-400 uppercase tracking-tight font-cocogoose">
                      {t('schedule_paper_title')}
                    </span>
                  </div>

                  {/* Geometric Deco Pill */}
                  <div className="hidden md:inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border-2 border-black shadow-brutal-xs -rotate-1 self-center">
                    <GeoCircle className="w-3.5 h-3.5" color="#DC2626" />
                    <GeoS className="w-3.5 h-3.5" color="#2563EB" />
                    <GeoTriangle className="w-3.5 h-3.5" color="#16A34A" />
                    <GeoSquare className="w-3.5 h-3.5" color="#D97706" />
                  </div>

                  {/* Post-it Note */}
                  <div className="bg-[#fff382] border-2 border-black p-2.5 rounded shadow-brutal rotate-[4deg] text-center min-w-[110px]">
                    <span className="text-xs sm:text-sm font-black text-brand-red block font-cocogoose">
                      {t('schedule_postit_title')}
                    </span>
                  </div>
                </div>

                {/* LIST OF EVENTS */}
                <div className="space-y-6">
                  {/* NOVEMBER */}
                  {(selectedMonth === 'ALL' || selectedMonth === 11) && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 pb-1 border-b-2 border-dashed border-gray-300">
                        <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
                          THÁNG 11
                        </span>
                      </div>

                      {novEvents.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">Không tìm thấy sự kiện nào.</p>
                      ) : (
                        novEvents.map((item) => {
                          const isSelected = activeEvent?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectEvent(item)}
                              className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-amber-100 border-black shadow-brutal translate-x-1 ring-2 ring-brand-red'
                                  : 'border-gray-200 hover:border-black hover:bg-amber-50/70 hover:shadow-brutal-sm'
                              }`}
                            >
                              {/* Date Display */}
                              <span className="text-base sm:text-lg font-black text-[#e84118] whitespace-nowrap font-cocogoose min-w-[70px]">
                                {item.dateDisplay}
                              </span>

                              {/* Content */}
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.category === 'STAGE' && (
                                    <span className="text-[11px] font-black text-black">
                                      (STAGE)
                                    </span>
                                  )}
                                  <h4 className="text-xs sm:text-sm font-extrabold text-black uppercase leading-tight font-cocogoose">
                                    {item.title}
                                  </h4>
                                  {item.noteIcon && (
                                    <span className="text-sm">{item.noteIcon}</span>
                                  )}
                                  {item.status === 'TBU' && (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1 rounded border border-orange-300">
                                      (TBU)
                                    </span>
                                  )}
                                </div>

                                {/* Location */}
                                {item.location && (
                                  <div>
                                    <span
                                      className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getLocationBadgeClass(
                                        item.locationColor
                                      )}`}
                                    >
                                      📍 {item.location}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Arrow icon */}
                              <div className="self-center">
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${
                                    isSelected ? 'text-brand-red translate-x-0.5' : 'text-gray-400'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* DECEMBER */}
                  {(selectedMonth === 'ALL' || selectedMonth === 12) && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 pb-1 border-b-2 border-dashed border-gray-300">
                        <span className="neo-sticker bg-brand-green text-white text-xs font-black">
                          THÁNG 12
                        </span>
                      </div>

                      {decEvents.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">Không tìm thấy sự kiện nào.</p>
                      ) : (
                        decEvents.map((item) => {
                          const isSelected = activeEvent?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectEvent(item)}
                              className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-emerald-100 border-black shadow-brutal translate-x-1 ring-2 ring-brand-green'
                                  : 'border-gray-200 hover:border-black hover:bg-emerald-50/70 hover:shadow-brutal-sm'
                              }`}
                            >
                              {/* Date Display */}
                              <span className="text-base sm:text-lg font-black text-[#218c54] whitespace-nowrap font-cocogoose min-w-[70px]">
                                {item.dateDisplay}
                              </span>

                              {/* Content */}
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.category === 'STAGE' && (
                                    <span className="text-[11px] font-black text-black">
                                      (STAGE)
                                    </span>
                                  )}
                                  <h4 className="text-xs sm:text-sm font-extrabold text-black uppercase leading-tight font-cocogoose">
                                    {item.title}
                                  </h4>
                                  {item.noteIcon && (
                                    <span className="text-sm">{item.noteIcon}</span>
                                  )}
                                  {item.status === 'TBU' && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded border border-emerald-300">
                                      (TBU)
                                    </span>
                                  )}
                                </div>

                                {/* Location */}
                                {item.location && (
                                  <div>
                                    <span
                                      className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getLocationBadgeClass(
                                        item.locationColor
                                      )}`}
                                    >
                                      📍 {item.location}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Arrow icon */}
                              <div className="self-center">
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${
                                    isSelected ? 'text-brand-green translate-x-0.5' : 'text-gray-400'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Footer of Clipboard */}
                <div className="mt-12 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-gray-600 uppercase">
                      *LỊCH TRÌNH DỰ KIẾN
                    </p>
                    <p className="text-[10px] font-semibold text-gray-500">
                      DỮ LIỆU SẼ ĐƯỢC CẬP NHẬT LIÊN TỤC THEO THỰC TẾ
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider block text-black font-cocogoose">
                      CHỦ TỊCH
                    </span>
                    <div className="inline-block relative">
                      <span className="font-serif italic text-2xl font-black text-black tracking-widest border-b-2 border-black pb-0.5">
                        OSAD
                      </span>
                      <span className="block text-[10px] font-bold text-gray-500">Mai Quang Nam</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT COLUMN: EVENT DETAIL PANEL (STICKY ON DESKTOP) (5 COLS)*/}
          {/* ------------------------------------------------------------ */}
          <div ref={detailPanelRef} className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 space-y-4">
            {activeEvent ? (
              <div className="neo-box p-6 bg-white border-3 border-black shadow-brutal-xl relative overflow-hidden transition-all animate-fadeIn">
                
                {/* Top Corner Ribbon / Mascot Badge */}
                <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
                      {activeEvent.category}
                    </span>
                    {activeEvent.noteIcon && (
                      <span className="text-xl">{activeEvent.noteIcon}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeEvent.status === 'TBU' ? (
                      <span className="text-xs font-black text-orange-700 bg-orange-100 border border-orange-400 px-2.5 py-0.5 rounded-full">
                        ⏳ Chưa chốt giờ (TBU)
                      </span>
                    ) : (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Đã xác nhận
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Event Title */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                    <Calendar className="w-4 h-4 text-brand-red" />
                    <span>Lịch Trình Tháng {activeEvent.month}/{activeEvent.year}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-black uppercase leading-tight font-cocogoose">
                    {activeEvent.title}
                  </h3>

                  {/* Big Date Banner */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-black rounded-xl flex items-center justify-between shadow-brutal-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-600 block">Thời gian tổ chức</span>
                      <span className="text-xl sm:text-2xl font-black text-[#e84118] font-cocogoose">
                        {activeEvent.dateDisplay}
                      </span>
                      {activeEvent.time && (
                        <span className="block text-xs font-black text-black mt-0.5">
                          ⏰ Giờ diễn: {activeEvent.time}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 block">Năm</span>
                      <span className="text-lg font-black text-black font-cocogoose">{activeEvent.year}</span>
                      {activeEvent.endDate && activeEvent.endDate !== activeEvent.startDate && (
                        <span className="block text-[10px] font-bold text-gray-600">
                          Đến {activeEvent.endDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="neo-box-sm p-4 bg-[#fffef9] space-y-2 mb-5">
                  <span className="text-[11px] font-black uppercase text-gray-500 flex items-center gap-1.5 font-cocogoose">
                    <MapPin className="w-4 h-4 text-brand-red" />
                    Địa Điểm & Khu Vực
                  </span>
                  <div className="space-y-1.5">
                    {activeEvent.venue && (
                      <div className="text-sm font-black text-black flex items-center gap-1.5">
                        <span className="text-brand-red">🏛️ Sân khấu:</span>
                        <span>{activeEvent.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-extrabold text-gray-800">
                        📍 {activeEvent.location || 'Địa điểm đang được Ban Tổ Chức cập nhật'}
                      </span>
                      {(activeEvent.location || activeEvent.venue) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${activeEvent.venue ? `${activeEvent.venue}, ` : ''}${activeEvent.location || ''}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="neo-btn bg-white hover:bg-gray-100 text-xs px-2.5 py-1 gap-1"
                        >
                          <span>Bản đồ</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Program & Performance Info */}
                <div className="space-y-3 mb-5">
                  <h5 className="text-xs font-black uppercase text-gray-700 flex items-center gap-1.5 font-cocogoose">
                    <Music2 className="w-4 h-4 text-brand-blue" />
                    Thông Tin Biểu Diễn & Nghệ Sĩ
                  </h5>

                  <div className="p-3 bg-gray-50 border-2 border-black rounded-xl space-y-2 text-xs font-bold text-gray-800">
                    <p className="flex items-center gap-2">
                      <span className="text-brand-red font-black">Nghệ sĩ:</span>
                      <span>OSAD (Mai Quang Nam - Chủ Tịch Mai)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-700 font-black">Đơn vị tổ chức:</span>
                      <span>{activeEvent.organizer || (activeEvent.category === 'CONCERT' ? 'Đại Nhạc Hội & Ekip Sản Xuất' : 'Brand & Management Team')}</span>
                    </p>
                    {activeEvent.lineup && (
                      <p className="flex items-center gap-2">
                        <span className="text-purple-700 font-black">Khách mời / Lineup:</span>
                        <span>{activeEvent.lineup}</span>
                      </p>
                    )}
                    {activeEvent.ticketInfo && (
                      <p className="flex items-center gap-2">
                        <span className="text-amber-700 font-black">Thông tin vé:</span>
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-extrabold">{activeEvent.ticketInfo}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="text-brand-blue font-black">Bản hit tiêu biểu:</span>
                      <span>Người Âm Phủ, Củ Lạc, Anh Mệt Rồi...</span>
                    </p>
                  </div>
                </div>

                {/* Fandom Custom Note (if available) */}
                {activeEvent.note && (
                  <div className="p-3.5 bg-yellow-50 border-2 border-black rounded-xl space-y-1 mb-5 shadow-brutal-xs">
                    <span className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1.5 font-cocogoose">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Lưu Ý Cho Fandom Ô Mai
                    </span>
                    <p className="text-xs font-bold text-gray-800 leading-relaxed">
                      {activeEvent.note}
                    </p>
                  </div>
                )}

                {/* Action Buttons for Fans */}
                <div className="space-y-2.5 pt-2 border-t-2 border-gray-200">
                  {/* Direct Ticket / Livestream Link Button (if available) */}
                  {activeEvent.ticketUrl && (
                    <a
                      href={activeEvent.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neo-btn bg-brand-red hover:bg-red-700 text-white w-full py-2.5 text-xs sm:text-sm font-black gap-2 shadow-brutal"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{activeEvent.ticketInfo ? `${activeEvent.ticketInfo} - Mở Liên Kết Ngay` : 'Mở Link Mua Vé / Xem Livestream'}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </a>
                  )}

                  {/* Google Calendar button */}
                  <a
                    href={getGoogleCalendarUrl(activeEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black w-full py-2.5 text-xs sm:text-sm font-black gap-2 shadow-brutal"
                  >
                    <CalendarPlus className="w-4 h-4 text-brand-red" />
                    <span>Lưu Vào Google Calendar</span>
                  </a>

                  {/* Share / Copy button */}
                  <button
                    onClick={handleCopyEventShare}
                    className="neo-btn bg-white hover:bg-brand-pink text-black w-full py-2 text-xs sm:text-sm font-black gap-2 shadow-brutal-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-green-700" />
                        <span className="text-green-800">Đã Sao Chép Lịch Trình!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-brand-blue" />
                        <span>Sao Chép & Chia Sẻ Cho Bạn Bè</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Fandom Note Footer */}
                <div className="mt-5 p-3 bg-pink-50 rounded-lg border border-pink-300 text-[11px] font-semibold text-gray-700 flex items-start gap-2">
                  <Info className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <p>
                    {t('schedule_fandom_footer')}
                  </p>
                </div>

              </div>
            ) : (
              <div className="neo-box p-8 bg-white border-3 border-black text-center space-y-3">
                <Info className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="font-black text-base text-black font-cocogoose">CHƯA CHỌN SỰ KIỆN</h4>
                <p className="text-xs text-gray-500 font-bold">
                  Vui lòng chọn sự kiện để xem chi tiết.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
