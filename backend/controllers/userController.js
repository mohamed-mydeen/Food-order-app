const { User } = require("../models");
const bcrypt = require("bcryptjs");

// ─── GET /api/users (admin) ───────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("getAllUsers:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

// ─── GET /api/users/:id ────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const requestedId = parseInt(req.params.id);

    // Users can only view their own profile unless admin
    if (req.user.role !== "admin" && req.user.userId !== requestedId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const user = await User.findByPk(requestedId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("getUserById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
};

// ─── PUT /api/users/address ───────────────────────────────────────────────────
const updateAddress = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required." });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    await user.update({ address });
    return res.json({ success: true, message: "Address updated.", data: { address: user.address } });
  } catch (error) {
    console.error("updateAddress:", error);
    return res.status(500).json({ success: false, message: "Failed to update address." });
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    await user.update({ name: name || user.name, phone: phone || user.phone, address: address || user.address });

    return res.json({
      success: true,
      message: "Profile updated.",
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address },
    });
  } catch (error) {
    console.error("updateProfile:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// ─── PUT /api/users/password ──────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required." });
    }

    const user = await User.findByPk(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashed });

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("changePassword:", error);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

module.exports = { getAllUsers, getUserById, updateAddress, updateProfile, changePassword };
