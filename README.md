# Family TodoApp

Ứng dụng quản lý công việc gia đình với khả năng theo dõi tiến độ, phân công nhiệm vụ và tương tác giữa các thành viên trong gia đình.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc project](#-cấu-trúc-project)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [API Endpoints](#-api-endpoints)
- [Cấu trúc Database](#-cấu-trúc-database)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)

## ✨ Tính năng

### Quản lý công việc
- ✅ Tạo, chỉnh sửa và xóa công việc
- 📅 Quản lý deadline và lịch trình
- 🎯 Phân loại theo độ ưu tiên (Cao, Trung bình, Thấp)
- 📊 Theo dõi trạng thái (Chưa làm, Đang làm, Hoàn thành)
- 📷 Upload hình ảnh đính kèm công việc
- 🔍 Tìm kiếm và lọc công việc

### Quản lý gia đình
- 👨‍👩‍👧‍👦 Tạo và quản lý nhóm gia đình
- 👥 Mời thành viên qua email hoặc link mời
- 🎭 Phân quyền theo vai trò (Owner, Admin, Member)
- 📈 Xem tiến độ của từng thành viên
- 📊 Thống kê tổng quan về công việc gia đình

### Tương tác và thông báo
- 💬 Bình luận trên công việc
- ❤️ Phản ứng (reactions) với công việc
- 🔔 Thông báo real-time khi có công việc mới
- ⏰ Cảnh báo công việc sắp đến hạn

### Giao diện người dùng
- 🌓 Chế độ sáng/tối (Dark/Light mode)
- 🌍 Đa ngôn ngữ (Tiếng Việt / English)
- 📱 Responsive design
- 🎨 Giao diện hiện đại với Tailwind CSS
- 📅 Lịch hiển thị công việc

### Xác thực
- 🔐 Đăng ký và đăng nhập
- 🔑 Đổi mật khẩu
- 📱 Đăng nhập bằng Facebook
- 🔵 Đăng nhập bằng Google

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Translate API** - Translation service

### Frontend Web
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching & state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates

### Mobile (React Native)
- **React Native** - Mobile framework
- **Expo** - Development platform

## 📁 Cấu trúc project

```
GR1-IT5021/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── families/   # Family management
│   │   │   ├── tasks/      # Task management
│   │   │   ├── notifications/ # Notifications
│   │   │   └── translation/   # Translation service
│   │   └── server.js       # Main server file
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── seed.js         # Seed data
│
├── web/                    # Frontend web application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── auth/          # Authentication context
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── language/      # i18n context
│   │   ├── theme/         # Theme context
│   │   └── services/      # Services
│   └── package.json
│
└── mobile/                 # Mobile application (React Native)
    └── src/
        └── screens/       # Screen components
```

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd GR1-IT5021
```

### Bước 2: Cài đặt Backend

```bash
cd backend
npm install

# Tạo file .env
cp .env.example .env

# Chạy migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed dữ liệu mẫu (tùy chọn)
npm run prisma:seed
```

### Bước 3: Cài đặt Frontend Web

```bash
cd ../web
npm install
```

### Bước 4: Cài đặt Mobile (tùy chọn)

```bash
cd ../mobile
npm install
```

## ⚙️ Cấu hình

### Backend Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DATABASE_URL="postgresql://postgres:bvDsOTWFxyIXWuPBvJHmYhutljXTISfn@family-todoapp-db.railway.internal:5432/railway"

# JWT
JWT_SECRET="your-secret-key-here"

# Facebook OAuth
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"

# Server
PORT=4000
NODE_ENV=development
```

### Frontend Environment Variables

Tạo file `.env` trong thư mục `web/`:

```env
# API Base URL
VITE_API_BASE=https://family-todoapp-backend-production.up.railway.app/api

# Frontend URL (cho production, set trong Vercel Environment Variables)
# Nếu không set, sẽ tự động dùng window.location.origin (domain thực tế khi deploy)
# Ví dụ: VITE_FRONTEND_URL=https://your-app.vercel.app
VITE_FRONTEND_URL=http://localhost:5173

# Socket URL (optional)
VITE_SOCKET_URL=https://family-todoapp-backend-production.up.railway.app

# Facebook App ID
VITE_FACEBOOK_APP_ID=your-facebook-app-id

# Google Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🏃 Chạy ứng dụng

### Chạy Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại `http://localhost:4000` (local) hoặc `https://family-todoapp-backend-production.up.railway.app` (production)

### Chạy Frontend Web

```bash
cd web
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173` và tự động kết nối với backend tại `https://family-todoapp-backend-production.up.railway.app`

### Chạy Mobile (tùy chọn)

```bash
cd mobile
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập
- `POST /facebook` - Đăng nhập bằng Facebook
- `POST /google` - Đăng nhập bằng Google
- `GET /me` - Lấy thông tin user hiện tại
- `PUT /me` - Cập nhật thông tin user
- `PUT /change-password` - Đổi mật khẩu

### Families (`/api/families`)
- `GET /` - Lấy danh sách families của user
- `POST /` - Tạo family mới
- `GET /:id` - Lấy thông tin family
- `POST /:id/members` - Mời thành viên
- `GET /:id/tasks` - Lấy danh sách tasks của family
- `POST /join` - Tham gia family bằng invite code

### Tasks (`/api/tasks`)
- `GET /my` - Lấy tasks của user hiện tại
- `POST /` - Tạo task mới
- `GET /:id` - Lấy thông tin task
- `PUT /:id` - Cập nhật task
- `DELETE /:id` - Xóa task
- `POST /:id/assign` - Gán task cho user
- `POST /:id/comments` - Thêm comment
- `POST /:id/reactions` - Thêm reaction

### Notifications (`/api/notifications`)
- `GET /` - Lấy danh sách notifications
- `PATCH /:id/read` - Đánh dấu đã đọc

### Translation (`/api/translate`)
- `POST /` - Dịch text
- `POST /batch` - Dịch nhiều text cùng lúc
- `GET /health` - Kiểm tra trạng thái API

## 🗄 Cấu trúc Database

### Các bảng chính

- **User** - Thông tin người dùng
- **Family** - Thông tin gia đình/nhóm
- **FamilyMember** - Thành viên trong gia đình
- **Task** - Công việc
- **TaskAssignee** - Người được giao công việc
- **Comment** - Bình luận trên công việc
- **Reaction** - Phản ứng với công việc/bình luận
- **Notification** - Thông báo

Xem chi tiết trong file `backend/prisma/schema.prisma`

## 🌟 Tính năng nổi bật

### Real-time Updates
Sử dụng Socket.IO để cập nhật real-time khi có thay đổi về công việc, thông báo mới.

### Đa ngôn ngữ
Hỗ trợ chuyển đổi ngôn ngữ giữa Tiếng Việt và English, với khả năng dịch nội dung động từ database.

### Dark/Light Mode
Chế độ sáng/tối với khả năng lưu preference của người dùng.

### Social Login
Đăng nhập nhanh bằng Facebook và Google OAuth.

### Responsive Design
Giao diện tối ưu cho mọi kích thước màn hình từ mobile đến desktop.

## 📝 Scripts

### Backend
- `npm run dev` - Chạy server ở chế độ development
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:seed` - Seed dữ liệu mẫu
- `npm test` - Chạy tests

### Frontend Web
- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview build production
- `npm run lint` - Chạy ESLint

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team
- Express.js community
- Prisma team
- Tailwind CSS team

---
[
todoapp_family](https://todoappfamily-git-main-anhduc1808s-projects.vercel.app?_vercel_share=MnYrfNuWWbjkFeYkqtw9lnM2Fj0LnsOq)
