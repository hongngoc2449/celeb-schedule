import { SiteTextDefinition } from '@/types';

export const SITE_TEXT_DEFINITIONS: SiteTextDefinition[] = [
  // 1. Header & Menu
  {
    id: 'header_logo_title',
    section: 'Header & Logo',
    location: 'Chữ thương hiệu logo chính',
    defaultValue: 'OwO',
  },
  {
    id: 'header_logo_badge',
    section: 'Header & Logo',
    location: 'Nhãn badge đỏ cạnh logo',
    defaultValue: 'BẢO TRỢ KÍP NỔ',
  },
  {
    id: 'header_logo_subtitle',
    section: 'Header & Logo',
    location: 'Dòng chữ phụ dưới logo',
    defaultValue: 'Offset with OSAD • Fandom Ô Mai',
  },
  {
    id: 'header_nav_schedule',
    section: 'Header & Logo',
    location: 'Nút Menu: Lịch Trình',
    defaultValue: 'Lịch Trình',
  },
  {
    id: 'header_nav_music',
    section: 'Header & Logo',
    location: 'Nút Menu: Âm nhạc/Show',
    defaultValue: 'Âm nhạc/Show',
  },
  {
    id: 'header_nav_about',
    section: 'Header & Logo',
    location: 'Nút Menu: Tiểu Sử',
    defaultValue: 'Tiểu Sử',
  },
  {
    id: 'header_nav_gallery',
    section: 'Header & Logo',
    location: 'Nút Menu: Thư Viện',
    defaultValue: 'Thư Viện',
  },

  // 2. Banner Hero
  {
    id: 'hero_sticker_hot',
    section: 'Banner Hero',
    location: 'Sticker đỏ góc trên',
    defaultValue: '🔥 HOT SCHEDULE 2026',
  },
  {
    id: 'hero_sticker_fandom',
    section: 'Banner Hero',
    location: 'Sticker vàng góc trên',
    defaultValue: '🍬 FANDOM Ô MAI',
  },
  {
    id: 'hero_title_prefix',
    section: 'Banner Hero',
    location: 'Dòng tiêu đề chính 1',
    defaultValue: 'LỊCH CÔNG TÁC',
  },
  {
    id: 'hero_title_highlight',
    section: 'Banner Hero',
    location: 'Dòng tiêu đề chính 2 (Nền vàng)',
    defaultValue: 'CHỦ TỊCH MAI',
  },
  {
    id: 'hero_description',
    section: 'Banner Hero',
    location: 'Đoạn văn giới thiệu dưới tiêu đề',
    defaultValue:
      'Cổng thông tin & cập nhật lịch trình biểu diễn, concert, livestream và toàn bộ âm nhạc chính thức của Rapper / Songwriter OSAD (Mai Quang Nam) dành cho đại gia đình Ô Mai.',
  },
  {
    id: 'hero_quote',
    section: 'Banner Hero',
    location: 'Khung trích dẫn nổi bật (Quote)',
    defaultValue: 'Làm nhạc bằng cả trái tim, bùng nổ trên mọi sân khấu!',
  },
  {
    id: 'hero_btn_schedule',
    section: 'Banner Hero',
    location: 'Nút vàng: Xem lịch trình',
    defaultValue: 'Xem Lịch Trình Ngay',
  },
  {
    id: 'hero_btn_music',
    section: 'Banner Hero',
    location: 'Nút trắng: Mở kho nhạc',
    defaultValue: 'Kho Âm Nhạc & Show',
  },
  {
    id: 'hero_brand_tag',
    section: 'Banner Hero',
    location: 'Thanh chữ thương hiệu dưới nút bấm',
    defaultValue: '✦ Cổng lịch trình & kho nhạc nghệ sĩ chính thức ✦',
  },
  {
    id: 'hero_photo_badge_title',
    section: 'Banner Hero',
    location: 'Tiêu đề dưới khung ảnh',
    defaultValue: 'CHỦ TỊCH MAI',
  },
  {
    id: 'hero_photo_badge_sub',
    section: 'Banner Hero',
    location: 'Dòng phụ dưới khung ảnh',
    defaultValue: 'OSAD • SONGWRITER & RAPPER • FANDOM Ô MAI',
  },
  {
    id: 'hero_photo_sticker',
    section: 'Banner Hero',
    location: 'Sticker đỏ đính góc ảnh',
    defaultValue: 'Offset with OSAD',
  },

  // 3. Khu Vực Lịch Trình (Schedule)
  {
    id: 'schedule_header_tag',
    section: 'Lịch Trình',
    location: 'Nhãn badge đầu mục lịch trình',
    defaultValue: 'OFFICIAL TOUR & EVENT DATES',
  },
  {
    id: 'schedule_section_title',
    section: 'Lịch Trình',
    location: 'Tiêu đề mục Lịch Trình',
    defaultValue: 'LỊCH CÔNG TÁC CHỦ TỊCH MAI',
  },
  {
    id: 'schedule_section_desc',
    section: 'Lịch Trình',
    location: 'Mô tả mục Lịch Trình',
    defaultValue:
      'Lịch trình biểu diễn, shooting và sự kiện chính thức tháng 11 & 12/2026 của Chủ Tịch Mai.',
  },
  {
    id: 'schedule_tab_all',
    section: 'Lịch Trình',
    location: 'Nút lọc: Tất cả sự kiện',
    defaultValue: 'Tất Cả',
  },
  {
    id: 'schedule_tab_nov',
    section: 'Lịch Trình',
    location: 'Nút lọc: Tháng 11',
    defaultValue: 'Tháng 11',
  },
  {
    id: 'schedule_tab_dec',
    section: 'Lịch Trình',
    location: 'Nút lọc: Tháng 12',
    defaultValue: 'Tháng 12',
  },
  {
    id: 'schedule_search_placeholder',
    section: 'Lịch Trình',
    location: 'Placeholder ô tìm kiếm lịch trình',
    defaultValue: 'Tìm show, địa điểm, ngày...',
  },
  {
    id: 'schedule_paper_title',
    section: 'Lịch Trình',
    location: 'Tiêu đề ghim trên giấy kẹp',
    defaultValue: 'LỊCH CÔNG TÁC CHỦ TỊCH MAI',
  },
  {
    id: 'schedule_postit_title',
    section: 'Lịch Trình',
    location: 'Mẩu giấy note dán góc bảng lịch',
    defaultValue: 'THÁNG 11 & 12 ★ 2026 ✔',
  },
  {
    id: 'schedule_fandom_footer',
    section: 'Lịch Trình',
    location: 'Thông báo Fandom ở đáy cột chi tiết',
    defaultValue:
      'Lịch trình chính thức được cập nhật cho gia đình Fandom Ô Mai. Mọi thông tin thay đổi sẽ được thông báo ngay tại đây và fanpage chính thức.',
  },

  // 4. Khu Vực Âm Nhạc (Trang Chủ & /music)
  {
    id: 'discography_header_tag',
    section: 'Kho Âm Nhạc',
    location: 'Nhãn badge đầu mục âm nhạc',
    defaultValue: '🎵 DISCOGRAPHY',
  },
  {
    id: 'discography_title',
    section: 'Kho Âm Nhạc',
    location: 'Tiêu đề mục Âm Nhạc Trang Chủ',
    defaultValue: 'ÂM NHẠC & BẢN HIT NỔI BẬT',
  },
  {
    id: 'discography_desc',
    section: 'Kho Âm Nhạc',
    location: 'Mô tả mục Âm Nhạc Trang Chủ',
    defaultValue:
      'Những bản hit làm nên tên tuổi của OSAD (Chủ Tịch Mai). Toàn bộ danh sách các ca khúc đã được tổng hợp tại trang nghe nhạc riêng.',
  },
  {
    id: 'discography_banner_tag',
    section: 'Kho Âm Nhạc',
    location: 'Nhãn badge banner vàng mời nghe nhạc',
    defaultValue: 'KHO ÂM NHẠC & SHOW',
  },
  {
    id: 'discography_banner_title',
    section: 'Kho Âm Nhạc',
    location: 'Tiêu đề banner vàng mời nghe nhạc',
    defaultValue: 'BÀI HÁT & SHOW/TALKSHOW CỦA OSAD',
  },
  {
    id: 'discography_banner_desc',
    section: 'Kho Âm Nhạc',
    location: 'Mô tả banner vàng mời nghe nhạc',
    defaultValue:
      'Nghe trực tiếp từng bài hát với trình phát YouTube tích hợp, cùng danh sách các show, talkshow và phỏng vấn chính thức (*sưu tập từ nhiều nguồn, khả năng chưa đầy đủ).',
  },
  {
    id: 'discography_banner_btn',
    section: 'Kho Âm Nhạc',
    location: 'Nút đỏ bấm vào trang nghe nhạc',
    defaultValue: 'Vào Trang Nghe Nhạc Trực Tuyến',
  },
  {
    id: 'music_page_title',
    section: 'Kho Âm Nhạc',
    location: 'Tiêu đề đầu trang riêng /music',
    defaultValue: 'KHO ÂM NHẠC & SHOW CỦA OSAD',
  },
  {
    id: 'music_page_desc',
    section: 'Kho Âm Nhạc',
    location: 'Mô tả trang riêng /music',
    defaultValue:
      'Tổng hợp bài hát, sản phẩm solo, collab và sân khấu của Chủ Tịch Mai (Mai Quang Nam) (*sưu tập từ nhiều nguồn, khả năng chưa đầy đủ).',
  },

  // 5. Tiểu Sử & Bio
  {
    id: 'about_header_tag',
    section: 'Tiểu Sử & Bio',
    location: 'Nhãn badge mục tiểu sử',
    defaultValue: '⚡ PROFILE & BIO',
  },
  {
    id: 'about_section_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề mục Tiểu Sử',
    defaultValue: 'TIỂU SỬ & PHONG CÁCH',
  },
  {
    id: 'about_section_desc',
    section: 'Tiểu Sử & Bio',
    location: 'Mô tả hành trình âm nhạc',
    defaultValue:
      'Hành trình sáng tạo nghệ thuật độc bản và dấu ấn âm nhạc rực rỡ của Mai Quang Nam cùng Fandom Ô Mai.',
  },
  {
    id: 'about_card_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề thẻ logo mascot bên trái',
    defaultValue: 'CHỦ TỊCH MAI',
  },
  {
    id: 'about_card_subtitle',
    section: 'Tiểu Sử & Bio',
    location: 'Dòng phụ thẻ logo mascot',
    defaultValue: 'MAI QUANG NAM • RAPPER & SONGWRITER',
  },
  {
    id: 'about_card_quote',
    section: 'Tiểu Sử & Bio',
    location: 'Câu nói dưới thẻ mascot',
    defaultValue: '"Người tạo nên giai điệu vui vẻ, tích cực cho mọi tâm hồn Ô Mai"',
  },
  {
    id: 'about_highlight_1_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề điểm nhấn 1',
    defaultValue: 'Anh Trai Vượt Ngàn Chông Gai',
  },
  {
    id: 'about_highlight_1_desc',
    section: 'Tiểu Sử & Bio',
    location: 'Mô tả điểm nhấn 1',
    defaultValue: 'Thành viên nổi bật truyền cảm hứng 2024',
  },
  {
    id: 'about_highlight_2_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề điểm nhấn 2',
    defaultValue: 'Kho Sản Phẩm Âm Nhạc & Show',
  },
  {
    id: 'about_highlight_2_desc',
    section: 'Tiểu Sử & Bio',
    location: 'Mô tả điểm nhấn 2',
    defaultValue: 'Hit solo, collab, stage và các sản phẩm tự sản xuất',
  },
  {
    id: 'about_highlight_3_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề điểm nhấn 3',
    defaultValue: 'Đại Gia Đình Fandom Ô Mai',
  },
  {
    id: 'about_highlight_3_desc',
    section: 'Tiểu Sử & Bio',
    location: 'Mô tả điểm nhấn 3',
    defaultValue: 'Cộng đồng fan thân yêu & gắn kết nhất',
  },
  {
    id: 'about_highlight_4_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề điểm nhấn 4',
    defaultValue: 'Sáng Tác & Sản Xuất',
  },
  {
    id: 'about_highlight_4_desc',
    section: 'Tiểu Sử & Bio',
    location: 'Mô tả điểm nhấn 4',
    defaultValue: 'Tự sáng tác lời, giai điệu và tham gia sản xuất âm nhạc',
  },
  {
    id: 'about_social_title',
    section: 'Tiểu Sử & Bio',
    location: 'Tiêu đề khối Mạng xã hội',
    defaultValue: 'MẠNG XÃ HỘI CHỦ TỊCH MAI',
  },

  // 6. Thư Viện Ảnh (Gallery)
  {
    id: 'gallery_header_tag',
    section: 'Thư Viện Ảnh',
    location: 'Nhãn badge đầu mục ảnh',
    defaultValue: '📸 OFFICIAL MOMENTS',
  },
  {
    id: 'gallery_section_title',
    section: 'Thư Viện Ảnh',
    location: 'Tiêu đề mục Thư Viện Ảnh',
    defaultValue: 'HÌNH ẢNH & KHOẢNH KHẮC',
  },
  {
    id: 'gallery_section_desc',
    section: 'Thư Viện Ảnh',
    location: 'Mô tả bộ sưu tập ảnh',
    defaultValue:
      'Bộ sưu tập hình ảnh biểu diễn, concert, hậu trường và các photoshoot độc quyền của Chủ Tịch Mai.',
  },

  // 7. Blog & Fandom Contact
  {
    id: 'contact_header_tag',
    section: 'Blog & Fandom',
    location: 'Nhãn badge mục liên hệ blog',
    defaultValue: '🍬 OFFICIAL BLOG & SOCIALS',
  },
  {
    id: 'contact_section_title',
    section: 'Blog & Fandom',
    location: 'Tiêu đề mục Thông Tin Liên Hệ Blog',
    defaultValue: 'THÔNG TIN LIÊN HỆ BLOG',
  },
  {
    id: 'contact_section_desc',
    section: 'Blog & Fandom',
    location: 'Mô tả kênh blog chính thức',
    defaultValue:
      'Kênh blog và các trang mạng xã hội chính thức của OwO_Offset with OSAD dành cho gia đình Fandom Ô Mai.',
  },
  {
    id: 'contact_blog_tag',
    section: 'Blog & Fandom',
    location: 'Nhãn badge đỏ thẻ blog',
    defaultValue: 'BLOG CHÍNH THỨC',
  },
  {
    id: 'contact_blog_name',
    section: 'Blog & Fandom',
    location: 'Tên blog chính thức',
    defaultValue: 'OwO_Offset with OSAD',
  },
  {
    id: 'contact_blog_desc',
    section: 'Blog & Fandom',
    location: 'Khẩu hiệu đồng hành cùng blog',
    defaultValue: 'Đồng hành cùng OSAD (Chủ Tịch Mai) & Fandom Ô Mai',
  },
  {
    id: 'contact_fandom_tag',
    section: 'Blog & Fandom',
    location: 'Nhãn tên fandom màu hồng',
    defaultValue: '🍬 Tên Fandom: Ô Mai',
  },

  // 8. Chân Trang (Footer)
  {
    id: 'footer_quote',
    section: 'Chân Trang (Footer)',
    location: 'Câu nói truyền cảm hứng cuối trang',
    defaultValue: 'Âm nhạc là niềm vui, sân khấu là đam mê, Ô Mai là gia đình.',
  },
  {
    id: 'footer_copyright',
    section: 'Chân Trang (Footer)',
    location: 'Dòng bản quyền chân trang',
    defaultValue: '© 2026 Mai Quang Nam (OSAD - Chủ Tịch Mai) • Bảo trợ kíp nổ: OwO',
  },
];

export function getSiteText(siteTexts: Record<string, string> | undefined, id: string): string {
  if (siteTexts && siteTexts[id] !== undefined && siteTexts[id].trim() !== '') {
    return siteTexts[id];
  }
  const def = SITE_TEXT_DEFINITIONS.find((d) => d.id === id);
  return def ? def.defaultValue : '';
}

