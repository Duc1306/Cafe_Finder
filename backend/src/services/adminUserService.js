const { User, OwnerProfile } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy danh sách user + owner
 */
const getAllAccounts = async (filters = {}) => {
  const { keyword = "", role = "", status = "" } = filters;

  let whereClause = {};

  if (keyword) {
    whereClause[Op.or] = [
      { full_name: { [Op.like]: `%${keyword}%` } },
      { email: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (role) whereClause.role = role;
  if (status) whereClause.status = status;

  const accounts = await User.findAll({
    where: whereClause,
    attributes: ["id", "full_name", "email", "phone", "role", "status", "created_at"],
    include: [
      {
        model: OwnerProfile,
        as: "ownerProfile",
        required: false,
        attributes: ["business_name", "approval_status"]
      }
    ],
    order: [["created_at", "DESC"]]
  });

  return accounts;
};

/**
 * Chỉnh sửa thông tin tài khoản
 */
const updateAccount = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  const allowed = ["full_name", "email", "phone"];
  allowed.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });

  await user.save();
  return user;
};

/**
 * Xóa tài khoản
 */
const deleteAccount = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");

  await user.destroy();
  return { success: true };
};

/**
 * Đổi trạng thái ACTIVE <-> LOCKED
 */
const toggleStatus = async (id) => {
  const user = await User.findByPk(id);

  if (!user) throw new Error("User not found");

  // 🚫 Owner chưa được duyệt thì không cho khóa/mở
  if (
    user.role === "OWNER" &&
    user&&
    user.status === "PENDING"
  ) {
    throw new Error("Owner must be approved before changing status");
  }

  else user.status = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
  await user.save();

  return user;
};


/**
 * Duyệt tài khoản owner PENDING → ACTIVE
 */
const approveOwner = async (id) => {
  const owner = await User.findOne({
    where: { id, role: "OWNER" }
  });

  if (!owner) throw new Error("Owner not found");

  if (!owner || owner.status !== "PENDING") {
    console.log(owner.status);
    throw new Error("Owner is not pending approval");
  }

  // ✅ sau khi duyệt → ACTIVE
  owner.status = "ACTIVE";
  await owner.save();

  return owner;
};



module.exports = {
    getAllAccounts,
    updateAccount,
    deleteAccount,
    toggleStatus,
    approveOwner
}