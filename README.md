

### 1️⃣ Clone Repository


git clone https://github.com/Duc1306/Cafe_Finder.git


### 2️⃣ Cài đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
copy .env.example .env

# Cập nhật .env với API keys
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Chạy development server
npm run dev
```

**✅ Frontend chạy tại:** http://localhost:5173

### 3️⃣ Cài đặt Backend (Terminal mới)

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
copy .env.example .env

# Cập nhật .env với database & API keys

# (Optional) Seed database với dữ liệu mẫu
npm run seed

# Chạy development server
npm run dev
```

**✅ Backend chạy tại:** http://localhost:5000

---

## 💻 Available Scripts

### Frontend (`frontend/`)

```bash
npm run dev      # Start dev server (port 5173)



### Backend (`backend/`)

```bash

npm run dev      # Start dev server with nodemon (auto-reload)





