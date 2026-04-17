const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateAddress,
  updateProfile,
  changePassword,
  assignRole,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users               (admin + developer)
router.get("/", requireRole("admin", "developer"), getAllUsers);

// PUT /api/users/address       (logged-in user)
router.put("/address", updateAddress);

// PUT /api/users/profile       (logged-in user)
router.put("/profile", updateProfile);

// PUT /api/users/password      (logged-in user)
router.put("/password", changePassword);

// PUT /api/users/:id/role      (developer only)
router.put("/:id/role", requireRole("developer"), assignRole);

// GET /api/users/:id           (admin, developer, or own profile)
router.get("/:id", getUserById);

module.exports = router;

