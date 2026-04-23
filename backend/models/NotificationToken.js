const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const NotificationToken = sequelize.define(
  "NotificationToken",
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
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    device_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: "notification_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = NotificationToken;
