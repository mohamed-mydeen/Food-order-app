const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET /api/dashboard  (admin only)
router.get("/", authMiddleware, adminMiddleware, getDashboard);

module.exports = router;
