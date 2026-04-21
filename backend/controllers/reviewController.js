const { Review, User, Product, Order, OrderItem } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

// ─── GET /api/reviews/product/:productId ──────────────────────────────────────
// Public — get all reviews for a product with avg rating
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Review.findAndCountAll({
      where: { product_id: productId },
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    // Aggregate rating stats
    const stats = await Review.findOne({
      where: { product_id: productId },
      attributes: [
        [fn("AVG", col("rating")), "avg_rating"],
        [fn("COUNT", col("id")),   "total_reviews"],
      ],
      raw: true,
    });

    // Rating distribution (1–5 counts)
    const dist = await Review.findAll({
      where: { product_id: productId },
      attributes: ["rating", [fn("COUNT", col("id")), "count"]],
      group: ["rating"],
      raw: true,
    });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach(d => { distribution[d.rating] = parseInt(d.count); });

    return res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      stats: {
        avg_rating: stats?.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : null,
        total_reviews: parseInt(stats?.total_reviews || 0),
        distribution,
      },
    });
  } catch (error) {
    console.error("getProductReviews:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
};

// ─── POST /api/reviews ─────────────────────────────────────────────────────────
// Authenticated — submit or update a review (upsert per user+product)
const submitReview = async (req, res) => {
  try {
    const { product_id, rating, comment, order_id } = req.body;
    const userId = req.user.userId;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: "product_id and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    // Verify product exists
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Upsert: one review per user per product
    const [review, created] = await Review.findOrCreate({
      where: { user_id: userId, product_id },
      defaults: { rating, comment: comment || null, order_id: order_id || null },
    });

    if (!created) {
      // Update existing review
      review.rating  = rating;
      review.comment = comment || review.comment;
      if (order_id) review.order_id = order_id;
      await review.save();
    }

    const full = await Review.findByPk(review.id, {
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Review submitted!" : "Review updated!",
      data: full,
    });
  } catch (error) {
    console.error("submitReview:", error);
    return res.status(500).json({ success: false, message: "Failed to submit review." });
  }
};

// ─── DELETE /api/reviews/:id ───────────────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    // Only owner or admin can delete
    if (review.user_id !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await review.destroy();
    return res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    console.error("deleteReview:", error);
    return res.status(500).json({ success: false, message: "Failed to delete review." });
  }
};

// ─── GET /api/reviews/my ──────────────────────────────────────────────────────
// Get current user's reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: Product, as: "product", attributes: ["id", "name", "image", "category"] }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("getMyReviews:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
};

// ─── GET /api/reviews/check/:productId ────────────────────────────────────────
// Check if current user has already reviewed a product
const checkUserReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      where: { user_id: req.user.userId, product_id: req.params.productId },
    });
    return res.json({ success: true, reviewed: !!review, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to check review." });
  }
};

module.exports = { getProductReviews, submitReview, deleteReview, getMyReviews, checkUserReview };
