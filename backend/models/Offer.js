const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A single-row settings table – we always read/write row with id = 1
const Offer = sequelize.define("Offer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  title: {
    type: DataTypes.STRING(255),
    defaultValue: "Today's Special Offer",
  },
}, {
  tableName: "offers",
  timestamps: true,
});

module.exports = Offer;
