// backend/src/services/cafeService.js
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * API danh sách quán cafe (public search)
 * - Filter: keyword, city, district, priceMin, priceMax, rating, openNow
 * - Pagination: page, limit
 * - Trả về:
 *   { page, limit, total, data: [ { id, name, addressLine, district, city, avgPriceMin, avgPriceMax,
 *                                   rating, favoritesCount, coverUrl, openTime, closeTime } ] }
 */
const cafeService = {
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
      openNow
    } = filters;

    const actualPage = Math.max(1, Number(page) || 1);
    const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (actualPage - 1) * actualLimit;

    const priceMinNum = priceMin != null && priceMin !== '' ? Number(priceMin) : null;
    const priceMaxNum = priceMax != null && priceMax !== '' ? Number(priceMax) : null;
    const ratingNum = rating != null && rating !== '' ? Number(rating) : null;
    const openNowFlag =
      openNow === true ||
      openNow === 'true' ||
      openNow === '1' ||
      openNow === 1;

    const whereClauses = [];
    const replacements = {
      limit: actualLimit,
      offset
    };

    // Chỉ lấy quán đang ACTIVE
    whereClauses.push(`c."status" = 'ACTIVE'`);

    // Tìm kiếm từ khóa theo name / address_line / city / district
    if (keyword && keyword.trim()) {
      whereClauses.push(
        '(c."name" ILIKE :keyword OR c."address_line" ILIKE :keyword OR c."city" ILIKE :keyword OR c."district" ILIKE :keyword)'
      );
      replacements.keyword = `%${keyword.trim()}%`;
    }

    // Filter theo city
    if (city && city.trim()) {
      whereClauses.push('c."city" = :city');
      replacements.city = city.trim();
    }

    // Filter theo district
    if (district && district.trim()) {
      whereClauses.push('c."district" = :district');
      replacements.district = district.trim();
    }

    // Filter theo price range
    if (priceMinNum != null && !Number.isNaN(priceMinNum)) {
      // Giá tối đa của quán phải >= priceMin (còn nằm trong khoảng người dùng yêu cầu)
      whereClauses.push('c."avg_price_max" >= :priceMin');
      replacements.priceMin = priceMinNum;
    }

    if (priceMaxNum != null && !Number.isNaN(priceMaxNum)) {
      // Giá tối thiểu của quán phải <= priceMax
      whereClauses.push('c."avg_price_min" <= :priceMax');
      replacements.priceMax = priceMaxNum;
    }

    // Filter openNow (dựa vào CURRENT_TIME)
    if (openNowFlag) {
      // Trường hợp cơ bản: open_time <= now <= close_time
      whereClauses.push(
        'c."open_time" IS NOT NULL AND c."close_time" IS NOT NULL ' +
        'AND CURRENT_TIME BETWEEN c."open_time" AND c."close_time"'
      );
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Filter theo rating (>= rating)
    let havingSQL = '';
    if (ratingNum != null && !Number.isNaN(ratingNum) && ratingNum > 0) {
      havingSQL = 'HAVING COALESCE(AVG(r.rating), 0) >= :minRating';
      replacements.minRating = ratingNum;
    }

    // Phần FROM + JOIN + GROUP BY dùng chung cho cả count và data
    const baseFrom = `
      FROM "Cafes" c
      LEFT JOIN "Reviews" r ON r.cafe_id = c.id
      LEFT JOIN "Favorites" f ON f.cafe_id = c.id
      LEFT JOIN "CafePhotos" cp ON cp.cafe_id = c.id AND cp.is_cover = true
      ${whereSQL}
      GROUP BY c.id
      ${havingSQL}
    `;

    // Query đếm tổng số quán (phục vụ pagination)
    const countSql = `
      SELECT COUNT(*)::bigint AS total
      FROM (
        SELECT c.id
        ${baseFrom}
      ) AS sub;
    `;

    const [countRow] = await sequelize.query(countSql, {
      type: QueryTypes.SELECT,
      replacements
    });

    const total = Number(countRow?.total || 0);

    // Query lấy danh sách quán + aggregate rating / favorites / cover
    const dataSql = `
      SELECT
        c.id,
        c.name,
        c.address_line AS "addressLine",
        c.district,
        c.city,
        c.avg_price_min AS "avgPriceMin",
        c.avg_price_max AS "avgPriceMax",
        COALESCE(AVG(r.rating), 0) AS rating,
        COUNT(DISTINCT f.user_id) AS "favoritesCount",
        MAX(cp.url) AS "coverUrl",
        c.open_time AS "openTime",
        c.close_time AS "closeTime"
      ${baseFrom}
      ORDER BY c.updated_at DESC
      LIMIT :limit OFFSET :offset;
    `;

    const rows = await sequelize.query(dataSql, {
      type: QueryTypes.SELECT,
      replacements
    });

    return {
      page: actualPage,
      limit: actualLimit,
      total,
      data: rows
    };
  }
};

module.exports = cafeService;
