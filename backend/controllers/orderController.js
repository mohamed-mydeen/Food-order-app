const { Order, OrderItem, Cart, Product, User } = require("../models");
const { Op } = require("sequelize");

// ─── POST /api/orders ──────────────────────────────────────────────────────────
// Place order from cart
const placeOrder = async (req, res) => {
  try {
    const { address, payment_method = 'COD', payment_reference = null } = req.body;
    const userId = req.user.userId;

    if (!address) {
      return res.status(400).json({ success: false, message: "Delivery address is required." });
    }


    // Get cart items with product details
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Calculate total
    const total_amount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      user_id: userId,
      total_amount,
      address,
      status: "Pending",
      payment_method,
      payment_reference: payment_reference || null,
      payment_status: payment_method === 'UPI' ? 'Paid' : 'Pending',
    });

    // Create order items (snapshot price at time of order)
    const orderItemsData = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    await OrderItem.bulkCreate(orderItemsData);

    // Clear cart
    await Cart.destroy({ where: { user_id: userId } });

    // Return full order
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: fullOrder,
    });
  } catch (error) {
    console.error("placeOrder:", error);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// ─── GET /api/orders/user ──────────────────────────────────────────────────────
// Get logged-in user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("getUserOrders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// ─── GET /api/orders (admin) ───────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error("getAllOrders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// ─── GET /api/orders/:id ───────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    // Users can only view their own orders
    if (req.user.role !== "admin" && order.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("getOrderById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

// ─── PUT /api/orders/:id (admin) ──────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    await order.update({ status });
    return res.json({ success: true, message: "Order status updated.", data: order });
  } catch (error) {
    console.error("updateOrderStatus:", error);
    return res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

module.exports = { placeOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus };
