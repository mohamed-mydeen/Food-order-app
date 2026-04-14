const bcrypt = require("bcryptjs");
const { sequelize, User } = require("./models");

(async () => {
  try {
    await sequelize.authenticate();
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
      console.log("========================================");
      console.log("Admin user already exists in the database:");
      console.log(`Email:    ${existingAdmin.email}`);
      console.log(`Password: (It is hashed in DB)`);
      console.log("If you forgot it, run this script again after deleting the admin from the database to recreate it.");
      console.log("========================================");
    } else {
      console.log("No admin found. Creating default admin...");
      const hashedPassword = await bcrypt.hash("admin@123", 10);
      const newAdmin = await User.create({
        name: "Admin Manager",
        email: "admin@feast.com",
        password: hashedPassword,
        phone: "1234567890",
        role: "admin",
      });
      console.log("========================================");
      console.log("Admin created successfully!");
      console.log(`Email:    admin@feast.com`);
      console.log(`Password: admin@123`);
      console.log("========================================");
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    process.exit();
  }
})();
