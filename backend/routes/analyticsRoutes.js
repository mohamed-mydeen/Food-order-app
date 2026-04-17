const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// GET /api/analytics  (developer only)
router.get("/", authMiddleware, requireRole("developer"), getAnalytics);

module.exports = router;
