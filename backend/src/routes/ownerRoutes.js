const express = require('express');
const { pool } = require('../db');

const router = express.Router();

/**
 * GET /api/owner/dashboard/overview?ownerId=1
 */
router.get('/dashboard/overview', async (req, res, next) => {
  try {
    const ownerId = Number(req.query.ownerId);
    if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });

    const [[{ cafes_count }]] = await pool.query(
      'SELECT COUNT(*) AS cafes_count FROM cafes WHERE owner_id = ?', [ownerId]
    );

    const [[fav]] = await pool.query(
      `SELECT COUNT(*) AS favorites_count
         FROM favorites f JOIN cafes c ON c.id = f.cafe_id
        WHERE c.owner_id = ?`, [ownerId]
    );

    const [[rev]] = await pool.query(
      `SELECT COUNT(*) AS reviews_count, ROUND(AVG(r.rating), 2) AS avg_rating
         FROM reviews r JOIN cafes c ON c.id = r.cafe_id
        WHERE c.owner_id = ?`, [ownerId]
    );

    const [recentReviews] = await pool.query(
      `SELECT r.id, r.cafe_id, c.name AS cafe_name, r.rating, r.comment, r.created_at
         FROM reviews r JOIN cafes c ON c.id = r.cafe_id
        WHERE c.owner_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5`, [ownerId]
    );

    res.json({
      ownerId,
      totals: {
        cafes: Number(cafes_count) || 0,
        favorites: Number(fav?.favorites_count) || 0,
        reviews: Number(rev?.reviews_count) || 0,
        avgRating: Number(rev?.avg_rating) || 0
      },
      recentReviews
    });
  } catch (e) { next(e); }
});

/**
 * GET /api/owner/shops?ownerId=1&page=1&limit=8&keyword=&city=
 */
router.get('/shops', async (req, res, next) => {
  try {
    const ownerId = Number(req.query.ownerId);
    if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });

    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const keyword = (req.query.keyword || '').trim();
    const city    = (req.query.city || '').trim();

    const where = ['c.owner_id = ?'];
    const params = [ownerId];

    if (keyword) {
      where.push('(c.name LIKE ? OR c.address_line LIKE ? OR c.city LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (city) {
      where.push('c.city = ?');
      params.push(city);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [rows] = await pool.query(
      `SELECT 
         c.id, c.name, c.address_line, c.city, c.status,
         c.avg_price_min, c.avg_price_max,
         c.open_time, c.close_time,
         COALESCE(fv.fav_count, 0)     AS favorites_count,
         COALESCE(rv.reviews_count, 0) AS reviews_count,
         COALESCE(rv.avg_rating, 0)    AS avg_rating,
         cp.url                        AS cover_url
       FROM cafes c
       LEFT JOIN (
         SELECT cafe_id, COUNT(*) AS fav_count FROM favorites GROUP BY cafe_id
       ) fv ON fv.cafe_id = c.id
       LEFT JOIN (
         SELECT cafe_id, COUNT(*) AS reviews_count, ROUND(AVG(rating), 2) AS avg_rating
         FROM reviews GROUP BY cafe_id
       ) rv ON rv.cafe_id = c.id
       LEFT JOIN (
         SELECT cafe_id, url FROM cafe_photos WHERE is_cover = 1
       ) cp ON cp.cafe_id = c.id
       ${whereSql}
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM cafes c ${whereSql}`, params
    );

    res.json({ page, limit, total: Number(total) || 0, data: rows });
  } catch (e) { next(e); }
});

module.exports = router;
