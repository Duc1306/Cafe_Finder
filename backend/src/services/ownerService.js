const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const ownerService = {
  /**
   * Get dashboard overview statistics for owner
   */
  getDashboardStats: async (ownerId) => {
    // Count cafes
    const [cafeResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Cafes" WHERE owner_id = :ownerId',
      { replacements: { ownerId }, type: QueryTypes.SELECT }
    );
    const cafes_count = Number(cafeResult.count || 0);

    // Count favorites
    const [favResults] = await sequelize.query(
      `SELECT COUNT(*) as fav_count 
       FROM "Favorites" f 
       INNER JOIN "Cafes" c ON c.id = f.cafe_id 
       WHERE c.owner_id = :ownerId`,
      { 
        replacements: { ownerId },
        type: QueryTypes.SELECT 
      }
    );
    const favorites_count = Number(favResults?.fav_count || 0);

    // Count reviews and avg rating
    const [revResults] = await sequelize.query(
      `SELECT COUNT(*) as rev_count, ROUND(AVG(r.rating)::numeric, 2) as avg_rating
       FROM "Reviews" r 
       INNER JOIN "Cafes" c ON c.id = r.cafe_id 
       WHERE c.owner_id = :ownerId`,
      { 
        replacements: { ownerId },
        type: QueryTypes.SELECT 
      }
    );
    const reviews_count = Number(revResults?.rev_count || 0);
    const avgRating = Number(revResults?.avg_rating || 0);

    // Get recent reviews
    const recentReviews = await sequelize.query(
      `SELECT r.id, r.cafe_id, c.name as cafe_name, r.rating, r.comment, r.created_at
       FROM "Reviews" r 
       INNER JOIN "Cafes" c ON c.id = r.cafe_id 
       WHERE c.owner_id = :ownerId
       ORDER BY r.created_at DESC
       LIMIT 5`,
      { 
        replacements: { ownerId },
        type: QueryTypes.SELECT 
      }
    );

    return {
      totals: {
        cafes: cafes_count || 0,
        favorites: favorites_count || 0,
        reviews: reviews_count || 0,
        avgRating: avgRating || 0
      },
      recentReviews
    };
  },

  /**
   * Get paginated list of cafes for owner with filters
   */
  getOwnerCafes: async (ownerId, filters) => {
    const { page = 1, limit = 10, keyword = '', city = '' } = filters;
    
    const actualPage = Math.max(1, Number(page));
    const actualLimit = Math.min(50, Math.max(1, Number(limit)));
    const offset = (actualPage - 1) * actualLimit;

    let whereClause = 'c.owner_id = :ownerId';
    const replacements = { ownerId, limit: actualLimit, offset };

    if (keyword && keyword.trim()) {
      whereClause += ` AND (c.name ILIKE :keyword OR c.address_line ILIKE :keyword OR c.city ILIKE :keyword)`;
      replacements.keyword = `%${keyword.trim()}%`;
    }
    if (city && city.trim()) {
      whereClause += ' AND c.city = :city';
      replacements.city = city.trim();
    }

    // Get cafes with counts
    const cafes = await sequelize.query(
      `SELECT 
         c.id, c.name, c.address_line, c.city, c.status,
         c.avg_price_min, c.avg_price_max, c.open_time, c.close_time,
         COALESCE(COUNT(DISTINCT f.cafe_id), 0) AS favorites_count,
         COALESCE(COUNT(DISTINCT r.id), 0) AS reviews_count,
         COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
         cp.url AS cover_url
       FROM "Cafes" c
       LEFT JOIN "Favorites" f ON f.cafe_id = c.id
       LEFT JOIN "Reviews" r ON r.cafe_id = c.id
       LEFT JOIN "CafePhotos" cp ON cp.cafe_id = c.id AND cp.is_cover = true
       WHERE ${whereClause}
       GROUP BY c.id, cp.url
       ORDER BY c.updated_at DESC
       LIMIT :limit OFFSET :offset`,
      { 
        replacements,
        type: QueryTypes.SELECT 
      }
    );

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM "Cafes" c WHERE ${whereClause}`,
      { 
        replacements: { ownerId, keyword: replacements.keyword, city: replacements.city },
        type: QueryTypes.SELECT 
      }
    );

    return {
      page: actualPage,
      limit: actualLimit,
      total: Number(countResult?.total || 0),
      data: cafes.map(c => ({
        ...c,
        favorites_count: Number(c.favorites_count),
        reviews_count: Number(c.reviews_count),
        avg_rating: Number(c.avg_rating)
      }))
    };
  }
};

module.exports = ownerService;
