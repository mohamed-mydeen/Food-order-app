const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  submitReview,
  deleteReview,
  getMyReviews,
  checkUserReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole   = require("../middleware/roleMiddleware");

// Public
router.get("/product/:productId", getProductReviews);

// Protected
router.use(authMiddleware);
router.post("/",                        submitReview);
router.get("/my",                       getMyReviews);
router.get("/check/:productId",         checkUserReview);
router.delete("/:id",                   deleteReview);

module.exports = router;
