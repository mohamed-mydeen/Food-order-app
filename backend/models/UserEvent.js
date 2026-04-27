const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * UserEvent — captures all implicit & explicit user behaviour signals
 * Used by the AI recommendation engine to build user-taste vectors.
 *
 * event_type weights (in recommendationEngine.js):
 *   order    → 5.0
 *   review   → rating × 0.8  (value field = 1‑5)
 *   wishlist → 2.0
 *   cart_add → 1.5
 *   click    → 0.3
 *   view     → 0.1
 */
const UserEvent = sequelize.define(
  "UserEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    event_type: {
      type: DataTypes.ENUM("view", "click", "cart_add", "wishlist", "order", "review"),
      allowNull: false,
    },
    // For reviews: the star rating (1-5). For orders: quantity. Others: 1.
    value: {
      type: DataTypes.FLOAT,
      defaultValue: 1,
    },
  },
  {
    tableName: "user_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      // Fast lookup by user
      { fields: ["user_id"] },
      // Fast lookup by product
      { fields: ["product_id"] },
      // Composite for dedup-style queries
      { fields: ["user_id", "product_id", "event_type"] },
    ],
  }
);

module.exports = UserEvent;
