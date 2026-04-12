const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
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
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"),
      defaultValue: "Pending",
    },
    payment_method: {
      type: DataTypes.ENUM("COD", "UPI"),
      defaultValue: "COD",
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM("Pending", "Paid", "Failed"),
      defaultValue: "Pending",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;
