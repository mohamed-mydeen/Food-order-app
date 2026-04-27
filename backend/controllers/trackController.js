const { UserEvent, Product } = require("../models");
const { getClusterInsights } = require("../utils/recommendationEngine");

/**
 * POST /api/track
 * Logs a user behaviour event (view, click, cart_add, wishlist).
 * Silently upserts: if the same (user, product, event_type) exists today,
 * we just increment the value rather than inserting duplicates for views/clicks.
 */
const trackEvent = async (req, res) => {
  try {
    const { product_id, event_type, value = 1 } = req.body;
    const userId = req.user.userId;

    const allowedTypes = ["view", "click", "cart_add", "wishlist"];
    if (!allowedTypes.includes(event_type)) {
      return res.status(400).json({ success: false, message: "Invalid event_type." });
    }

    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required." });
    }

    // For views and clicks, deduplicate per day to avoid spam
    if (event_type === "view" || event_type === "click") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existing = await UserEvent.findOne({
        where: { user_id: userId, product_id, event_type, created_at: { [require("sequelize").Op.gte]: todayStart } },
      });

      if (existing) {
        // Increment value rather than creating duplicate
        await existing.update({ value: existing.value + (event_type === "view" ? 0.1 : 0.3) });
        return res.json({ success: true, message: "Event updated." });
      }
    }

    await UserEvent.create({ user_id: userId, product_id, event_type, value });
    return res.json({ success: true, message: "Event tracked." });
  } catch (error) {
    console.error("trackEvent:", error);
    return res.status(500).json({ success: false, message: "Failed to track event." });
  }
};

/**
 * GET /api/recommendations/insights
 * Returns K-Means cluster statistics for the admin/dev panel.
 */
const getInsights = async (req, res) => {
  try {
    const insights = await getClusterInsights();
    if (!insights) {
      return res.status(500).json({ success: false, message: "Could not compute insights." });
    }

    // Enrich top_product_ids with product names
    const allProductIds = insights.clusters.flatMap(c => c.top_product_ids);
    const products = allProductIds.length > 0
      ? await Product.findAll({
          where: { id: allProductIds },
          attributes: ["id", "name", "category", "price"],
          raw: true,
        })
      : [];
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const enrichedClusters = insights.clusters.map(c => ({
      ...c,
      top_products: c.top_product_ids.map(pid => productMap[pid] || { id: pid, name: "Unknown" }),
    }));

    return res.json({
      success: true,
      data: { ...insights, clusters: enrichedClusters },
    });
  } catch (error) {
    console.error("getInsights:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch insights." });
  }
};

module.exports = { trackEvent, getInsights };
