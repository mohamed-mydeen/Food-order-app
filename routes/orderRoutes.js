const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders             (place order from cart)
router.post("/", placeOrder);

// GET /api/orders/user         (logged-in user's orders)
router.get("/user", getUserOrders);

// GET /api/orders              (admin: all orders with pagination)
router.get("/", adminMiddleware, getAllOrders);

// GET /api/orders/:id          (user or admin)
router.get("/:id", getOrderById);

// PUT /api/orders/:id          (admin: update status)
router.put("/:id", adminMiddleware, updateOrderStatus);

module.exports = router;
