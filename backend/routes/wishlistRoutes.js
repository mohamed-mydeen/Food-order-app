const express = require("express");
const router = express.Router();
const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.post("/toggle", toggleWishlist);
router.get("/", getWishlist);

module.exports = router;
