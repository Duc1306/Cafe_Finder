const { User } = require("../models");

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
  }
};

module.exports = userService;
