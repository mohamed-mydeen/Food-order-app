const { Order, OrderItem, Cart, Product, User, NotificationToken } = require("../models");
const { sendToUser } = require("../utils/notificationHelper");
const { Op, fn, col, literal } = require("sequelize");

// ─── POST /api/orders ──────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { address, payment_method = 'COD', payment_reference = null } = req.body;
    const userId = req.user.userId;

    if (!address) {
      return res.status(400).json({ success: false, message: "Delivery address is required." });
    }

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const DELIVERY_FEE = (address || '').toLowerCase().includes('melapalayam') ? 20 : 50;
    const total_amount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0
    ) + DELIVERY_FEE;

    const order = await Order.create({
      user_id: userId,
      total_amount,
      address,
      status: "Pending",
      payment_method,
      payment_reference: payment_reference || null,
      payment_status: "Pending",
    });

    const orderItemsData = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));
    await OrderItem.bulkCreate(orderItemsData);
    await Cart.destroy({ where: { user_id: userId } });

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
    });

    // ── Order Confirmed Notification ──
    const itemNames = cartItems.slice(0, 2).map(i => i.product.name).join(', ');
    await sendToUser(userId, {
      title: `Order Confirmed! 🎉`,
      body: `Your order for ${itemNames}${cartItems.length > 2 ? ' and more' : ''} has been received and is being processed.`,
      data: { order_id: String(order.id), type: 'order_placed' }
    });

    return res.status(201).json({ success: true, message: "Order placed successfully.", data: fullOrder });
  } catch (error) {
    console.error("placeOrder:", error);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// ─── GET /api/orders/user ──────────────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("getUserOrders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// ─── GET /api/orders/recommendations ──────────────────────────────────────────
// Returns product recommendations based on this user's order history AND global buying behavior
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Step 1: Get product IDs this user has ordered, sorted by frequency
    const userOrderedItems = await OrderItem.findAll({
      include: [{
        model: Order,
        as: "order",
        where: { user_id: userId },
        attributes: [],
      }],
      attributes: ['product_id', [fn('SUM', col('OrderItem.quantity')), 'total_ordered']],
      group: ['product_id'],
      order: [[literal('total_ordered'), 'DESC']],
      limit: 10,
    });

    const orderedProductIds = userOrderedItems.map(i => i.product_id);

    // Step 2: Global Popular Items (Other customers' buying behavior)
    const popularItems = await OrderItem.findAll({
      attributes: ['product_id', [fn('SUM', col('quantity')), 'global_ordered']],
      group: ['product_id'],
      order: [[literal('global_ordered'), 'DESC']],
      limit: 10,
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image', 'category', 'description'] }],
    });

    if (orderedProductIds.length === 0) {
      // New user — return purely popular products
      return res.json({
        success: true,
        type: 'popular',
        message: 'Trending items at Feast At Night 🔥',
        data: popularItems.slice(0, 6).map(i => {
          const p = i.product ? i.product.toJSON() : {};
          return { ...p, tag: 'Popular', order_count: i.get('global_ordered') };
        }).filter(i => i.id), // Ensure product exists
      });
    }

    // Step 3: Find categories the user orders most
    const userOrderItemsForCats = await OrderItem.findAll({
      include: [
        { model: Order, as: 'order', where: { user_id: userId }, attributes: [] },
        { model: Product, as: 'product', attributes: ['category'] },
      ],
      attributes: ['product_id'],
    });
    
    const categoryCounts = {};
    userOrderItemsForCats.forEach(item => {
      const cat = item.product?.category;
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

    // Step 4: Category-based recommendations (Specific customer behavior)
    const categoryRecommended = await Product.findAll({
      where: {
        ...(topCategories.length > 0 ? { category: { [Op.in]: topCategories } } : {}),
        id: { [Op.notIn]: orderedProductIds.slice(0, 3) }, // exclude user's top 3 to show new things
      },
      limit: 3,
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'price', 'image', 'category', 'description'],
    });

    const resultsMap = new Map();

    // 1. Add "Your Favourite" (Specific to customer)
    const topProduct = await Product.findByPk(orderedProductIds[0], {
      attributes: ['id', 'name', 'price', 'image', 'category', 'description'],
    });
    if (topProduct) {
      resultsMap.set(topProduct.id, { ...topProduct.toJSON(), tag: 'Your Favourite' });
    }

    // 2. Add category-based recommendations (Specific to customer)
    categoryRecommended.forEach(p => {
      if (!resultsMap.has(p.id)) {
        resultsMap.set(p.id, { ...p.toJSON(), tag: 'Recommended for You' });
      }
    });

    // 3. Add Collaborative/Global Popular items (Other customers' behavior)
    const popularToRecommend = popularItems
      .filter(i => i.product && !resultsMap.has(i.product_id))
      .slice(0, 3); // take top 3 popular items
      
    popularToRecommend.forEach(i => {
      resultsMap.set(i.product_id, { ...i.product.toJSON(), tag: 'Popular Right Now' });
    });

    // Convert map to array and limit to 6 items total
    const finalResults = Array.from(resultsMap.values()).slice(0, 6);

    return res.json({
      success: true,
      type: 'hybrid',
      message: "Curated for you based on your taste & global trends.",
      data: finalResults,
    });
  } catch (error) {
    console.error("getRecommendations:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch recommendations." });
  }
};

// ─── GET /api/orders (admin + developer + delivery) ───────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      where = statuses.length === 1 ? { status: statuses[0] } : { status: { [Op.in]: statuses } };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone", "address"] },
        { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
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
        { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      ],
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
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

    const updateData = { status };
    if (order.payment_method === 'UPI' && status !== 'Pending' && status !== 'Cancelled') {
      updateData.payment_status = 'Paid';
    }
    await order.update(updateData);

    // ── Status Update Notification with proper priority ──
    const statusMessages = {
      'Preparing':        { title: `Order is Preparing 👨‍🍳`,  body: `Your food is currently being prepared fresh in the kitchen. We'll notify you when it's out for delivery.` },
      'Out for Delivery': { title: `Order is on the way! 🚚`,   body: `Good news! Your order is out for delivery. Our partner will reach your location shortly.` },
      'Delivered':        { title: `Order Delivered! 🎉`,      body: `Your order has been successfully delivered. We hope you enjoy your Feast At Night!` },
      'Cancelled':        { title: `Order Cancelled ❌`,       body: `Unfortunately, your order was cancelled. If you need assistance, please contact our support team.` },
    };
    const msg = statusMessages[status];
    if (msg) {
      await sendToUser(order.user_id, { ...msg, data: { order_id: String(order.id), type: 'status_update', status } });
    }

    return res.json({ success: true, message: "Order status updated.", data: order });
  } catch (error) {
    console.error("updateOrderStatus:", error);
    return res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

module.exports = { placeOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, getRecommendations };
