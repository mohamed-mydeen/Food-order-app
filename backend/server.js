require("dotenv").config();

// ── Validate env vars before anything else ──────────────────────────────────
const validateEnv = require("./utils/validateEnv");
validateEnv();

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const { sequelize } = require("./models");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

// Route imports
const authRoutes         = require("./routes/authRoutes");
const productRoutes      = require("./routes/productRoutes");
const cartRoutes         = require("./routes/cartRoutes");
const orderRoutes        = require("./routes/orderRoutes");
const userRoutes         = require("./routes/userRoutes");
const dashboardRoutes    = require("./routes/dashboardRoutes");
const offerRoutes        = require("./routes/offerRoutes");
const analyticsRoutes    = require("./routes/analyticsRoutes");
const bugRoutes          = require("./routes/bugRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes       = require("./routes/reviewRoutes");
const wishlistRoutes     = require("./routes/wishlistRoutes");
const { incrementViews } = require("./controllers/analyticsController");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Allowed Origins ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://mpmhub.vercel.app",          // Production frontend
  "https://mpmhub-admin.vercel.app",    // Admin panel (if separate)
  /^http:\/\/localhost:\d+$/,            // Any localhost port (dev)
  /^http:\/\/127\.0\.0\.1:\d+$/,        // Any 127.0.0.1 port (dev)
];

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP managed by Vercel/frontend separately
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      // Temporarily allow all origins (including Admin panel) until custom domain is set up
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsers (with size limits) ─────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── General API Rate Limiter ────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
// Auth routes get stricter rate limiting
app.use("/api/auth", authLimiter, authRoutes);

// Track page views on every product fetch (public endpoint visited by frontend)
app.use("/api/products", (req, res, next) => { if (req.method === "GET") incrementViews(); next(); });
app.use("/api/products",      productRoutes);
app.use("/api/cart",          cartRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/offers",        offerRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/bugs",          bugRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/wishlist",      wishlistRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🍽️  Feast At Night API is running",
    version: "1.2.0",
    env: process.env.NODE_ENV || "development",
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS error — give a clear message
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // NEVER use alter:true in production — it breaks on TiDB/MySQL UNIQUE KEY cols.
    const shouldAlter = process.env.NODE_ENV !== "production" && process.env.DEV_SYNC === "true";
    try {
      await sequelize.sync({ alter: shouldAlter });
      console.log("✅ Database synced");
    } catch (syncErr) {
      console.warn("⚠️  alter sync failed, retrying with force:false...", syncErr.message);
      await sequelize.sync({ force: false });
      console.log("✅ Database synced (no-alter fallback)");
    }

    // --- Schema Patch for FCM Tokens ---
    try {
      await sequelize.query('ALTER TABLE notification_tokens DROP INDEX token').catch(()=>null);
      await sequelize.query('ALTER TABLE notification_tokens DROP INDEX token_unique').catch(()=>null);
      await sequelize.query('ALTER TABLE notification_tokens DROP INDEX notification_tokens_token_unique').catch(()=>null);
      await sequelize.query('ALTER TABLE notification_tokens MODIFY token TEXT').catch(()=>null);
      await sequelize.query('ALTER TABLE notification_tokens MODIFY device_info TEXT').catch(()=>null);
      console.log("✅ Applied NotificationToken schema patch");
    } catch (e) {
      console.log("⚠️ NotificationToken schema patch error:", e.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
})();



