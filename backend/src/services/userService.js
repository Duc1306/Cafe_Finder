const { User, Favorite, Review, Cafe, CafePhoto } = require("../models");
const { Op } = require('sequelize');

const userService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'phone', 'role', 'status', 'created_at'],
      logging: false
    });
    return users;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url', 'dob', 'address', 'role', 'status', 'created_at'],
      logging: false
    });
    
    if (!user) {
      throw { status: 404, message: "ユーザーが見つかりません。" };
    }
    
    return user;
  },

  /**
   * Create new user (admin function)
   */
  createUser: async (userData) => {
    const { full_name, email, phone, role, status } = userData;

    // Check for duplicate email
    const existingUser = await User.findOne({ where: { email }, logging: false });
    if (existingUser) {
      throw { status: 400, message: "このメールアドレスは既に登録されています。" };
    }

    const user = await User.create({
      full_name,
      email,
      phone: phone || null,
      role: role || 'CUSTOMER',
      status: status || 'ACTIVE',
      password_hash: 'temp_password_hash' // Should be set properly in production
    });

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  },

  /**
   * Update user information
   */
  updateUser: async (userId, updateData) => {
    const user = await User.findByPk(userId, { logging: false });
    
    if (!user) {
      throw { status: 404, message: "ユーザーが見つかりません。" };
    }

    await user.update(updateData);
    
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url
    };
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    const user = await User.findByPk(userId, { logging: false });
    
    if (!user) {
      throw { status: 404, message: "ユーザーが見つかりません。" };
    }

    await user.destroy();
    return { message: "ユーザーを削除しました。" };
  },

  /**
   * Get dashboard data for logged-in user
   */
  getDashboardData: async (userId) => {
    // 1. Số lượng quán yêu thích (chỉ đếm cafe ACTIVE)
    const favoriteCount = await Favorite.count({
      where: { user_id: userId },
      include: [{
        model: Cafe,
        as: 'cafe',
        where: { status: 'ACTIVE' },
        attributes: []
      }]
    });

    // 2. Số lượng review
    const reviewCount = await Review.count({
      where: { user_id: userId }
    });

    // 3. Số quán đã từng review
    const visitedCount = await Review.count({
      where: { user_id: userId },
      distinct: true,
      col: 'cafe_id'
    });

    // 4. Hoạt động gần đây
    const recentReviews = await Review.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: Cafe,
          as: 'cafe',
          attributes: ['name']
        }
      ]
    });

    const recentFavorites = await Favorite.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: Cafe,
          as: 'cafe',
          attributes: ['name']
        }
      ]
    });

    const recentActivities = [
      ...recentReviews.map(r => ({
        type: 'REVIEW',
        cafe: r.cafe?.name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
      })),
      ...recentFavorites.map(f => ({
        type: 'FAVORITE',
        cafe: f.cafe?.name,
        created_at: f.created_at
      }))
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // 5. Lấy danh sách cafe đã favorite
    const favoriteCafeIds = await Favorite.findAll({
      where: { user_id: userId },
      attributes: ['cafe_id']
    }).then(list => list.map(f => f.cafe_id));

    // 6. Gợi ý quán + lấy ảnh cover
    const recommendedCafes = await Cafe.findAll({
      where: {
        status: 'ACTIVE',
        id: { [Op.notIn]: favoriteCafeIds }
      },
      limit: 3,
      include: [
        {
          model: CafePhoto,
          as: 'photos',              // PHẢI TRÙNG alias trong association
          where: { is_cover: true },
          required: false,
          attributes: ['url']
        }
      ]
    });

    // 7. Map output đúng ảnh
    const mappedRecommended = recommendedCafes.map(cafe => ({
      id: cafe.id,
      name: cafe.name,
      address: cafe.address_line,
      coverPhoto: cafe.photos?.[0]?.url || null   // ✅ SỬA CHỖ NÀY
    }));

    return {
      favoriteCount,
      reviewCount,
      visitedCount,
      recentActivities,
      recommendedCafes: mappedRecommended
    };
  },

  /**
   * Get reviews của user đang đăng nhập
   */
  getUserReviews: async (userId, { page = 1, limit = 10 }) => {
    const actualPage = Math.max(1, Number(page) || 1);
    const actualLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (actualPage - 1) * actualLimit;

    const { count: total, rows } = await Review.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Cafe,
          as: 'cafe',
          attributes: ['id', 'name', 'address_line', 'status'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: actualLimit,
      offset,
    });

    const data = rows.map((r) => {
      const plain = r.get({ plain: true });
      return {
        id: plain.id,
        cafeId: plain.cafe_id,
        cafeName: plain.cafe?.name || null,
        cafeAddress: plain.cafe?.address_line || null,
        cafeStatus: plain.cafe?.status || null,
        rating: plain.rating,
        comment: plain.comment,
        imageUrl: plain.image_url,
        createdAt: plain.created_at,
        updatedAt: plain.updated_at,
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
   * Update review (chỉ owner được phép)
   */
  updateReview: async (reviewId, userId, updateData) => {
    const review = await Review.findByPk(reviewId);
    if (!review) throw { status: 404, message: "レビューが見つかりません。" };
    if (review.user_id !== userId) throw { status: 403, message: "権限がありません。" };

    // Validate input
    if (updateData.rating !== undefined && (isNaN(updateData.rating) || updateData.rating < 1 || updateData.rating > 5)) {
      throw { status: 400, message: "評価は1～5の間で入力してください。" };
    }
    if (updateData.comment !== undefined && typeof updateData.comment !== "string") {
      throw { status: 400, message: "コメントが不正です。" };
    }

    await review.update(updateData);
    return review;
  },

  /**
   * Delete review (chỉ owner được phép)
   */
  deleteReview: async (reviewId, userId) => {
    const review = await Review.findByPk(reviewId);
    if (!review) throw { status: 404, message: "レビューが見つかりません。" };
    if (review.user_id !== userId) throw { status: 403, message: "権限がありません。" };

    await review.destroy();
    return { message: "レビューを削除しました。" };
  }
};

module.exports = userService;