const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {
    // ------------------------
    // 🔐 SIGN UP (always CUSTOMER)
    // ------------------------
    signup: async (req, res) => {
        try {
            const { full_name, email, phone, password, confirmPassword } = req.body;

            // Validate basic
            if (!full_name || !email || !password) {
                return res.status(400).json({ error: "必要な項目が不足しています。" });
            }

            // Confirm password
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "パスワードが一致しません。" });
            }

            // Phone (optional checks)
            if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) {
                return res.status(400).json({ error: "電話番号の形式が正しくありません。" });
            }

            // Check duplicate email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "このメールアドレスは既に登録されています。" });
            }

            const password_hash = await bcrypt.hash(password, 10);

            // Create user (role always CUSTOMER)
            const user = await User.create({
                full_name,
                email,
                phone: phone || null,
                password_hash,
                role: "CUSTOMER",
                status: "ACTIVE",
            });

            res.status(201).json({
                message: "ユーザー登録が完了しました。",
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
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
            if (!user) return res.status(400).json({ error: "メールアドレスまたはパスワードが間違っています。" });

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).json({ error: "メールアドレスまたはパスワードが間違っています。" });

            // Create token
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "ログインに成功しました。",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
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
        return res.json({
            message: "ログアウトしました。（クライアント側でトークンを削除してください）",
        });
    },
};

module.exports = authController;
