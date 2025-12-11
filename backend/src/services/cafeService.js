// backend/src/services/cafeService.js
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

const cafeService = {
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

    // City
    if (city && city.trim()) {
      whereCafe.city = city.trim();
    }

    // District
    if (district && district.trim()) {
      whereCafe.district = district.trim();
    }

    // Price range
    const andConds = [];
    if (priceMinNum != null && !Number.isNaN(priceMinNum)) {
      andConds.push({ avg_price_max: { [Op.gte]: priceMinNum } });
    }
    if (priceMaxNum != null && !Number.isNaN(priceMaxNum)) {
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

    // 5. Promotions (đang/còn hiệu lực)
    const todayExpr = fn('CURRENT_DATE');
    const promotions = await Promotion.findAll({
      where: {
        cafe_id: cafeId,
        [Op.or]: [
          { is_active: true },
          {
            start_date: { [Op.lte]: todayExpr },
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: todayExpr } },
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
      photos,
      promotions,
      isFavorite,
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
        userName: plain.User?.full_name || null,
      };
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total,
      data,
    };
  },

  /**
   * Lấy danh sách các Quận/Huyện có quán đang hoạt động
   * Dùng để đổ dữ liệu vào Dropdown Filter
   */
  getActiveAreas: async () => {
    // Select DISTINCT district from Cafes where status = 'ACTIVE'
    const areas = await Cafe.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('district')), 'district']
      ],
      where: { status: 'ACTIVE' },
      order: [['district', 'ASC']],
      raw: true
    });

    // Trả về mảng string: ['Minato', 'Shibuya', 'Shinjuku', ...]
    return areas.map(a => a.district).filter(Boolean); // filter(Boolean) để loại bỏ null/empty
  }
};

module.exports = cafeService;
