const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BugReport = sequelize.define(
  "BugReport",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    page: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for unauthenticated users
    },
  },
  {
    tableName: "bug_reports",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

module.exports = BugReport;
