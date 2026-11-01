import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-4 text-center">
      <div className="neo-box p-8 max-w-md w-full bg-white space-y-4">
        <span className="neo-sticker bg-brand-yellow text-black text-xs font-black">
          🍬 FANDOM Ô MAI
        </span>
        <h1 className="text-6xl font-black text-black font-cocogoose">404</h1>
        <h2 className="text-xl font-black text-brand-red uppercase font-cocogoose">
          Không Tìm Thấy Trang
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-gray-600">
          Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác trên cổng thông tin Chủ Tịch Mai.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="neo-btn bg-brand-yellow hover:bg-yellow-400 text-black px-6 py-2.5 text-xs sm:text-sm font-black gap-2 w-full justify-center shadow-brutal"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ Chủ Tịch Mai</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

