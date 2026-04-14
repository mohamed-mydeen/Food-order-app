const express = require("express");
const router = express.Router();
const {
  getActiveOffer,
  getAllOffers,
  createOffer,
  toggleOffer,
  deleteOffer,
} = require("../controllers/offerController");
const authMiddleware  = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload          = require("../middleware/upload");

// GET /api/offers/active      (public – frontend fetches this)
router.get("/active", getActiveOffer);

// GET /api/offers             (admin only)
router.get("/", authMiddleware, adminMiddleware, getAllOffers);

// POST /api/offers            (admin only – multipart image upload)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createOffer);

// PATCH /api/offers/:id/toggle (admin only)
router.patch("/:id/toggle", authMiddleware, adminMiddleware, toggleOffer);

// DELETE /api/offers/:id      (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer);

module.exports = router;
