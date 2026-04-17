const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// GET /api/dashboard  (admin + developer)
router.get("/", authMiddleware, requireRole("admin", "developer"), getDashboard);

module.exports = router;
