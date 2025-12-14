# Cafe Finder Backend

Backend API cho ứng dụng Cafe Finder - Hệ thống tìm kiếm và quản lý quán cafe.

## 🚀 Quick Start

### Local Development

1. **Cài đặt dependencies**
```bash
npm install
```

2. **Cấu hình môi trường**
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
```

3. **Tạo database và chạy migrations**
```bash
npm run migrate
npm run seed
```

4. **Chạy development server**
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### Production (Render)

Xem file [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) để biết hướng dẫn deploy chi tiết.

## 📦 Scripts

```bash
npm start              # Chạy production server
npm run dev            # Chạy development server với nodemon
npm run test:db        # Test kết nối database
npm run migrate        # Chạy database migrations
npm run migrate:undo   # Undo migration cuối cùng
npm run seed           # Chạy seeders (thêm dữ liệu mẫu)
npm run seed:undo      # Xóa dữ liệu seeded
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cafe_finder_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key

# CORS
FRONTEND_URL=http://localhost:5173
```

## 📁 Cấu trúc Project

```
backend/
├── src/
│   ├── config/         # Cấu hình database, JWT, etc.
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Auth, upload, validation
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Service layer
│   ├── utils/          # Utilities
│   └── server.js       # Entry point
├── migrations/         # Database migrations
├── seeders/           # Database seeders
└── uploads/           # User uploaded files
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile

### Cafes
- `GET /api/user/cafes` - Danh sách cafe
- `GET /api/user/cafes/:id` - Chi tiết cafe
- `GET /api/nearby` - Cafe gần đây

### Favorites
- `GET /api/user/favorites` - Danh sách yêu thích
- `POST /api/user/favorites` - Thêm vào yêu thích
- `DELETE /api/user/favorites/:id` - Xóa khỏi yêu thích

### Owner (Chủ quán)
- `POST /api/owner/cafes` - Tạo cafe mới
- `PUT /api/owner/cafes/:id` - Cập nhật cafe
- `DELETE /api/owner/cafes/:id` - Xóa cafe

### Admin
- `GET /api/admin/stats` - Thống kê
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/cafes` - Quản lý cafes

## 🗃️ Database

Sử dụng PostgreSQL với Sequelize ORM.

### Models

- User - Người dùng
- OwnerProfile - Hồ sơ chủ quán
- Cafe - Quán cafe
- CafePhoto - Ảnh cafe
- Review - Đánh giá
- Favorite - Yêu thích
- Promotion - Khuyến mãi
- Notification - Thông báo
- TermsOfUse - Điều khoản sử dụng

## 🛡️ Security

- JWT Authentication
- bcrypt cho password hashing
- Helmet cho HTTP headers security
- Rate limiting
- Input validation với express-validator
- CORS configuration

## 📝 License

ISC
