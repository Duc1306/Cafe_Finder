'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 0. Chuẩn bị Hash Password (123456)
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('123456', salt);
    const now = new Date();

    // ==========================================================
    // 1. TERMS OF USE (Đã bỏ updated_at để khớp với migration)
    // ==========================================================
    await queryInterface.bulkInsert('TermsOfUses', [{
      version: '1.0',
      content: '<h1>Điều khoản sử dụng</h1><p>Chào mừng đến với Cafe Finder...</p>',
      is_active: true,
      created_at: now
    }]);

    // Lấy ID của Terms vừa tạo
    const terms = await queryInterface.sequelize.query(`SELECT id FROM "TermsOfUses" LIMIT 1;`);
    const termId = terms[0][0].id;

    // ==========================================================
    // 2. USERS (Admin, 2 Owners, 2 Customers)
    // ==========================================================
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@cafe.com',
        password_hash: passwordHash,
        full_name: 'Super Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: now, updated_at: now
      },
      { // Owner 1: Có quán xịn
        email: 'owner1@cafe.com',
        password_hash: passwordHash,
        full_name: 'Nguyen Van Chu Quan A',
        role: 'OWNER',
        phone: '0901111111',
        status: 'ACTIVE',
        agreed_terms_id: termId,
        created_at: now, updated_at: now
      },
      { // Owner 2: Có quán đang chờ duyệt
        email: 'owner2@cafe.com',
        password_hash: passwordHash,
        full_name: 'Tran Thi Chu Quan B',
        role: 'OWNER',
        phone: '0902222222',
        status: 'ACTIVE',
        agreed_terms_id: termId,
        created_at: now, updated_at: now
      },
      { // Customer 1
        email: 'user1@cafe.com',
        password_hash: passwordHash,
        full_name: 'Le Van Khach',
        role: 'CUSTOMER',
        phone: '0903333333',
        status: 'ACTIVE',
        agreed_terms_id: termId,
        created_at: now, updated_at: now
      },
      { // Customer 2
        email: 'user2@cafe.com',
        password_hash: passwordHash,
        full_name: 'Pham Thi Mua',
        role: 'CUSTOMER',
        phone: '0904444444',
        status: 'ACTIVE',
        agreed_terms_id: termId,
        created_at: now, updated_at: now
      }
    ], {});

    // Lấy ID các User vừa tạo
    const users = await queryInterface.sequelize.query(`SELECT id, email FROM "Users";`);
    const userMap = {};
    users[0].forEach(u => userMap[u.email] = u.id);

    // ==========================================================
    // 3. OWNER PROFILES
    // ==========================================================
    await queryInterface.bulkInsert('OwnerProfiles', [
      {
        user_id: userMap['owner1@cafe.com'],
        business_name: 'Công ty TNHH Coffee A',
        approval_status: 'APPROVED',
        approved_at: now,
        notes: 'Hồ sơ đầy đủ'
      },
      {
        user_id: userMap['owner2@cafe.com'],
        business_name: 'Hộ kinh doanh B',
        approval_status: 'PENDING',
        notes: 'Đang chờ bổ sung giấy phép'
      }
    ], {});

    // ==========================================================
    // 4. CAFES
    // ==========================================================
    await queryInterface.bulkInsert('Cafes', [
      { // Quán 1
        owner_id: userMap['owner1@cafe.com'],
        name: 'The Coffee House - Signature',
        description: 'Không gian sang trọng, view đẹp.',
        address_line: '86 Nguyen Hue',
        district: 'Quan 1',
        city: 'Ho Chi Minh',
        latitude: 10.776, longitude: 106.700,
        open_time: '07:00:00', close_time: '22:00:00',
        avg_price_min: 40000, avg_price_max: 80000,
        has_wifi: true, has_ac: true, is_quiet: true, has_parking: true,
        status: 'ACTIVE',
        created_at: now, updated_at: now
      },
      { // Quán 2
        owner_id: userMap['owner1@cafe.com'],
        name: 'Goc Da Lat',
        description: 'Quán nhỏ chill chill phong cách Đà Lạt.',
        address_line: 'Hẻm 123 Le Loi',
        district: 'Quan 1',
        city: 'Ho Chi Minh',
        latitude: 10.770, longitude: 106.690,
        open_time: '08:00:00', close_time: '21:00:00',
        avg_price_min: 20000, avg_price_max: 50000,
        has_wifi: true, allow_smoking: true, allow_pets: true,
        status: 'PENDING',
        created_at: now, updated_at: now
      },
      { // Quán 3
        owner_id: userMap['owner2@cafe.com'],
        name: 'Highlands Coffee - Landmark',
        description: 'Nằm ngay dưới chân tòa nhà Landmark 81.',
        address_line: '208 Nguyen Huu Canh',
        district: 'Binh Thanh',
        city: 'Ho Chi Minh',
        latitude: 10.790, longitude: 106.720,
        open_time: '07:00:00', close_time: '23:00:00',
        avg_price_min: 30000, avg_price_max: 70000,
        has_wifi: true, has_ac: true, has_parking: true,
        status: 'ACTIVE',
        created_at: now, updated_at: now
      }
    ], {});

    const cafes = await queryInterface.sequelize.query(`SELECT id, name FROM "Cafes";`);
    const cafeMap = {};
    cafes[0].forEach(c => cafeMap[c.name] = c.id);

    // ==========================================================
    // 5. CAFE PHOTOS
    // ==========================================================
    await queryInterface.bulkInsert('CafePhotos', [
      { cafe_id: cafeMap['The Coffee House - Signature'], url: 'https://placehold.co/600x400?text=Cafe+Interior', photo_type: 'INTERIOR', is_cover: true, created_at: now, updated_at: now },
      { cafe_id: cafeMap['The Coffee House - Signature'], url: 'https://placehold.co/600x400?text=Menu+1', photo_type: 'MENU', is_cover: false, created_at: now, updated_at: now },
      { cafe_id: cafeMap['Highlands Coffee - Landmark'], url: 'https://placehold.co/600x400?text=Highlands', photo_type: 'EXTERIOR', is_cover: true, created_at: now, updated_at: now }
    ], {});

    // ==========================================================
    // 6. PROMOTIONS
    // ==========================================================
    await queryInterface.bulkInsert('Promotions', [
      {
        cafe_id: cafeMap['The Coffee House - Signature'],
        title: 'Giảm 20% Mùa Hè',
        description: 'Áp dụng cho toàn bộ menu nước.',
        discount_type: 'PERCENT',
        discount_value: 20,
        start_date: '2024-01-01',
        end_date: '2025-12-31',
        is_active: true,
        created_at: now, updated_at: now
      }
    ], {});

    // ==========================================================
    // 7. REVIEWS
    // ==========================================================
    await queryInterface.bulkInsert('Reviews', [
      {
        user_id: userMap['user1@cafe.com'],
        cafe_id: cafeMap['The Coffee House - Signature'],
        rating: 5,
        comment: 'Quán đẹp, nhân viên thân thiện.',
        created_at: now, updated_at: now
      },
      {
        user_id: userMap['user2@cafe.com'],
        cafe_id: cafeMap['The Coffee House - Signature'],
        rating: 4,
        comment: 'Giá hơi cao nhưng nước ngon.',
        created_at: now, updated_at: now
      }
    ], {});

    // ==========================================================
    // 8. FAVORITES
    // ==========================================================
    await queryInterface.bulkInsert('Favorites', [
      { user_id: userMap['user1@cafe.com'], cafe_id: cafeMap['The Coffee House - Signature'], created_at: now },
      { user_id: userMap['user1@cafe.com'], cafe_id: cafeMap['Highlands Coffee - Landmark'], created_at: now }
    ], {});

    // ==========================================================
    // 9. NOTIFICATIONS
    // ==========================================================
    await queryInterface.bulkInsert('Notifications', [
      {
        type: 'NEW_CAFE',
        title: 'Có quán mới chờ duyệt',
        content: 'Chủ quán B vừa đăng ký quán Goc Da Lat.',
        is_read: false,
        created_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notifications', null, {});
    await queryInterface.bulkDelete('Favorites', null, {});
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('Promotions', null, {});
    await queryInterface.bulkDelete('CafePhotos', null, {});
    await queryInterface.bulkDelete('Cafes', null, {});
    await queryInterface.bulkDelete('OwnerProfiles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('TermsOfUses', null, {});
  }
};