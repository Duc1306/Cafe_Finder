const adminUserService = require('../services/adminUserService');

//GET get all USER+OWNER
const getAllAccounts = async (req, res) => {
  try {
    const filters = {
      keyword: req.query.keyword || "",
      role: req.query.role || "",
      status: req.query.status || ""
    };

    const accounts = await adminUserService.getAllAccounts(filters);

    return res.status(200).json({ success: true, data: accounts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update user
const updateAccount = async (req, res) => {
  try {
    const user = await adminUserService.updateAccount(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE user
const deleteAccount = async (req, res) => {
  try {
    await adminUserService.deleteAccount(req.params.id);
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT toggle status ACTIVE <-> LOCKED
const toggleStatus = async (req, res) => {
  try {
    const user = await adminUserService.toggleStatus(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT approve pending owner
const approveOwner = async (req, res) => {
  try {
    const owner = await adminUserService.approveOwner(req.params.id);
    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllAccounts,
  updateAccount,
  deleteAccount,
  toggleStatus,
  approveOwner
};



