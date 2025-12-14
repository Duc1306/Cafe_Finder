# 🚀 Hướng Dẫn Deploy Dự Án Cafe Finder

## 📋 Mục Lục
- [Deploy Backend lên Render](#deploy-backend-lên-render)
- [Deploy Frontend lên Vercel](#deploy-frontend-lên-vercel)
- [Cấu hình Database PostgreSQL](#cấu-hình-database-postgresql)
- [Kiểm tra và Debug](#kiểm-tra-và-debug)

---

## 🔧 Deploy Backend lên Render

### Bước 1: Chuẩn bị Database PostgreSQL trên Render

1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Nhấn **New +** → chọn **PostgreSQL**
3. Điền thông tin:
   - **Name**: `cafe-finder-db`
   - **Region**: `Singapore` (gần Việt Nam nhất)
   - **Plan**: `Free`
4. Nhấn **Create Database**
5. Sau khi tạo xong, vào tab **Info** và lưu lại các thông tin sau:
   ```
   PGDATABASE=cafe_finder
   PGHOST=dpg-d4velq9r0fns739k60v0-a
   PGPASSWORD=3DLxxLaM1aiTAPqiHRDBkE1F98A8yJlF
   PGPORT=5432
   PGUSER=cafe_finder_user
   Internal Database URL=postgresql://cafe_finder_user:3DLxxLaM1aiTAPqiHRDBkE1F98A8yJlF@dpg-d4velq9r0fns739k60v0-a/cafe_finder
   External Database URL=postgresql://cafe_finder_user:3DLxxLaM1aiTAPqiHRDBkE1F98A8yJlF@dpg-d4velq9r0fns739k60v0-a.singapore-postgres.render.com/cafe_finder
   ```

### Bước 2: Deploy Backend Service

1. Vẫn ở Render Dashboard, nhấn **New +** → chọn **Web Service**
2. Kết nối với GitHub repository của bạn
3. Điền thông tin:
   - **Name**: `cafe-finder-backend`
   - **Region**: `Singapore`
   - **Branch**: `main` (hoặc branch bạn muốn deploy)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### Bước 3: Cấu hình Environment Variables cho Backend

Trong phần **Environment Variables**, thêm các biến sau:

```bash
NODE_ENV=production
PORT=5000

# Database - Copy từ PostgreSQL Database bạn vừa tạo ở Bước 1
DB_HOST=<PGHOST từ database>
DB_PORT=5432
DB_NAME=<PGDATABASE từ database>
DB_USER=<PGUSER từ database>
DB_PASSWORD=<PGPASSWORD từ database>

# JWT Secret - Tạo chuỗi ngẫu nhiên mạnh
JWT_SECRET=<string_random_rat_manh_it_nhat_32_ky_tu>
JWT_EXPIRES_IN=7d

# Google Maps API (nếu có)
GOOGLE_MAPS_API_KEY=<your_google_maps_api_key>

# Frontend URL - SẼ CẬP NHẬT SAU KHI DEPLOY FRONTEND
FRONTEND_URL=https://your-frontend-app.vercel.app
```

> **Lưu ý**: Chưa có FRONTEND_URL thì tạm thời để `https://localhost:3000`, sau khi deploy frontend xong sẽ cập nhật lại.

### Bước 4: Chạy Database Migrations

Sau khi backend service đã deploy thành công:

1. Vào service backend trên Render
2. Chọn tab **Shell**
3. Chạy lần lượt các lệnh:

```bash
# Kiểm tra kết nối database
npm run test:db

# Chạy migrations (tạo bảng)
npx sequelize-cli db:migrate

# Chạy seeders (thêm dữ liệu mẫu)
npx sequelize-cli db:seed:all
```

### Bước 5: Test Backend API

Sau khi deploy xong, kiểm tra:
```
https://cafe-finder-backend.onrender.com/
https://cafe-finder-backend.onrender.com/api/health
```

Bạn nên thấy response JSON từ API.

---

## 🎨 Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị Vercel Account

1. Truy cập [Vercel](https://vercel.com/)
2. Đăng nhập bằng GitHub account
3. Cấp quyền cho Vercel truy cập repository của bạn

### Bước 2: Import Project

1. Từ Vercel Dashboard, nhấn **Add New** → **Project**
2. Chọn repository `ITSS1` từ danh sách
3. Vercel sẽ tự động phát hiện đây là Vite project

### Bước 3: Cấu hình Project Settings

**Framework Preset**: `Vite`

**Root Directory**: `frontend`

**Build Settings**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Bước 4: Thêm Environment Variables

Trong phần **Environment Variables**, thêm:

```bash
VITE_API_BASE_URL=https://cafe-finder-backend.onrender.com/api
VITE_API_TIMEOUT=10000
VITE_APP_ENV=production
```

> **Quan trọng**: Thay `cafe-finder-backend.onrender.com` bằng URL backend thực tế của bạn từ Render.

### Bước 5: Deploy

1. Nhấn **Deploy**
2. Đợi vài phút để Vercel build và deploy
3. Sau khi xong, bạn sẽ có URL dạng: `https://your-app-name.vercel.app`

### Bước 6: Cập nhật CORS cho Backend

Quay lại Render, cập nhật biến môi trường `FRONTEND_URL`:

```bash
FRONTEND_URL=https://your-app-name.vercel.app
```

Sau đó Render sẽ tự động redeploy backend.

---

## 🗃️ Cấu hình Database PostgreSQL

### Cách 1: Sử dụng Render PostgreSQL (Khuyên dùng)

Đã hướng dẫn ở trên.

### Cách 2: Sử dụng Neon Database (Alternative)

1. Truy cập [Neon](https://neon.tech/)
2. Tạo project mới
3. Copy connection string
4. Cập nhật environment variables trên Render

### Migration & Seeding

Đảm bảo rằng file migrations và seeders của bạn đã sẵn sàng:

```bash
# Trong folder backend/
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## ✅ Kiểm tra và Debug

### Kiểm tra Backend

```bash
# Health check
curl https://cafe-finder-backend.onrender.com/api/health

# Test authentication endpoint
curl https://cafe-finder-backend.onrender.com/api/auth/status
```

### Kiểm tra Frontend

1. Mở `https://your-app-name.vercel.app`
2. Mở DevTools (F12) → Console
3. Kiểm tra có lỗi CORS không
4. Test login/register

### Debug Logs

**Render Logs**: Vào service → tab **Logs**

**Vercel Logs**: Vào deployment → tab **Functions** hoặc **Logs**

### Common Issues

#### 1. CORS Error
- Đảm bảo `FRONTEND_URL` trong backend đúng
- Kiểm tra CORS middleware trong `server.js`

#### 2. Database Connection Error
- Kiểm tra lại database credentials
- Đảm bảo IP của Render không bị block

#### 3. Build Failed trên Vercel
- Kiểm tra Node version
- Xem logs để tìm lỗi cụ thể

#### 4. API 500 Error
- Kiểm tra backend logs trên Render
- Kiểm tra database migrations đã chạy chưa

---

## 🔄 Automatic Deployments

### GitHub Integration

Cả Render và Vercel đều hỗ trợ auto-deploy khi bạn push code lên GitHub:

- **Render**: Auto deploy khi push lên branch `main`
- **Vercel**: Auto deploy cho mọi commit và tạo preview cho PR

### Manual Deploy

**Render**: Dashboard → Service → **Manual Deploy**

**Vercel**: Dashboard → Project → **Redeploy**

---

## 📱 Custom Domain (Optional)

### Vercel Custom Domain

1. Vào Project Settings → Domains
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn

### Render Custom Domain

1. Vào Service Settings → Custom Domain
2. Thêm domain
3. Cấu hình DNS

---

## 🎯 Checklist Trước Khi Deploy

- [ ] Code đã được test kỹ local
- [ ] Database migrations và seeders đã sẵn sàng
- [ ] Environment variables đã được chuẩn bị
- [ ] .gitignore đã loại trừ file .env và node_modules
- [ ] CORS đã được cấu hình đúng
- [ ] API endpoints đã được test
- [ ] Frontend đã kết nối đúng backend URL

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trên Render/Vercel
2. Xem lại các bước cấu hình environment variables
3. Test API bằng Postman/Thunder Client
4. Kiểm tra CORS và network requests

---

**Chúc bạn deploy thành công! 🎉**
