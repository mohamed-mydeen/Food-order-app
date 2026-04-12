const { Order, OrderItem, Product, User } = require("../models");
const { Op, fn, col } = require("sequelize");

// ─── GET /api/dashboard ────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    // ── Stats ────────────────────────────────────────────────────────────
    const [todayOrdersCount, revenueResult, todayRevenue, totalUsers, totalProducts] =
      await Promise.all([
        Order.count({ where: { created_at: { [Op.between]: [today, tomorrow] } } }),
        Order.sum("total_amount", { where: { status: "Delivered" } }),
        Order.sum("total_amount", {
          where: { created_at: { [Op.between]: [today, tomorrow] }, status: { [Op.not]: "Cancelled" } },
        }),
        User.count({ where: { role: "user" } }),
        Product.count(),
      ]);

    // ── Orders by status ─────────────────────────────────────────────────
    const ordersByStatus = await Order.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // ── Recent 10 orders ─────────────────────────────────────────────────
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        { model: User,      as: "user",  attributes: ["id", "name", "email"] },
        { model: OrderItem, as: "items",
          include: [{ model: Product, as: "product", attributes: ["id", "name"] }],
        },
      ],
    });

    // ── Top products (optional — skip if DB mode causes issues) ──────────
    let topProducts = [];
    try {
      const rows = await OrderItem.findAll({
        attributes: ["product_id", [fn("SUM", col("quantity")), "totalSold"]],
        group: ["product_id"],
        order: [[fn("SUM", col("quantity")), "DESC"]],
        limit: 5,
        raw: true,
      });
      // Enrich with product name
      const ids = rows.map((r) => r.product_id);
      const prods = await Product.findAll({ where: { id: ids }, attributes: ["id", "name", "image", "category"] });
      topProducts = rows.map((r) => ({
        ...r,
        product: prods.find((p) => p.id === r.product_id) || null,
      }));
    } catch (tpErr) {
      console.warn("topProducts query skipped:", tpErr.message);
    }

    return res.json({
      success: true,
      data: {
        stats: {
          todayOrdersCount,
          todayRevenue:  parseFloat(todayRevenue)  || 0,
          totalRevenue:  parseFloat(revenueResult) || 0,
          totalUsers,
          totalProducts,
        },
        ordersByStatus,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    console.error("getDashboard:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboard };
