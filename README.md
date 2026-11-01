# OSAD - Lịch Công Tác Chủ Tịch Mai (Celebrity Platform)

> Website chính thức cập nhật thông tin, hình ảnh và lịch trình công tác của Songwriter/rapper **OSAD (Mai Quang Nam - "Chủ Tịch Mai")** với phong cách **Neo-brutalism / Playful Color Blocks**, font chữ **Cocogoose Pro** và trang Admin quản trị toàn diện.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao Diện Public (Cho Người Hâm Mộ):**
   - **Hero Section:** Visual tổng tài "Chủ Tịch Mai", câu trích dẫn, mascot "OFFSET W OSAD".
   - **Schedule Board (Bảng Kẹp Clipboard):** Tái hiện 100% hình mẫu bảng kẹp tài liệu kim loại thực tế với đầy đủ 24 sự kiện tháng 11 & 12/2026, sticker xéo "LỊCH CÔNG TÁC CHỦ TỊCH MAI", giấy note vàng "THÁNG 11 & 12 2026", chữ ký vẽ tay và các doodle icon sinh động (🎁, 🎮, 🤫, 😎, ⭐).
   - **Lọc & Tìm Kiếm Thông Minh:** Lọc theo Tháng 11 / Tháng 12, tìm kiếm show theo địa điểm và tên sự kiện.
   - **About & Profile:** Tiểu sử sự nghiệp, thành tích tại Anh Trai Vượt Ngàn Chông Gai 2024, thương hiệu OSAD OMAI.
   - **Discography:** Danh sách các bản hit triệu view (Người Âm Phủ, Củ Lạc, Anh Mệt Rồi...).
   - **Thư Viện Ảnh (Gallery):** Lưới ảnh polaroid kèm tính năng phóng to (Lightbox).
   - **Booking & Contact:** Thẻ thông tin quản lý, copy email nhanh và form gửi lời mời hợp tác trực tuyến.

2. **Trang Quản Trị (Admin Portal - `/admin`):**
   - **Xác thực bảo mật:** Đăng nhập JWT an toàn qua `/admin/login`.
   - **Quản lý Lịch trình (`/admin`):** Thêm mới sự kiện, sửa thông tin show, thay đổi trạng thái (Sắp diễn ra, TBU, Đã xong), đổi màu badge địa điểm, xóa sự kiện.
   - **Quản lý Media (`/admin/gallery`):** Upload ảnh trực tiếp lên Cloudinary (hoặc bộ nhớ web) với giao diện kéo thả trực quan.
   - **Cập nhật Profile (`/admin/profile`):** Sửa nghệ danh, câu quote, thông tin booking và liên kết mạng xã hội.

---

## 🚀 Hướng Dẫn Chạy Dự Án (Local Development)

```bash
# 1. Cài đặt thư viện (đã cài sẵn)
npm install

# 2. Khởi động môi trường phát triển
npm run dev
```

Mở trình duyệt truy cập:
- **Trang chủ:** [http://localhost:3000](http://localhost:3000)
- **Trang Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Tài khoản:** `admin`
  - **Mật khẩu:** `osad2026`

---

## ☁️ Cấu Hình Free Tier (MongoDB Atlas & Cloudinary)

Website có sẵn cơ chế **Fallback tự động**: Nếu chưa nhập khóa Cloud, website sẽ tự động đọc/ghi dữ liệu vào file `data-store.json` và lưu ảnh vào `public/uploads/` để bạn test ngay.

Để kết nối Cloud thực tế miễn phí vĩnh viễn:

### 1. MongoDB Atlas (M0 Free Cluster 512MB - Không bao giờ sleep)
1. Đăng ký tài khoản miễn phí tại [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Tạo 1 Cluster M0 (Free Tier vĩnh viễn, chọn vùng Singapore / Tokyo để tải nhanh nhất).
3. Lấy chuỗi kết nối (Connection String) dạng:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=osad_celebrity
   ```
4. Điền vào file `.env.local` (hoặc Environment Variables trên Vercel).

### 2. Cloudinary (Lưu trữ ảnh miễn phí 25GB/tháng)
1. Đăng ký tài khoản tại [cloudinary.com](https://cloudinary.com).
2. Lấy 3 thông số trong Dashboard:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚢 Hướng Dẫn Deploy Miễn Phí Lên Vercel

1. Push mã nguồn dự án lên tài khoản **GitHub** (Private hoặc Public).
2. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. Chọn **"Add New..."** -> **"Project"** -> Import repository vừa tạo.
4. Thêm các biến môi trường trong phần **Environment Variables**:
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `<Mật khẩu quản trị của bạn>`
   - `ADMIN_JWT_SECRET` = `<Chuỗi bí mật ngẫu nhiên>`
   - `MONGODB_URI` = `<Chuỗi kết nối MongoDB Atlas>`
   - `MONGODB_DB` = `osad_celebrity`
   - `CLOUDINARY_CLOUD_NAME` = `<Tên Cloudinary nếu có>`
   - `CLOUDINARY_API_KEY` = `<API Key>`
   - `CLOUDINARY_API_SECRET` = `<API Secret>`
5. Nhấn **Deploy**! Chỉ mất khoảng 1 phút, website sẽ hoạt động trực tiếp với link `https://tên-dự-án.vercel.app` (kèm chứng chỉ SSL miễn phí trọn đời).

