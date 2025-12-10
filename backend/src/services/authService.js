const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authService = {
  /**
   * Register a new user (CUSTOMER or OWNER)
   */
  registerUser: async (userData) => {
    const { full_name, email, phone, password, confirmPassword, role } = userData;

    // Validate required fields
    if (!full_name || !email || !password) {
      throw { status: 400, message: "必要な項目が不足しています。" };
    }

    // Validate password match
    if (password !== confirmPassword) {
      throw { status: 400, message: "パスワードが一致しません。" };
    }

    // Validate role
    const allowedRoles = ["CUSTOMER", "OWNER"];
    if (!allowedRoles.includes(role)) {
      throw { status: 400, message: "無効なアカウント種類です。" };
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

    // Status logic based on role
    const status = role === "CUSTOMER" ? "ACTIVE" : "PENDING";

    // Create user
    const user = await User.create({
      full_name,
      email,
      phone: phone || null,
      password_hash,
      role,
      status,
    });

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
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

    // Check if owner account is still pending
    if (user.role === "OWNER" && user.status === "PENDING") {
      throw { status: 403, message: "店舗オーナーのアカウントは現在審査中です。" };
    }

    //Check if account is still locked
    if(user.status === 'LOCKED'){
      throw {status: 403, message: "店舗オーナーのアカウントは使用禁止です。"}
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
        status: user.status,
      },
    };
  },
};

module.exports = authService;
