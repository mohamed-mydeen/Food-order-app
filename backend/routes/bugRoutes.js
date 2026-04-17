const express = require("express");
const router = express.Router();
const { reportBug, getBugs, clearBugs } = require("../controllers/bugController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// POST /api/bugs  (public — no auth, so errors from logged-out users are captured)
router.post("/", reportBug);

// GET /api/bugs   (developer only)
router.get("/", authMiddleware, requireRole("developer"), getBugs);

// DELETE /api/bugs  (developer only)
router.delete("/", authMiddleware, requireRole("developer"), clearBugs);

module.exports = router;
