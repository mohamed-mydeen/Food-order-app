const sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Offer = require("./Offer");
const BugReport = require("./BugReport");
const NotificationToken = require("./NotificationToken");
const Review = require("./Review");

// ─── Associations ─────────────────────────────────────────────────────────────

// User → Orders (one-to-many)
User.hasMany(Order, { foreignKey: "user_id", as: "orders", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User → NotificationTokens (one-to-many)
User.hasMany(NotificationToken, { foreignKey: "user_id", as: "notificationTokens", onDelete: "CASCADE" });
NotificationToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Order → OrderItems (one-to-many)
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Product → OrderItems (one-to-many)
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// User → Cart Items (one-to-many)
User.hasMany(Cart, { foreignKey: "user_id", as: "cartItems", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Product → Cart Items (one-to-many)
Product.hasMany(Cart, { foreignKey: "product_id", as: "cartEntries", onDelete: "CASCADE" });
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Reviews
User.hasMany(Review, { foreignKey: "user_id", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

Product.hasMany(Review, { foreignKey: "product_id", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Order.hasMany(Review, { foreignKey: "order_id", as: "reviews" });
Review.belongsTo(Order, { foreignKey: "order_id", as: "order" });

module.exports = { sequelize, User, Product, Cart, Order, OrderItem, Offer, BugReport, NotificationToken, Review };

