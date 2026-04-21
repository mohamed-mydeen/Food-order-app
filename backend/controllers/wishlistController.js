const { Wishlist, Product } = require("../models");

// Toggle Wishlist Item
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, isWishlisted: false, message: "Removed from wishlist" });
    } else {
      await Wishlist.create({ user_id: userId, product_id: productId });
      return res.status(201).json({ success: true, isWishlisted: true, message: "Added to wishlist" });
    }
  } catch (error) {
    console.error("toggleWishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to update wishlist" });
  }
};

// Get User's Wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image", "category", "description"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

module.exports = { toggleWishlist, getWishlist };
