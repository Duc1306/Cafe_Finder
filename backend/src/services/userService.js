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
      status: user.status
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
    // Số lượng quán yêu thích
    const favoriteCount = await Favorite.count({ where: { user_id: userId } });

    // Số lượng review
    const reviewCount = await Review.count({ where: { user_id: userId } });

    // Số quán đã từng review (visitedCount)
    const visitedCount = await Review.count({
      where: { user_id: userId },
      distinct: true,
      col: 'cafe_id'
    });

    // Hoạt động gần đây (review + favorite)
    const recentReviews = await Review.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{ model: Cafe, as: 'cafe', attributes: ['name'] }]
    });

    const recentFavorites = await Favorite.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{ model: Cafe, as: 'cafe', attributes: ['name'] }]
    });

    const recentActivities = [
      ...recentReviews.map(r => ({
        type: 'REVIEW',
        cafe: r.Cafe?.name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
      })),
      ...recentFavorites.map(f => ({
        type: 'FAVORITE',
        cafe: f.Cafe?.name,
        created_at: f.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

    // Gợi ý quán (quán ACTIVE, chưa favorite)
    const favoriteCafeIds = await Favorite.findAll({
      where: { user_id: userId },
      attributes: ['cafe_id']
    }).then(list => list.map(f => f.cafe_id));

    const recommendedCafes = await Cafe.findAll({
      where: {
        status: 'ACTIVE',
        id: { [Op.notIn]: favoriteCafeIds }
      },
      limit: 3,
      include: [{
        model: CafePhoto,
        as: 'photos',
        where: { is_cover: true },
        required: false,
        attributes: ['url']
      }]
    });

    return {
      favoriteCount,
      reviewCount,
      visitedCount,
      recentActivities,
      recommendedCafes: recommendedCafes.map(cafe => ({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address_line,
        coverPhoto: cafe.CafePhotos?.[0]?.url || null
      }))
    };
  }
};

module.exports = userService;