const { Offer } = require("../models");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ─── Helper: stream buffer → Cloudinary ──────────────────────────────────────
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "feast_at_night/offers", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

// ─── GET /api/offers/active  (public – used by frontend) ─────────────────────
const getActiveOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({ where: { is_active: true }, order: [["updatedAt", "DESC"]] });
    return res.json({ success: true, data: offer || null });
  } catch (err) {
    console.error("getActiveOffer:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch offer." });
  }
};

// ─── GET /api/offers  (admin – list all) ─────────────────────────────────────
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({ order: [["updatedAt", "DESC"]] });
    return res.json({ success: true, data: offers });
  } catch (err) {
    console.error("getAllOffers:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch offers." });
  }
};

// ─── POST /api/offers  (admin – upload new poster) ───────────────────────────
const createOffer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image file is required." });

    const { title } = req.body;
    const result = await uploadToCloudinary(req.file.buffer);

    // Deactivate all others first so only one is active at a time
    await Offer.update({ is_active: false }, { where: {} });

    const offer = await Offer.create({
      image_url: result.secure_url,
      title: title || "Today's Special Offer",
      is_active: true,
    });

    return res.status(201).json({ success: true, message: "Offer uploaded.", data: offer });
  } catch (err) {
    console.error("createOffer:", err);
    return res.status(500).json({ success: false, message: "Failed to upload offer." });
  }
};

// ─── PATCH /api/offers/:id/toggle  (admin – activate / deactivate) ───────────
const toggleOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found." });

    if (!offer.is_active) {
      // Activating this one → deactivate all others
      await Offer.update({ is_active: false }, { where: {} });
    }
    await offer.update({ is_active: !offer.is_active });

    return res.json({ success: true, message: `Offer ${offer.is_active ? "activated" : "deactivated"}.`, data: offer });
  } catch (err) {
    console.error("toggleOffer:", err);
    return res.status(500).json({ success: false, message: "Failed to toggle offer." });
  }
};

// ─── DELETE /api/offers/:id  (admin) ─────────────────────────────────────────
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found." });
    await offer.destroy();
    return res.json({ success: true, message: "Offer deleted." });
  } catch (err) {
    console.error("deleteOffer:", err);
    return res.status(500).json({ success: false, message: "Failed to delete offer." });
  }
};

module.exports = { getActiveOffer, getAllOffers, createOffer, toggleOffer, deleteOffer };
