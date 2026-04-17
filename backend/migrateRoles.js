require("dotenv").config();
const sequelize = require("./config/db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected");

    // Extend role ENUM to include delivery and developer
    await sequelize.query(
      "ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','delivery','developer') NOT NULL DEFAULT 'user'"
    );
    console.log("✅ role ENUM updated: user | admin | delivery | developer");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    process.exit();
  }
})();
