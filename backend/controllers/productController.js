const { Product } = require("../models");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ─── Helper: stream buffer to Cloudinary ─────────────────────────────────────
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "feast_at_night/products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ─── GET /api/products ────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const products = await Product.findAll({ where, order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: products });
  } catch (error) {
    console.error("getProducts:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, data: product });
  } catch (error) {
    console.error("getProductById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

// ─── POST /api/products (admin) ───────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "Name, price, and category are required." });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const product = await Product.create({ name, price, category, description, image: imageUrl });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("createProduct:", error);
    return res.status(500).json({ success: false, message: "Failed to create product." });
  }
};

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const { name, price, category, description } = req.body;
    let imageUrl = product.image;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    await product.update({ name, price, category, description, image: imageUrl });

    return res.json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("updateProduct:", error);
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    await product.destroy();
    return res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("deleteProduct:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
