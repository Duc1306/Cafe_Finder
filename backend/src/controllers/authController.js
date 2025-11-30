const authService = require("../services/authService");

const authController = {

    // ------------------------
    // 🔐 SIGN UP (CUSTOMER hoặc OWNER)
    // ------------------------
    signup: async (req, res) => {
        try {
            const user = await authService.registerUser(req.body);
            
            return res.status(201).json({
                message: "ユーザー登録が完了しました。",
                user,
            });

        } catch (err) {
            console.error(err);
            const status = err.status || 500;
            const message = err.message || "サーバーエラーが発生しました。";
            res.status(status).json({ error: message });
        }
    },

    // ------------------------
    // 🔑 SIGN IN
    // ------------------------
    signin: async (req, res) => {
        try {
            const result = await authService.loginUser(req.body);
            
            return res.json({
                message: "ログインに成功しました。",
                token: result.token,
                user: result.user,
            });

        } catch (err) {
            console.error(err);
            const status = err.status || 500;
            const message = err.message || "サーバーエラーが発生しました。";
            res.status(status).json({ error: message });
        }
    },

    // ------------------------
    // 🚪 LOGOUT
    // ------------------------
    logout: (req, res) => {
        res.json({
            message: "ログアウトしました。（クライアント側でトークンを削除してください）",
        });
    },
};

module.exports = authController;
