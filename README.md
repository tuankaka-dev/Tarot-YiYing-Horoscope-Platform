# Tarot, Yi Ying and Horoscope viewing platform

Nền tảng xem quẻ và chiêm nghiệm với các trải nghiệm như gieo quẻ Dịch, Tarot, Tử vi, theo dõi lịch sử, quản lý hồ sơ và gói dịch vụ trả phí. Hệ thống có trang quản trị để kiểm soát người dùng, giao dịch và cấu hình API.

## Tính năng chính

- Gieo quẻ Kinh Dịch, hiển thị quẻ và diễn giải nội dung bằng LLM.
- Tarot và các phiên trải nghiệm divination.
- Lập lá số Tử vi, lịch âm, quản lý hồ sơ sinh (ngày/giờ sinh).
- Tài khoản người dùng (đăng ký, đăng nhập, OAuth).
- Lịch sử phiên, credits, gói Premium/Pro.
- Thanh toán qua PayOS, webhook xử lý giao dịch.
- Admin dashboard: người dùng, lịch sử, cấu hình API, tarot, giao dịch.

## Công nghệ

- Next.js (App Router), React, TypeScript
- Supabase (Auth + Postgres + Storage)
- Prisma ORM
- PayOS SDK

## Yêu cầu

- Node.js 18+ (khuyến nghị 20+)
- Tài khoản Supabase
- Tài khoản PayOS

## Cài đặt nhanh

1) Cài dependency

```bash
npm install
```

2) Tạo file môi trường

```bash
copy .env.example .env.local
```

3) Cập nhật biến môi trường trong `.env.local`

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# AI APIs or config at ADMIN DASHBOARD (recommended)
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# PayOS
PAYOS_CLIENT_ID=xxx
PAYOS_API_KEY=xxx
PAYOS_CHECKSUM_KEY=xxx
```

4) Khởi tạo database + seed dữ liệu

```bash
npm run db:setup
```

5) Chạy dev server

```bash
npm run dev
```

Mở http://localhost:3000 để sử dụng.

## Cấu hình Supabase

1) Tạo project Supabase và lấy các thông tin sau:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `DATABASE_URL` (Postgres connection string)

2) Bật Auth providers theo nhu cầu (Email/Password, Google).
	- Redirect URL cho OAuth: `https://<domain>/auth/callback`

3) (Khuyến nghị) Tạo Storage bucket chứa ảnh quẻ dịch.
	- Tên bucket: `64_QUE`
	- Đặt quyền public nếu muốn truy cập trực tiếp qua URL.

4) Chạy `npm run db:setup` để đẩy schema và seed dữ liệu.

## Cấu hình PayOS

1) Tạo ứng dụng PayOS và lấy:
	- `PAYOS_CLIENT_ID`
	- `PAYOS_API_KEY`
	- `PAYOS_CHECKSUM_KEY`

2) Thiết lập webhook trên PayOS:
	- URL webhook: `https://<domain>/api/payment/webhook`
	- Với môi trường local, có thể dùng ngrok để public URL tạm thời.

3) Kiểm tra webhook:
	- Gọi `GET /api/payment/webhook` để xác nhận endpoint hoạt động.

## Cấu trúc thư mục

```
.
├─ prisma/               # Schema + migrations + seed
├─ public/               # Static assets
├─ scripts/              # Script tiện ích (set admin, cleanup, seed)
├─ skills/               # Skills nội bộ
├─ src/
│  ├─ app/                # Next.js App Router
│  ├─ components/         # UI components
│  ├─ lib/                # Helpers, integrations (Supabase, PayOS, Prisma)
│  ├─ stores/             # Zustand stores
│  └─ types/              # TypeScript types
├─ 64-YiYing-cards.zip    # 64 quẻ dịch (ảnh)
├─ 78-Tarot-cards.zip     # 78 lá Tarot (ảnh)
└─ README.md
```

## Script hữu ích

- `npm run db:setup` - push schema + seed dữ liệu
- `npm run db:seed` - chỉ seed dữ liệu
- `npm run history:cleanup` - dọn lịch sử rỗng
- `node scripts/set-admin.js <email>` - set quyền admin cho user

