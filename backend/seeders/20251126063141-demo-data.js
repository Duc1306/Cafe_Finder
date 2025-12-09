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
      content: `カフェファインダー利用規約

第1条（はじめに）
本利用規約（以下「本規約」といいます）は、カフェファインダー（以下「本サービス」といいます）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます）には、本規約に従って本サービスをご利用いただきます。

第2条（利用登録）
1. 本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
   - 利用登録の申請に際して虚偽の事項を届け出た場合
   - 本規約に違反したことがある者からの申請である場合
   - その他、当社が利用登録を相当でないと判断した場合

第3条（ユーザーIDおよびパスワードの管理）
1. ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
2. ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。

第4条（禁止事項）
ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
1. 法令または公序良俗に違反する行為
2. 犯罪行為に関連する行為
3. 本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為
4. 当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
5. 本サービスによって得られた情報を商業的に利用する行為
6. 当社のサービスの運営を妨害するおそれのある行為
7. 不正アクセスをし、またはこれを試みる行為
8. 他のユーザーに関する個人情報等を収集または蓄積する行為
9. 不正な目的を持って本サービスを利用する行為
10. その他、当社が不適切と判断する行為

第5条（本サービスの提供の停止等）
当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
1. 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
2. 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
3. コンピュータまたは通信回線等が事故により停止した場合
4. その他、当社が本サービスの提供が困難と判断した場合

第6条（利用制限および登録抹消）
当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
1. 本規約のいずれかの条項に違反した場合
2. 登録事項に虚偽の事実があることが判明した場合
3. その他、当社が本サービスの利用を適当でないと判断した場合

第7条（保証の否認および免責事項）
1. 当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
2. 当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。

第8条（サービス内容の変更等）
当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。

第9条（利用規約の変更）
当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。

第10条（個人情報の取扱い）
当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。

第11条（通知または連絡）
ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。

第12条（権利義務の譲渡の禁止）
ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。

第13条（準拠法・裁判管轄）
1. 本規約の解釈にあたっては、日本法を準拠法とします。
2. 本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。

【お問い合わせ先】
カフェファインダー運営事務局
メール: support@cafefinder.example.com
電話: 03-1234-5678（平日10:00～18:00）

以上

制定日: 2025年1月1日
最終更新日: 2025年1月1日`,
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
    // 4. CAFES (Đầy đủ các trạng thái để test)
    // ==========================================================
  await queryInterface.bulkInsert('Cafes', [
  // ========== ACTIVE Cafes ==========
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'The Coffee House - Signature',
    description: 'Không gian sang trọng, view đẹp, phục vụ nhanh chóng.',
    address_line: '86 Nguyen Hue',
    district: 'Quan 1',
    city: 'Ho Chi Minh',
    latitude: 10.776, longitude: 106.700,
    phone_contact: '0901234567',
    website_url: 'https://thecoffeehouse.com',
    open_time: '07:00:00', close_time: '22:00:00',
    avg_price_min: 40000, avg_price_max: 80000,
    has_wifi: true, has_ac: true, is_quiet: true, has_parking: true,
    allow_smoking: false, allow_pets: false,
    amenities_text: 'WiFi miễn phí, điều hòa, bãi đỗ xe',
    status: 'ACTIVE',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Highlands Coffee - Landmark 81',
    description: 'Nằm ngay dưới chân tòa nhà Landmark 81, view sông tuyệt đẹp.',
    address_line: '208 Nguyen Huu Canh',
    district: 'Binh Thanh',
    city: 'Ho Chi Minh',
    latitude: 10.790, longitude: 106.720,
    phone_contact: '0902345678',
    website_url: 'https://highlandscoffee.com',
    open_time: '07:00:00', close_time: '23:00:00',
    avg_price_min: 30000, avg_price_max: 70000,
    has_wifi: true, has_ac: true, has_parking: true, is_quiet: false,
    allow_smoking: false, allow_pets: false,
    amenities_text: 'WiFi tốc độ cao, máy lạnh, bãi đỗ xe rộng',
    status: 'ACTIVE',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Cong Caphe - Truc Bach',
    description: 'Không gian vintage, view hồ Trúc Bạch, phong cách cổ điển.',
    address_line: '5 Truc Bach',
    district: 'Ba Dinh',
    city: 'Ha Noi',
    latitude: 21.041, longitude: 105.842,
    phone_contact: '0903456789',
    open_time: '07:00:00', close_time: '23:00:00',
    avg_price_min: 35000, avg_price_max: 65000,
    has_wifi: true, has_ac: false, allow_smoking: true, allow_pets: false,
    amenities_text: 'WiFi, không gian vintage',
    status: 'ACTIVE',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner2@cafe.com'],
    name: 'Hidden Gem Coffee',
    description: 'Quán nhỏ trong ngõ, yên tĩnh, phù hợp làm việc và học tập.',
    address_line: 'Ngo 12 Lang Ha',
    district: 'Dong Da',
    city: 'Ha Noi',
    latitude: 21.013, longitude: 105.816,
    phone_contact: '0904567890',
    open_time: '08:00:00', close_time: '22:00:00',
    avg_price_min: 20000, avg_price_max: 40000,
    has_wifi: true, has_ac: true, is_quiet: true, has_parking: false,
    allow_smoking: false, allow_pets: true,
    amenities_text: 'WiFi nhanh, yên tĩnh, cho phép thú cưng',
    status: 'ACTIVE',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner2@cafe.com'],
    name: 'Starbucks Coffee - Vincom',
    description: 'Chuỗi cà phê nổi tiếng quốc tế, không gian hiện đại.',
    address_line: '72 Le Thanh Ton, Vincom Center',
    district: 'Quan 1',
    city: 'Ho Chi Minh',
    latitude: 10.782, longitude: 106.698,
    phone_contact: '0905678901',
    website_url: 'https://starbucks.vn',
    open_time: '07:00:00', close_time: '22:30:00',
    avg_price_min: 50000, avg_price_max: 150000,
    has_wifi: true, has_ac: true, has_parking: true, is_quiet: false,
    allow_smoking: false, allow_pets: false,
    amenities_text: 'WiFi, điều hòa, bãi đỗ xe tại trung tâm',
    status: 'ACTIVE',
    created_at: now, updated_at: now
  },

  // ========== PENDING Cafes (Chờ duyệt) ==========
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Goc Da Lat Coffee',
    description: 'Quán nhỏ chill chill phong cách Đà Lạt, đang chờ duyệt.',
    address_line: 'Hem 123 Le Loi',
    district: 'Quan 1',
    city: 'Ho Chi Minh',
    latitude: 10.770, longitude: 106.690,
    phone_contact: '0906789012',
    open_time: '08:00:00', close_time: '21:00:00',
    avg_price_min: 20000, avg_price_max: 50000,
    has_wifi: true, has_ac: false, allow_smoking: true, allow_pets: true,
    amenities_text: 'WiFi, không gian mở',
    status: 'PENDING',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner2@cafe.com'],
    name: 'Urban Station Coffee & Workspace',
    description: 'Quán cafe kết hợp coworking space, đang chờ phê duyệt.',
    address_line: '234 Cach Mang Thang 8',
    district: 'Quan 3',
    city: 'Ho Chi Minh',
    latitude: 10.786, longitude: 106.679,
    phone_contact: '0907890123',
    website_url: 'https://urbanstation.vn',
    open_time: '07:30:00', close_time: '23:00:00',
    avg_price_min: 30000, avg_price_max: 80000,
    has_wifi: true, has_ac: true, is_quiet: true, has_parking: true,
    allow_smoking: false, allow_pets: false,
    amenities_text: 'WiFi tốc độ cao, phòng họp, bãi đỗ xe',
    status: 'PENDING',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Brew & Breakfast Cafe',
    description: 'Quán cafe phục vụ bữa sáng, đang chờ xét duyệt.',
    address_line: '45 Hai Ba Trung',
    district: 'Hoan Kiem',
    city: 'Ha Noi',
    latitude: 21.023, longitude: 105.853,
    phone_contact: '0908901234',
    open_time: '06:30:00', close_time: '14:00:00',
    avg_price_min: 25000, avg_price_max: 60000,
    has_wifi: true, has_ac: true, has_parking: false,
    allow_smoking: false, allow_pets: true,
    amenities_text: 'WiFi, bữa sáng all day',
    status: 'PENDING',
    created_at: now, updated_at: now
  },

  // ========== REJECTED Cafes (Bị từ chối) ==========
  { 
    owner_id: userMap['owner2@cafe.com'],
    name: 'Coffee Corner - Rejected',
    description: '[REJECTED] Thiếu giấy phép kinh doanh hợp lệ.\n\nQuán cafe góc phố, không gian nhỏ gọn.',
    address_line: '78 Tran Hung Dao',
    district: 'Quan 5',
    city: 'Ho Chi Minh',
    latitude: 10.754, longitude: 106.675,
    phone_contact: '0909012345',
    open_time: '08:00:00', close_time: '20:00:00',
    avg_price_min: 15000, avg_price_max: 35000,
    has_wifi: false, has_ac: false, has_parking: false,
    status: 'REJECTED',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Night Owl Cafe',
    description: '[REJECTED] Địa chỉ không phù hợp với quy hoạch khu vực.\n\nQuán cafe mở cửa đêm khuya.',
    address_line: '156 Nguyen Trai',
    district: 'Thanh Xuan',
    city: 'Ha Noi',
    latitude: 21.001, longitude: 105.807,
    phone_contact: '0900123456',
    open_time: '18:00:00', close_time: '02:00:00',
    avg_price_min: 30000, avg_price_max: 70000,
    has_wifi: true, has_ac: true, allow_smoking: true,
    status: 'REJECTED',
    created_at: now, updated_at: now
  },

  // ========== CLOSED Cafes (Đã đóng cửa) ==========
  { 
    owner_id: userMap['owner2@cafe.com'],
    name: 'Old Town Coffee - Closed',
    description: 'Quán cafe đã ngừng hoạt động do chuyển địa điểm.',
    address_line: '89 Pham Ngu Lao',
    district: 'Quan 1',
    city: 'Ho Chi Minh',
    latitude: 10.767, longitude: 106.693,
    phone_contact: '0901234568',
    open_time: '07:00:00', close_time: '22:00:00',
    avg_price_min: 25000, avg_price_max: 55000,
    has_wifi: true, has_ac: true,
    status: 'CLOSED',
    created_at: now, updated_at: now
  },
  { 
    owner_id: userMap['owner1@cafe.com'],
    name: 'Sunset Rooftop Cafe',
    description: 'Quán cafe sân thượng tạm ngừng hoạt động để sửa chữa.',
    address_line: '12 Ly Tu Trong',
    district: 'Hoan Kiem',
    city: 'Ha Noi',
    latitude: 21.028, longitude: 105.851,
    phone_contact: '0902345679',
    open_time: '16:00:00', close_time: '23:00:00',
    avg_price_min: 40000, avg_price_max: 90000,
    has_wifi: true, has_ac: false, has_parking: false,
    status: 'CLOSED',
    created_at: now, updated_at: now
  }
], {});

    const cafes = await queryInterface.sequelize.query(`SELECT id, name FROM "Cafes";`);
    const cafeMap = {};
    cafes[0].forEach(c => cafeMap[c.name] = c.id);

    // ==========================================================
    // 5. CAFE PHOTOS (Ảnh thật từ Unsplash)
    // ==========================================================
    await queryInterface.bulkInsert('CafePhotos', [
      // The Coffee House - Signature
      { 
        cafe_id: cafeMap['The Coffee House - Signature'], 
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },
      { 
        cafe_id: cafeMap['The Coffee House - Signature'], 
        url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', 
        photo_type: 'EXTERIOR', 
        is_cover: false, 
        created_at: now, updated_at: now 
      },
      { 
        cafe_id: cafeMap['The Coffee House - Signature'], 
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', 
        photo_type: 'FOOD', 
        is_cover: false, 
        created_at: now, updated_at: now 
      },

      // Highlands Coffee - Landmark 81
      { 
        cafe_id: cafeMap['Highlands Coffee - Landmark 81'], 
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },
      { 
        cafe_id: cafeMap['Highlands Coffee - Landmark 81'], 
        url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', 
        photo_type: 'EXTERIOR', 
        is_cover: false, 
        created_at: now, updated_at: now 
      },

      // Cong Caphe - Truc Bach
      { 
        cafe_id: cafeMap['Cong Caphe - Truc Bach'], 
        url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },
      { 
        cafe_id: cafeMap['Cong Caphe - Truc Bach'], 
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 
        photo_type: 'FOOD', 
        is_cover: false, 
        created_at: now, updated_at: now 
      },

      // Hidden Gem Coffee
      { 
        cafe_id: cafeMap['Hidden Gem Coffee'], 
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },

      // Starbucks Coffee - Vincom
      { 
        cafe_id: cafeMap['Starbucks Coffee - Vincom'], 
        url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', 
        photo_type: 'EXTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },
      { 
        cafe_id: cafeMap['Starbucks Coffee - Vincom'], 
        url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: false, 
        created_at: now, updated_at: now 
      },

      // Goc Da Lat Coffee (PENDING)
      { 
        cafe_id: cafeMap['Goc Da Lat Coffee'], 
        url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },

      // Urban Station Coffee & Workspace (PENDING)
      { 
        cafe_id: cafeMap['Urban Station Coffee & Workspace'], 
        url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', 
        photo_type: 'INTERIOR', 
        is_cover: true, 
        created_at: now, updated_at: now 
      },

      // Brew & Breakfast Cafe (PENDING)
      { 
        cafe_id: cafeMap['Brew & Breakfast Cafe'], 
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 
        photo_type: 'FOOD', 
        is_cover: true, 
        created_at: now, updated_at: now 
      }
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
      },
      {
        cafe_id: cafeMap['Highlands Coffee - Landmark 81'],
        title: 'Buy 1 Get 1',
        description: 'Mua 1 tặng 1 cho đồ uống size M.',
        discount_type: 'PERCENT',
        discount_value: 50,
        start_date: '2024-12-01',
        end_date: '2025-12-31',
        is_active: true,
        created_at: now, updated_at: now
      },
      {
        cafe_id: cafeMap['Starbucks Coffee - Vincom'],
        title: 'Happy Hour',
        description: 'Giảm 30% từ 14h-16h hàng ngày.',
        discount_type: 'PERCENT',
        discount_value: 30,
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
      // Reviews for The Coffee House - Signature
      {
        user_id: userMap['user1@cafe.com'],
        cafe_id: cafeMap['The Coffee House - Signature'],
        rating: 5,
        comment: 'Quán đẹp, nhân viên thân thiện. View tuyệt vời!',
        created_at: now, updated_at: now
      },
      {
        user_id: userMap['user2@cafe.com'],
        cafe_id: cafeMap['The Coffee House - Signature'],
        rating: 4,
        comment: 'Giá hơi cao nhưng nước ngon, không gian sang trọng.',
        created_at: now, updated_at: now
      },
      
      // Reviews for Highlands Coffee - Landmark 81
      {
        user_id: userMap['user1@cafe.com'],
        cafe_id: cafeMap['Highlands Coffee - Landmark 81'],
        rating: 5,
        comment: 'View sông rất đẹp, phù hợp làm việc và hẹn hò.',
        created_at: now, updated_at: now
      },
      {
        user_id: userMap['user2@cafe.com'],
        cafe_id: cafeMap['Highlands Coffee - Landmark 81'],
        rating: 4,
        comment: 'Đông khách vào cuối tuần nhưng dịch vụ tốt.',
        created_at: now, updated_at: now
      },

      // Reviews for Cong Caphe - Truc Bach
      {
        user_id: userMap['user1@cafe.com'],
        cafe_id: cafeMap['Cong Caphe - Truc Bach'],
        rating: 5,
        comment: 'Phong cách vintage độc đáo, cà phê ngon.',
        created_at: now, updated_at: now
      },

      // Reviews for Hidden Gem Coffee
      {
        user_id: userMap['user2@cafe.com'],
        cafe_id: cafeMap['Hidden Gem Coffee'],
        rating: 5,
        comment: 'Quán yên tĩnh, wifi nhanh, rất thích hợp học bài.',
        created_at: now, updated_at: now
      },

      // Reviews for Starbucks Coffee - Vincom
      {
        user_id: userMap['user1@cafe.com'],
        cafe_id: cafeMap['Starbucks Coffee - Vincom'],
        rating: 4,
        comment: 'Chất lượng ổn định như mọi chi nhánh Starbucks.',
        created_at: now, updated_at: now
      }
    ], {});

    // ==========================================================
    // 8. FAVORITES
    // ==========================================================
    await queryInterface.bulkInsert('Favorites', [
      { user_id: userMap['user1@cafe.com'], cafe_id: cafeMap['The Coffee House - Signature'], created_at: now },
      { user_id: userMap['user1@cafe.com'], cafe_id: cafeMap['Highlands Coffee - Landmark 81'], created_at: now },
      { user_id: userMap['user1@cafe.com'], cafe_id: cafeMap['Cong Caphe - Truc Bach'], created_at: now },
      { user_id: userMap['user2@cafe.com'], cafe_id: cafeMap['Hidden Gem Coffee'], created_at: now },
      { user_id: userMap['user2@cafe.com'], cafe_id: cafeMap['Starbucks Coffee - Vincom'], created_at: now }
    ], {});

    // ==========================================================
    // 9. NOTIFICATIONS
    // ==========================================================
    await queryInterface.bulkInsert('Notifications', [
      {
        type: 'NEW_CAFE',
        title: 'Có quán mới chờ duyệt',
        content: 'Chủ quán vừa đăng ký quán Goc Da Lat Coffee.',
        is_read: false,
        created_at: now
      },
      {
        type: 'NEW_CAFE',
        title: 'Có quán mới chờ duyệt',
        content: 'Chủ quán vừa đăng ký quán Urban Station Coffee & Workspace.',
        is_read: false,
        created_at: now
      },
      {
        type: 'SYSTEM',
        title: 'Thông báo hệ thống',
        content: 'The Coffee House - Signature vừa nhận được đánh giá 5 sao.',
        is_read: true,
        created_at: now
      },
      {
        type: 'NEW_USER',
        title: 'Người dùng mới',
        content: 'Có 2 người dùng mới đăng ký tài khoản hôm nay.',
        is_read: true,
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