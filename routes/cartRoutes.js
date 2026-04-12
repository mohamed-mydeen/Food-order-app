const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart
router.get("/", getCart);

// POST /api/cart
router.post("/", addToCart);

// PUT /api/cart
router.put("/", updateCartItem);

// DELETE /api/cart (clear all)
router.delete("/", clearCart);

// DELETE /api/cart/:productId
router.delete("/:productId", removeFromCart);

module.exports = router;
