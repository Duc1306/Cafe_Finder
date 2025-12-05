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
module.exports = userController;
