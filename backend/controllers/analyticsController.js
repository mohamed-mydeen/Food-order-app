const { User, Order, Product } = require("../models");

// ─── In-memory page-view counter (resets on server restart) ──────────────────
// For a persistent counter, store in DB. This is lightweight for now.
let pageViews = 0;

// Called by productController on every GET /api/products hit
const incrementViews = () => { pageViews++; };
const getViews = () => pageViews;

// ─── GET /api/analytics  (developer only) ────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      User.count({ where: { role: "user" } }),
      Order.count(),
      Product.count(),
    ]);

    // Revenue from all delivered orders
    const { sequelize } = require("../models");
    const [[revenueRow]] = await sequelize.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status = 'Delivered'"
    );

    // Orders today
    const [[todayRow]] = await sequelize.query(
      `SELECT COUNT(*) AS todayOrders FROM orders WHERE DATE(created_at) = CURDATE()`
    );

    return res.json({
      success: true,
      data: {
        pageViews,
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: parseFloat(revenueRow?.totalRevenue || 0),
        todayOrders: parseInt(todayRow?.todayOrders || 0),
      },
    });
  } catch (error) {
    console.error("getAnalytics:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
};

module.exports = { getAnalytics, incrementViews, getViews };
