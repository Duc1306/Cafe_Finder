const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {
    // ------------------------
    // 🔐 SIGN UP (always CUSTOMER)
    // ------------------------
    signup: async (req, res) => {
        try {
            const { full_name, email,phone , password, confirmPassword} = req.body;

            // Validate basic
            if (!full_name || !email || !password) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // Confirm password
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match" });
            }

            // Phone (optional checks)
            if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) {
                return res.status(400).json({ error: "Invalid phone format" });
            }

            // Check duplicate email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already exists" });
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
                message: "User registered successfully",
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
            res.status(500).json({ error: "Server error" });
        }
    },

    // ------------------------
    // 🔑 SIGN IN
    // ------------------------
    signin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email }, logging: false });
            if (!user) return res.status(400).json({ error: "Invalid credentials" });

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).json({ error: "Invalid credentials" });

            // Create token
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "Login successful",
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
            res.status(500).json({ error: "Server error" });
        }
    },

    // ------------------------
    // 🚪 LOGOUT
    // ------------------------
    logout: (req, res) => {
        return res.json({
            message: "Logged out successfully (client must delete token)",
        });
    },
};

module.exports = authController;
