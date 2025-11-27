-- =====================================================
-- FINAL DB SCHEMA - APP TÌM QUÁN CÀ PHÊ (ITSS PROJECT)
-- Updated: Bỏ Booking, Tối ưu Filter & Sort
-- =====================================================

-- 1. Bảng quản lý điều khoản (Admin soạn)
CREATE TABLE terms_of_use (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    version         VARCHAR(20) NOT NULL, -- VD: '1.0', '2.1'
    content         TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng User (Chứa Admin, Owner, Customer)
CREATE TABLE users (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('ADMIN', 'OWNER', 'CUSTOMER') NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    
    -- Bổ sung theo UI Profile (USR-04)
    dob             DATE,           -- Ngày sinh
    address         VARCHAR(255),   -- Địa chỉ cá nhân
    
    status          ENUM('ACTIVE', 'PENDING', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    agreed_terms_id BIGINT, -- Version điều khoản đã đồng ý
    
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_terms FOREIGN KEY (agreed_terms_id) REFERENCES terms_of_use(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Hồ sơ chủ quán (Admin duyệt)
CREATE TABLE owner_profiles (
    user_id              BIGINT PRIMARY KEY,
    business_name        VARCHAR(255),
    business_license_url VARCHAR(500),
    approval_status      ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    approved_at          DATETIME,
    notes                TEXT,
    
    CONSTRAINT fk_owner_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng Quán Cà Phê (Core)
CREATE TABLE cafes (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id            BIGINT NOT NULL,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    
    -- Địa chỉ & Map (USR-10)
    address_line        VARCHAR(255) NOT NULL,
    district            VARCHAR(100),
    city                VARCHAR(100),
    latitude            DECIMAL(9,6), -- Vĩ độ Google Map
    longitude           DECIMAL(9,6), -- Kinh độ Google Map
    
    -- Thông tin liên hệ & Giờ giấc (USR-06)
    phone_contact       VARCHAR(20),
    website_url         VARCHAR(500), -- Bổ sung theo UI
    
    open_time           TIME, -- Giờ mở (VD: 07:00:00)
    close_time          TIME, -- Giờ đóng (VD: 22:00:00)
    
    avg_price_min       INT, -- Giá thấp nhất (Filter)
    avg_price_max       INT, -- Giá cao nhất
    
    -- Các tiện ích (Boolean để Filter nhanh cho USR-05)
    has_wifi            BOOLEAN DEFAULT FALSE,
    has_ac              BOOLEAN DEFAULT FALSE,     -- Điều hòa
    is_quiet            BOOLEAN DEFAULT FALSE,     -- Yên tĩnh
    has_parking         BOOLEAN DEFAULT FALSE,
    allow_smoking       BOOLEAN DEFAULT FALSE,
    allow_pets          BOOLEAN DEFAULT FALSE,     -- Bổ sung: Thú cưng
    
    -- Tiện ích khác nhập text (Owner nhập ở OWN-04)
    amenities_text      TEXT, 
    
    status              ENUM('PENDING', 'ACTIVE', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cafe_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Ảnh quán (Bao gồm ảnh không gian và ảnh Menu)
CREATE TABLE cafe_photos (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    cafe_id     BIGINT NOT NULL,
    url         VARCHAR(500) NOT NULL,
    photo_type  ENUM('INTERIOR', 'EXTERIOR', 'MENU', 'FOOD') DEFAULT 'INTERIOR',
    is_cover    BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cafe_photos FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Đánh giá (Reviews)
CREATE TABLE reviews (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    cafe_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    image_url   VARCHAR(500), -- Ảnh review
    
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_review_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Yêu thích (Favorites) - USR-09
CREATE TABLE favorites (
    user_id     BIGINT NOT NULL,
    cafe_id     BIGINT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, cafe_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Khuyến mãi (Promotions) - USR-08
-- Đã cập nhật để hỗ trợ Sort & Filter
CREATE TABLE promotions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    cafe_id         BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL, -- Tên chương trình
    description     TEXT,
    
    -- Để sắp xếp & lọc (OWN-07 nhập, USR-08 xem)
    discount_type   ENUM('PERCENT', 'FIXED_AMOUNT') NOT NULL DEFAULT 'PERCENT', 
    discount_value  DECIMAL(10,2) NOT NULL, -- Lưu số 20 (cho 20%) hoặc 50000 (cho 50k)
    
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_promo_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Thông báo Admin (Notifications)
CREATE TABLE notifications (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    type        ENUM('NEW_USER', 'NEW_CAFE', 'REPORT', 'SYSTEM') NOT NULL,
    title       VARCHAR(255),
    content     TEXT,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;