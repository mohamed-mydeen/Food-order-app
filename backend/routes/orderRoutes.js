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
const requireRole = require("../middleware/roleMiddleware");

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders             (place order from cart — regular users)
router.post("/", placeOrder);

// GET /api/orders/user         (logged-in user's own orders)
router.get("/user", getUserOrders);

// GET /api/orders              (admin + developer + delivery: all orders)
router.get("/", requireRole("admin", "developer", "delivery"), getAllOrders);

// GET /api/orders/:id          (user or staff)
router.get("/:id", getOrderById);

// PUT /api/orders/:id          (admin + developer + delivery: update status)
router.put("/:id", requireRole("admin", "developer", "delivery"), updateOrderStatus);

module.exports = router;
