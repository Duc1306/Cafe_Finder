const userService = require('../services/userService');

const userController = {
  /**
   * GET /api/users
   * Get all users
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json({ success: true, data: user });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * POST /api/users
   * Create new user
   */
  createUser: async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * PUT /api/users/:id
   * Update user
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  }
};

userController.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await userService.getDashboardData(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'ユーザーダッシュボード取得エラー' });
  }
};

// Lấy profile của user đang đăng nhập
userController.getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "ユーザーが見つかりません。" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};

// プロフィールを更新
userController.updateProfile = async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;
    if (!full_name) return res.status(400).json({ error: "表示名は必須です。" });
    const updated = await userService.updateUser(req.user.id, { full_name, avatar_url });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
};

/**
 * GET /api/users/reviews
 * Lấy danh sách review của user đang đăng nhập
 */
userController.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const result = await userService.getUserReviews(userId, { page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: "レビュー一覧の取得に失敗しました。" });
  }
};

/**
 * PUT /api/users/reviews/:id
 * Update review (chỉ owner)
 */
userController.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { rating, comment, image_url } = req.body;
    const updated = await userService.updateReview(reviewId, userId, { rating, comment, image_url });
    res.json({ success: true, data: updated });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "レビューの更新に失敗しました。";
    res.status(status).json({ error: message });
  }
};

/**
 * DELETE /api/users/reviews/:id
 * Delete review (chỉ owner)
 */
userController.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const result = await userService.deleteReview(reviewId, userId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "レビューの削除に失敗しました。";
    res.status(status).json({ error: message });
  }
};

module.exports = userController;