const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {

    // ------------------------
    // 🔐 SIGN UP (CUSTOMER hoặc OWNER)
    // ------------------------
    signup: async (req, res) => {
        try {
            const { full_name, email, phone, password, confirmPassword, role } = req.body;

            // Validate basic
            if (!full_name || !email || !password) {
                return res.status(400).json({ error: "必要な項目が不足しています。" });
            }

            // Confirm password
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "パスワードが一致しません。" });
            }

            // Validate role
            const allowedRoles = ["CUSTOMER", "OWNER"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ error: "無効なアカウント種類です。" });
            }

            // Phone optional validate
            if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) {
                return res.status(400).json({ error: "電話番号の形式が正しくありません。" });
            }

            // Check duplicate email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "このメールアドレスは既に登録されています。" });
            }

            const password_hash = await bcrypt.hash(password, 10);

            // 🎯 Status logic theo role
            const status = role === "CUSTOMER" ? "ACTIVE" : "PENDING";

            // Create user
            const user = await User.create({
                full_name,
                email,
                phone: phone || null,
                password_hash,
                role,
                status,   // <-- áp dụng status theo role
            });

            return res.status(201).json({
                message: "ユーザー登録が完了しました。",
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                },
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "サーバーエラーが発生しました。" });
        }
    },

    // ------------------------
    // 🔑 SIGN IN
    // ------------------------
    signin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email }, logging: false });
            if (!user) {
                return res.status(400).json({ error: "メールアドレスまたはパスワードが間違っています。" });
            }

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(400).json({ error: "メールアドレスまたはパスワードが間違っています。" });
            }

            // ❗ Nếu owner vẫn PENDING thì cấm login
            if (user.role === "OWNER" && user.status === "PENDING") {
                return res.status(403).json({
                    error: "店舗オーナーのアカウントは現在審査中です。"
                });
            }

            // Create JWT token
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.json({
                message: "ログインに成功しました。",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                },
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "サーバーエラーが発生しました。" });
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
