const authService = require("../services/authService");

const authController = {
  /**
   * POST /api/auth/signup
   * Register a new user (always CUSTOMER role)
   */
  signup: async (req, res) => {
    try {
      const user = await authService.registerUser(req.body);
      
      res.status(201).json({
        message: "ユーザー登録が完了しました。",
        user
      });
    } catch (error) {
      console.error(error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * POST /api/auth/signin
   * Authenticate user and return JWT token
   */
  signin: async (req, res) => {
    try {
      const result = await authService.loginUser(req.body);
      
      res.json({
        message: "ログインに成功しました。",
        token: result.token,
        user: result.user
      });
    } catch (error) {
      console.error(error);
      const status = error.status || 500;
      const message = error.message || "サーバーエラーが発生しました。";
      res.status(status).json({ error: message });
    }
  },

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  logout: (req, res) => {
    return res.json({
      message: "ログアウトしました。（クライアント側でトークンを削除してください）",
    });
  },
};

module.exports = authController;
