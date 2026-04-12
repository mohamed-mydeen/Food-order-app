const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

// GET /api/products          (public)
router.get("/", getProducts);

// GET /api/products/:id      (public)
router.get("/:id", getProductById);

// POST /api/products         (admin only, multipart/form-data)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createProduct);

// PUT /api/products/:id      (admin only, optionally with new image)
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProduct);

// DELETE /api/products/:id   (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
