import type { Metadata } from 'next';
import { cocogoose, cocogooseLight } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'OSAD - Lịch Công Tác Chủ Tịch Mai | Official Website',
  description:
    'Cổng thông tin & cập nhật lịch trình công tác, biểu diễn, concert và hoạt động chính thức của Rapper / Ca sĩ OSAD (Mai Đức Triều).',
  icons: {
    icon: '/images/logo 3.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${cocogoose.variable} ${cocogooseLight.variable} scroll-smooth`}>
      <body className="antialiased selection:bg-brand-yellow selection:text-black min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

