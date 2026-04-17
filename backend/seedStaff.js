require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User } = require("./models");

const ACCOUNTS = [
  {
    role: "developer",
    name: "Developer",
    email: "dev@feast.com",
    phone: "0000000001",
    password: "dev@feast2024",
  },
  {
    role: "delivery",
    name: "Delivery Staff",
    email: "delivery@feast.com",
    phone: "0000000002",
    password: "delivery@feast2024",
  },
  {
    role: "admin",
    name: "Admin Manager",
    email: "admin@feast.com",
    phone: "0000000003",
    password: "admin@feast2024",
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    for (const acc of ACCOUNTS) {
      const existing = await User.findOne({ where: { email: acc.email } });

      if (existing) {
        console.log(`⚠️  [${acc.role.toUpperCase()}] already exists → ${acc.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(acc.password, 12);
        await User.create({
          name: acc.name,
          email: acc.email,
          password: hashedPassword,
          phone: acc.phone,
          role: acc.role,
        });
        console.log(`✅ [${acc.role.toUpperCase()}] created → ${acc.email}`);
      }
    }

    console.log("\n========================================");
    console.log("       FEAST AT NIGHT — STAFF CREDS     ");
    console.log("========================================");
    ACCOUNTS.forEach(acc => {
      console.log(`\n🔑 ${acc.role.toUpperCase()}`);
      console.log(`   Email:    ${acc.email}`);
      console.log(`   Password: ${acc.password}`);
    });
    console.log("\n========================================");
    console.log("⚠️  Change these passwords after first login!");
    console.log("========================================\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit();
  }
})();
