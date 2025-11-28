const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authService = {
  /**
   * Register a new user (always CUSTOMER role)
   */
  registerUser: async (userData) => {
    const { full_name, email, phone, password, confirmPassword } = userData;

    // Validate required fields
    if (!full_name || !email || !password) {
      throw { status: 400, message: "必要な項目が不足しています。" };
    }

    // Validate password match
    if (password !== confirmPassword) {
      throw { status: 400, message: "パスワードが一致しません。" };
    }

    // Validate phone format (optional)
    if (phone && !/^[0-9+\- ]{7,15}$/.test(phone)) {
      throw { status: 400, message: "電話番号の形式が正しくありません。" };
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ where: { email }, logging: false });
    if (existingUser) {
      throw { status: 400, message: "このメールアドレスは既に登録されています。" };
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user with CUSTOMER role
    const user = await User.create({
      full_name,
      email,
      phone: phone || null,
      password_hash,
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  },

  /**
   * Authenticate user and generate JWT token
   */
  loginUser: async (credentials) => {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({ where: { email }, logging: false });
    if (!user) {
      throw { status: 400, message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw { status: 400, message: "メールアドレスまたはパスワードが間違っています。" };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  },
};

module.exports = authService;
