const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateAddress,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users               (admin only)
router.get("/", adminMiddleware, getAllUsers);

// PUT /api/users/address       (logged-in user)
router.put("/address", updateAddress);

// PUT /api/users/profile       (logged-in user)
router.put("/profile", updateProfile);

// PUT /api/users/password      (logged-in user)
router.put("/password", changePassword);

// GET /api/users/:id           (admin or own profile)
router.get("/:id", getUserById);

module.exports = router;
