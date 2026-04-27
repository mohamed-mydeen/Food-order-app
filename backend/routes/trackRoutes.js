const express = require("express");
const router = express.Router();
const { trackEvent, getInsights } = require("../controllers/trackController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// POST /api/track  — log a behaviour event (all authenticated users)
router.post("/", authMiddleware, trackEvent);

// GET /api/recommendations/insights  — cluster stats (dev/admin only)
router.get("/insights", authMiddleware, requireRole("admin", "developer"), getInsights);

module.exports = router;
