const { Cart, Product } = require("../models");

// ─── GET /api/cart ─────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: Product, as: "product" }],
    });

    return res.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("getCart:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
};

// ─── POST /api/cart ────────────────────────────────────────────────────────────
// Add item or increment quantity if already in cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required." });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    let cartItem = await Cart.findOne({
      where: { user_id: req.user.userId, product_id },
    });

    if (cartItem) {
      cartItem.quantity += parseInt(quantity);
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user_id: req.user.userId,
        product_id,
        quantity: parseInt(quantity),
      });
    }

    const populated = await Cart.findByPk(cartItem.id, {
      include: [{ model: Product, as: "product" }],
    });

    return res.status(201).json({
      success: true,
      message: "Item added to cart.",
      data: populated,
    });
  } catch (error) {
    console.error("addToCart:", error);
    return res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
};

// ─── PUT /api/cart ─────────────────────────────────────────────────────────────
// Update quantity of a specific cart item
const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || quantity === undefined) {
      return res.status(400).json({ success: false, message: "product_id and quantity are required." });
    }

    const cartItem = await Cart.findOne({
      where: { user_id: req.user.userId, product_id },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    if (parseInt(quantity) <= 0) {
      await cartItem.destroy();
      return res.json({ success: true, message: "Item removed from cart." });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    return res.json({ success: true, message: "Cart updated.", data: cartItem });
  } catch (error) {
    console.error("updateCartItem:", error);
    return res.status(500).json({ success: false, message: "Failed to update cart." });
  }
};

// ─── DELETE /api/cart/:productId ──────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cartItem = await Cart.findOne({
      where: { user_id: req.user.userId, product_id: productId },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    await cartItem.destroy();
    return res.json({ success: true, message: "Item removed from cart." });
  } catch (error) {
    console.error("removeFromCart:", error);
    return res.status(500).json({ success: false, message: "Failed to remove item." });
  }
};

// ─── DELETE /api/cart (clear all) ─────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.destroy({ where: { user_id: req.user.userId } });
    return res.json({ success: true, message: "Cart cleared." });
  } catch (error) {
    console.error("clearCart:", error);
    return res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
