# ✅ Deploy Checklist - Cafe Finder

## 🎯 Chuẩn bị trước khi Deploy

- [ ] Code đã test kỹ trên local
- [ ] Không có file `.env` trong Git (đã có trong .gitignore)
- [ ] Push code lên GitHub repository
- [ ] Tài khoản Render đã sẵn sàng
- [ ] Tài khoản Vercel đã sẵn sàng

---

## 🗄️ BƯỚC 1: Deploy Database (PostgreSQL trên Render)

- [ ] Đăng nhập [Render Dashboard](https://dashboard.render.com/)
- [ ] Tạo PostgreSQL Database mới
  - Name: `cafe-finder-db`
  - Region: `Singapore`
  - Plan: `Free`
- [ ] Lưu lại thông tin kết nối:
  - [ ] PGDATABASE
  - [ ] PGHOST
  - [ ] PGUSER
  - [ ] PGPASSWORD
  - [ ] PGPORT (5432)

---

## 🔧 BƯỚC 2: Deploy Backend (Render)

### 2.1 Tạo Web Service

- [ ] New → Web Service
- [ ] Connect GitHub repository
- [ ] Cấu hình:
  - [ ] Name: `cafe-finder-backend`
  - [ ] Region: `Singapore`
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: `Free`

### 2.2 Thêm Environment Variables

Copy từ file `.env.production.example` và điền thông tin:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `DB_HOST` = (từ PostgreSQL database)
- [ ] `DB_PORT` = `5432`
- [ ] `DB_NAME` = (từ PostgreSQL database)
- [ ] `DB_USER` = (từ PostgreSQL database)
- [ ] `DB_PASSWORD` = (từ PostgreSQL database)
- [ ] `JWT_SECRET` = (tạo chuỗi random: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `GOOGLE_MAPS_API_KEY` = (API key của bạn)
- [ ] `FRONTEND_URL` = `https://localhost:3000` (tạm thời, sẽ cập nhật sau)

### 2.3 Deploy và chạy Migrations

- [ ] Nhấn **Create Web Service**
- [ ] Đợi deploy xong (3-5 phút)
- [ ] Vào tab **Shell**, chạy:
  ```bash
  npm run migrate
  npm run seed
  ```
- [ ] Test API: `https://cafe-finder-backend.onrender.com/api/health`
- [ ] Lưu lại URL backend: `________________`

---

## 🎨 BƯỚC 3: Deploy Frontend (Vercel)

### 3.1 Import Project

- [ ] Đăng nhập [Vercel](https://vercel.com/)
- [ ] New Project → Import từ GitHub
- [ ] Chọn repository `ITSS1`

### 3.2 Cấu hình Project

- [ ] Framework Preset: `Vite`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 3.3 Thêm Environment Variables

- [ ] `VITE_API_BASE_URL` = `https://cafe-finder-backend.onrender.com/api` (URL từ bước 2)
- [ ] `VITE_API_TIMEOUT` = `10000`
- [ ] `VITE_APP_ENV` = `production`

### 3.4 Deploy

- [ ] Nhấn **Deploy**
- [ ] Đợi build xong (2-3 phút)
- [ ] Lưu lại URL frontend: `________________`

---

## 🔄 BƯỚC 4: Cập nhật CORS

- [ ] Quay lại Render → Backend Service
- [ ] Vào **Environment** tab
- [ ] Cập nhật `FRONTEND_URL` = URL frontend vừa lưu
- [ ] Save → Service sẽ tự động redeploy

---

## ✅ BƯỚC 5: Kiểm tra

### Backend

- [ ] Health check: `https://<backend-url>/api/health`
- [ ] API response JSON OK
- [ ] Logs không có lỗi

### Frontend

- [ ] Truy cập: `https://<frontend-url>`
- [ ] Trang web load được
- [ ] F12 → Console không có lỗi CORS
- [ ] Test đăng ký tài khoản
- [ ] Test đăng nhập
- [ ] Test tìm kiếm cafe

### Database

- [ ] Vào Render PostgreSQL → Metrics
- [ ] Kiểm tra có connections
- [ ] Có dữ liệu trong các bảng

---

## 🐛 Troubleshooting

### Nếu gặp lỗi CORS:
- [ ] Kiểm tra `FRONTEND_URL` trong backend
- [ ] Kiểm tra file `server.js` có CORS config đúng không

### Nếu Backend không kết nối được Database:
- [ ] Kiểm tra lại DB credentials
- [ ] Vào Render PostgreSQL → Connections → Check status

### Nếu Frontend không call được API:
- [ ] Kiểm tra `VITE_API_BASE_URL` có đúng không
- [ ] F12 → Network → Xem request có đi đến đâu

### Nếu Build Failed:
- [ ] Xem logs chi tiết
- [ ] Kiểm tra dependencies trong package.json
- [ ] Thử build local: `npm run build`

---

## 📱 Optional: Custom Domain

### Vercel
- [ ] Project Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS

### Render
- [ ] Service Settings → Custom Domain
- [ ] Add domain
- [ ] Configure DNS

---

## 🎉 Hoàn thành!

Ghi chú URL đã deploy:

```
Frontend: https://___________________________.vercel.app
Backend:  https://___________________________.onrender.com
Database: ___________________________.render.com
```

**Tài khoản admin test:**
- Email: ________________
- Password: ________________

**Next Steps:**
- [ ] Test đầy đủ tất cả tính năng
- [ ] Monitor logs trong 24h đầu
- [ ] Setup monitoring/alerts (optional)
- [ ] Thêm custom domain (optional)
