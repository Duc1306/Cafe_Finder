// backend/src/services/userCafeService.js
const db = require('../models');
const { Cafe, Review, Favorite, CafePhoto, Promotion, User, sequelize } = db;
const { Op, fn, col, literal } = require('sequelize');

/**
 * Helper: map cafe raw record + stats thành shape response list
 */
function buildCafeListItem(cafe, ratingMap, favCountMap, coverMap) {
  const id = cafe.id;
  const rating = ratingMap[id]?.rating || 0;
  const favoritesCount = favCountMap[id]?.favoritesCount || 0;
  const coverUrl = coverMap[id]?.url || null;

  return {
    id,
    name: cafe.name,
    addressLine: cafe.address_line,
    district: cafe.district,
    city: cafe.city,
    avgPriceMin: cafe.avg_price_min,
    avgPriceMax: cafe.avg_price_max,
    rating,
    favoritesCount,
    coverUrl,
    openTime: cafe.open_time,
    closeTime: cafe.close_time,
  };
}

const userCafeService = {
  // ====================== LIST ======================
  /**
   * GET /cafes?keyword=&city=&district=&priceMin=&priceMax=&rating=&openNow=&page=&limit=
   * Danh sách quán (search / filter / paginate)
   */
  getCafeList: async (filters) => {
    const {
      page = 1,
      limit = 10,
      keyword = '',
      city,
      district,
      priceMin,
      priceMax,
      rating,
      openNow,
      hasWifi,
      hasAc,
      isQuiet,
      hasParking,
      allowPets,
      allowSmoking,
    } = filters;

    const actualPage = Math.max(1, Number(page) || 1);
    const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (actualPage - 1) * actualLimit;

    const priceMinNum =
      priceMin != null && priceMin !== '' ? Number(priceMin) : null;
    const priceMaxNum =
      priceMax != null && priceMax !== '' ? Number(priceMax) : null;
    const ratingNum =
      rating != null && rating !== '' ? Number(rating) : null;
    const openNowFlag =
      openNow === true ||
      openNow === 'true' ||
      openNow === '1' ||
      openNow === 1;

    // ====== WHERE cơ bản cho bảng Cafes ======
    const whereCafe = {
      status: 'ACTIVE',
    };

    // Từ khóa
    if (keyword && keyword.trim()) {
      whereCafe[Op.or] = [
        { name: { [Op.iLike]: `%${keyword.trim()}%` } },
        { address_line: { [Op.iLike]: `%${keyword.trim()}%` } },
        { city: { [Op.iLike]: `%${keyword.trim()}%` } },
        { district: { [Op.iLike]: `%${keyword.trim()}%` } },
      ];
    }

    // City - fuzzy search with ILIKE
    if (city && city.trim()) {
      whereCafe.city = { [Op.iLike]: `%${city.trim()}%` };
    }

    // District - fuzzy search with ILIKE
    if (district && district.trim()) {
      whereCafe.district = { [Op.iLike]: `%${district.trim()}%` };
    }

    // Amenities filters
    if (hasWifi === true || hasWifi === 'true') {
      whereCafe.has_wifi = true;
    }
    if (hasAc === true || hasAc === 'true') {
      whereCafe.has_ac = true;
    }
    if (isQuiet === true || isQuiet === 'true') {
      whereCafe.is_quiet = true;
    }
    if (hasParking === true || hasParking === 'true') {
      whereCafe.has_parking = true;
    }
    if (allowPets === true || allowPets === 'true') {
      whereCafe.allow_pets = true;
    }
    if (allowSmoking === true || allowSmoking === 'true') {
      whereCafe.allow_smoking = true;
    }

    // Price range - Lọc cafe có khoảng giá overlap với khoảng user chọn
    // Ví dụ: User chọn 20k-50k
    // - Cafe 10k-40k: OK (có món 20k-40k trong range)
    // - Cafe 30k-60k: OK (có món 30k-50k trong range)
    // - Cafe 60k-100k: Loại (không có món nào trong range)
    const andConds = [];
    if (priceMinNum != null && !Number.isNaN(priceMinNum)) {
      // Giá MAX của cafe phải >= giá min user nhập (cafe có món >= priceMin)
      andConds.push({ avg_price_max: { [Op.gte]: priceMinNum } });
    }
    if (priceMaxNum != null && !Number.isNaN(priceMaxNum)) {
      // Giá MIN của cafe phải <= giá max user nhập (cafe có món <= priceMax)
      andConds.push({ avg_price_min: { [Op.lte]: priceMaxNum } });
    }

    // Open now: dùng literal cho điều kiện thời gian
    if (openNowFlag) {
      andConds.push(
        literal(
          `"Cafe"."open_time" IS NOT NULL AND "Cafe"."close_time" IS NOT NULL ` +
          `AND CURRENT_TIME BETWEEN "Cafe"."open_time" AND "Cafe"."close_time"`
        )
      );
    }

    if (andConds.length > 0) {
      whereCafe[Op.and] = andConds;
    }

    // ====== Query 1: đếm tổng số quán thỏa điều kiện (không cần JOIN) ======
    const { count: total } = await Cafe.findAndCountAll({
      where: whereCafe,
      // Không cần offset/limit ở đây, chỉ count
    });

    if (total === 0) {
      return {
        page: actualPage,
        limit: actualLimit,
        total: 0,
        data: [],
      };
    }

    // ====== Query 2: lấy page quán ======
    const cafes = await Cafe.findAll({
      where: whereCafe,
      attributes: [
        'id',
        'name',
        'address_line',
        'district',
        'city',
        'avg_price_min',
        'avg_price_max',
        'open_time',
        'close_time',
        'updated_at',
      ],
      order: [['updated_at', 'DESC']],
      limit: actualLimit,
      offset,
    });

    const cafeIds = cafes.map((c) => c.id);
    if (cafeIds.length === 0) {
      return {
        page: actualPage,
        limit: actualLimit,
        total,
        data: [],
      };
    }

    // ====== Query 3: thống kê rating cho các cafe trong page ======
    const ratingRows = await Review.findAll({
      where: {
        cafe_id: {
          [Op.in]: cafeIds,
        },
      },
      attributes: [
        'cafe_id',
        [fn('COUNT', col('id')), 'reviewsCount'],
        [fn('COALESCE', fn('AVG', col('rating')), 0), 'rating'],
      ],
      group: ['cafe_id'],
    });

    const ratingMap = {};
    ratingRows.forEach((row) => {
      const plain = row.get({ plain: true });
      ratingMap[plain.cafe_id] = {
        reviewsCount: Number(plain.reviewsCount || 0),
        rating: Number(plain.rating || 0),
      };
    });

    // Nếu filter theo rating >= X thì lọc lại ở mức JS
    let filteredCafes = cafes;
    if (ratingNum != null && !Number.isNaN(ratingNum) && ratingNum > 0) {
      filteredCafes = cafes.filter((c) => {
        const stat = ratingMap[c.id];
        const r = stat ? stat.rating : 0;
        return r >= ratingNum;
      });
    }

    const filteredIds = filteredCafes.map((c) => c.id);

    if (filteredIds.length === 0) {
      return {
        page: actualPage,
        limit: actualLimit,
        total: 0,
        data: [],
      };
    }

    // ====== Query 4: favorites count ======
    const favRows = await Favorite.findAll({
      where: {
        cafe_id: {
          [Op.in]: filteredIds,
        },
      },
      attributes: [
        'cafe_id',
        [fn('COUNT', fn('DISTINCT', col('user_id'))), 'favoritesCount'],
      ],
      group: ['cafe_id'],
    });

    const favCountMap = {};
    favRows.forEach((row) => {
      const plain = row.get({ plain: true });
      favCountMap[plain.cafe_id] = {
        favoritesCount: Number(plain.favoritesCount || 0),
      };
    });

    // ====== Query 5: cover photo ======
    const coverRows = await CafePhoto.findAll({
      where: {
        cafe_id: {
          [Op.in]: filteredIds,
        },
        is_cover: true,
      },
      attributes: ['cafe_id', 'url'],
    });

    const coverMap = {};
    coverRows.forEach((row) => {
      const plain = row.get({ plain: true });
      coverMap[plain.cafe_id] = {
        url: plain.url,
      };
    });

    // Build kết quả
    const data = filteredCafes.map((c) =>
      buildCafeListItem(
        c.get({ plain: true }),
        ratingMap,
        favCountMap,
        coverMap
      )
    );

    return {
      page: actualPage,
      limit: actualLimit,
      total: data.length === cafes.length ? total : data.length,
      data,
    };
  },

  // ====================== DETAIL ======================
  /**
   * GET /cafes/:id
   * Thông tin chi tiết quán + ảnh + thống kê review/favorite
   */
  getCafeDetail: async (cafeId, currentUserId = null) => {
    // 1. Lấy quán (ACTIVE)
    const cafe = await Cafe.findOne({
      where: {
        id: cafeId,
        status: 'ACTIVE',
      },
    });

    if (!cafe) {
      return null;
    }

    const cafePlain = cafe.get({ plain: true });

    // 2. Stats review (rating + count)
    const reviewStat = await Review.findOne({
      where: { cafe_id: cafeId },
      attributes: [
        [fn('COALESCE', fn('AVG', col('rating')), 0), 'rating'],
        [fn('COUNT', col('id')), 'reviewsCount'],
      ],
      raw: true,
    });

    const rating = Number(reviewStat?.rating || 0);
    const reviewsCount = Number(reviewStat?.reviewsCount || 0);

    // 3. Stats favorites
    const favStat = await Favorite.findOne({
      where: { cafe_id: cafeId },
      attributes: [
        [fn('COUNT', fn('DISTINCT', col('user_id'))), 'favoritesCount'],
      ],
      raw: true,
    });

    const favoritesCount = Number(favStat?.favoritesCount || 0);

    // 4. Photos
    const photos = await CafePhoto.findAll({
      where: { cafe_id: cafeId },
      attributes: [
        'id',
        'url',
        'photo_type',
        'is_cover',
        'created_at',
      ],
      order: [
        ['is_cover', 'DESC'],
        ['created_at', 'ASC'],
      ],
      raw: true,
    });

    // Add base URL to photos
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const photosWithFullUrls = photos.map(photo => ({
      ...photo,
      url: photo.url.startsWith('http') ? photo.url : `${baseURL}${photo.url}`
    }));

    // 5. Promotions (đang/còn hiệu lực)
    const promotions = await Promotion.findAll({
      where: {
        cafe_id: cafeId,
        [Op.or]: [
          { is_active: true },
          {
            start_date: { [Op.lte]: literal('CURRENT_DATE') },
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: literal('CURRENT_DATE') } },
            ],
          },
        ],
      },
      attributes: [
        'id',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'start_date',
        'end_date',
        'is_active',
      ],
      order: [['start_date', 'DESC']],
      raw: true,
    });

    // 6. User hiện tại đã favorite chưa
    let isFavorite = false;
    if (currentUserId) {
      const favRow = await Favorite.findOne({
        where: {
          cafe_id: cafeId,
          user_id: currentUserId,
        },
      });
      isFavorite = !!favRow;
    }

    return {
      id: cafePlain.id,
      ownerId: cafePlain.owner_id,
      name: cafePlain.name,
      description: cafePlain.description,
      addressLine: cafePlain.address_line,
      district: cafePlain.district,
      city: cafePlain.city,
      latitude: cafePlain.latitude,
      longitude: cafePlain.longitude,
      phoneContact: cafePlain.phone_contact,
      websiteUrl: cafePlain.website_url,
      openTime: cafePlain.open_time,
      closeTime: cafePlain.close_time,
      avgPriceMin: cafePlain.avg_price_min,
      avgPriceMax: cafePlain.avg_price_max,
      hasWifi: cafePlain.has_wifi,
      hasAc: cafePlain.has_ac,
      isQuiet: cafePlain.is_quiet,
      hasParking: cafePlain.has_parking,
      allowSmoking: cafePlain.allow_smoking,
      allowPets: cafePlain.allow_pets,
      amenitiesText: cafePlain.amenities_text,
      status: cafePlain.status,
      createdAt: cafePlain.created_at,
      updatedAt: cafePlain.updated_at,
      rating,
      reviewsCount,
      favoritesCount,
      photos: photosWithFullUrls,
      promotions,
      isFavorite,
    };
  },

  // ====================== USER FAVORITES ======================
  /**
   * GET /favorites
   * Danh sách quán user đã "Yêu thích"
   */
  getUserFavorites: async ({ userId, page = 1, limit = 10 }) => {
    const actualPage = Math.max(1, Number(page) || 1);
    const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (actualPage - 1) * actualLimit;

    // 1. Đếm tổng
    const { count: total } = await Favorite.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Cafe,
          as: 'cafe',
          required: true,
          where: { status: 'ACTIVE' },
        },
      ],
    });

    if (total === 0) {
      return {
        page: actualPage,
        limit: actualLimit,
        total: 0,
        data: [],
      };
    }

    // 2. Lấy page favorites + cafe
    const favs = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Cafe,
          as: 'cafe',
          required: true,
          where: { status: 'ACTIVE' },
          attributes: [
            'id',
            'name',
            'address_line',
            'district',
            'city',
            'avg_price_min',
            'avg_price_max',
            'open_time',
            'close_time',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: actualLimit,
      offset,
    });

    const cafeIds = favs.map((f) => f.cafe_id);
    if (cafeIds.length === 0) {
      return {
        page: actualPage,
        limit: actualLimit,
        total,
        data: [],
      };
    }

    // 3. Stats rating
    const ratingRows = await Review.findAll({
      where: {
        cafe_id: {
          [Op.in]: cafeIds,
        },
      },
      attributes: [
        'cafe_id',
        [fn('COUNT', col('id')), 'reviewsCount'],
        [fn('COALESCE', fn('AVG', col('rating')), 0), 'rating'],
      ],
      group: ['cafe_id'],
    });

    const ratingMap = {};
    ratingRows.forEach((row) => {
      const plain = row.get({ plain: true });
      ratingMap[plain.cafe_id] = {
        reviewsCount: Number(plain.reviewsCount || 0),
        rating: Number(plain.rating || 0),
      };
    });

    // 4. Stats favorites count
    const favRows = await Favorite.findAll({
      where: {
        cafe_id: {
          [Op.in]: cafeIds,
        },
      },
      attributes: [
        'cafe_id',
        [fn('COUNT', fn('DISTINCT', col('user_id'))), 'favoritesCount'],
      ],
      group: ['cafe_id'],
    });

    const favCountMap = {};
    favRows.forEach((row) => {
      const plain = row.get({ plain: true });
      favCountMap[plain.cafe_id] = {
        favoritesCount: Number(plain.favoritesCount || 0),
      };
    });

    // 5. Cover photo
    const coverRows = await CafePhoto.findAll({
      where: {
        cafe_id: {
          [Op.in]: cafeIds,
        },
        is_cover: true,
      },
      attributes: ['cafe_id', 'url'],
    });

    const coverMap = {};
    coverRows.forEach((row) => {
      const plain = row.get({ plain: true });
      coverMap[plain.cafe_id] = { url: plain.url };
    });

    // 6. Build data
    const data = favs.map((fav) => {
      const f = fav.get({ plain: true });
      const c = f.cafe;

      const id = c.id;
      const rating = ratingMap[id]?.rating || 0;
      const favoritesCount = favCountMap[id]?.favoritesCount || 0;
      const coverUrl = coverMap[id]?.url || null;

      return {
        id,
        name: c.name,
        addressLine: c.address_line,
        district: c.district,
        city: c.city,
        avgPriceMin: c.avg_price_min,
        avgPriceMax: c.avg_price_max,
        rating,
        favoritesCount,
        coverUrl,
        openTime: c.open_time,
        closeTime: c.close_time,
        favoritedAt: f.created_at,
      };
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total,
      data,
    };
  },

  // ====================== REVIEWS ======================
  /**
   * GET /cafes/:id/reviews?page=&limit=
   */
  getCafeReviews: async (cafeId, { page = 1, limit = 10 }) => {
    const actualPage = Math.max(1, Number(page) || 1);
    const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (actualPage - 1) * actualLimit;

    const { count: total, rows } = await Review.findAndCountAll({
      where: { cafe_id: cafeId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'full_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: actualLimit,
      offset,
    });

    const data = rows.map((r) => {
      const plain = r.get({ plain: true });
      return {
        id: plain.id,
        rating: plain.rating,
        comment: plain.comment,
        imageUrl: plain.image_url,
        createdAt: plain.created_at,
        updatedAt: plain.updated_at,
        userId: plain.user_id,
        userName: plain.author?.full_name || null,
      };
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total,
      data,
    };
  },

  // ====================== FAVORITES ======================
  /**
   * Thêm yêu thích: POST /favorites
   */
  addFavorite: async ({ cafeId, userId }) => {
    const cafe = await Cafe.findOne({
      where: { id: cafeId, status: 'ACTIVE' },
    });

    if (!cafe) {
      return { notFound: true };
    }

    await Favorite.findOrCreate({
      where: {
        cafe_id: cafeId,
        user_id: userId,
      },
      defaults: {
        cafe_id: cafeId,
        user_id: userId,
      },
    });

    const favoritesCount = await Favorite.count({
      where: { cafe_id: cafeId },
    });

    return {
      cafeId,
      favoritesCount,
      isFavorite: true,
    };
  },

  /**
   * Xoá yêu thích: DELETE /favorites/:cafeId
   */
  removeFavorite: async ({ cafeId, userId }) => {
    await Favorite.destroy({
      where: {
        cafe_id: cafeId,
        user_id: userId,
      },
    });

    const favoritesCount = await Favorite.count({
      where: { cafe_id: cafeId },
    });

    return {
      cafeId,
      favoritesCount,
      isFavorite: false,
    };
  },

  // ====================== CREATE REVIEW ======================
  /**
   * POST /cafes/:id/reviews
   * Đăng đánh giá mới cho quán cafe
   */
  createReview: async ({ cafeId, userId, rating, comment, imageUrl }) => {
    // 1. Kiểm tra quán tồn tại và ACTIVE
    const cafe = await Cafe.findOne({
      where: { id: cafeId, status: 'ACTIVE' },
    });

    if (!cafe) {
      return { notFound: true };
    }

    // 2. Kiểm tra rating hợp lệ (1-5)
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return { invalidRating: true };
    }

    // 3. Kiểm tra user đã review quán này chưa
    const existingReview = await Review.findOne({
      where: { cafe_id: cafeId, user_id: userId },
    });

    if (existingReview) {
      // Cập nhật review cũ
      await existingReview.update({
        rating: ratingNum,
        comment: comment || null,
        image_url: imageUrl || null,
      });

      return {
        id: existingReview.id,
        cafeId,
        userId,
        rating: ratingNum,
        comment: comment || null,
        imageUrl: imageUrl || null,
        createdAt: existingReview.created_at,
        updatedAt: existingReview.updated_at,
        isUpdated: true,
      };
    }

    // 4. Tạo review mới
    const newReview = await Review.create({
      cafe_id: cafeId,
      user_id: userId,
      rating: ratingNum,
      comment: comment || null,
      image_url: imageUrl || null,
    });

    return {
      id: newReview.id,
      cafeId,
      userId,
      rating: ratingNum,
      comment: comment || null,
      imageUrl: imageUrl || null,
      createdAt: newReview.created_at,
      updatedAt: newReview.updated_at,
      isUpdated: false,
    };
  },
};

module.exports = userCafeService;
