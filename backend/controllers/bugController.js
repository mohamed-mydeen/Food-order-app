const { BugReport } = require("../models");

// ─── POST /api/bugs  (public — captures frontend errors) ─────────────────────
const reportBug = async (req, res) => {
  try {
    const { message, page, stack, userAgent, userId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "message is required." });
    }

    await BugReport.create({
      message: String(message).substring(0, 2000),
      page: page ? String(page).substring(0, 255) : null,
      stack: stack ? String(stack).substring(0, 5000) : null,
      userAgent: userAgent ? String(userAgent).substring(0, 500) : null,
      userId: userId || null,
    });

    return res.status(201).json({ success: true, message: "Bug report received." });
  } catch (error) {
    console.error("reportBug:", error);
    return res.status(500).json({ success: false, message: "Failed to save bug report." });
  }
};

// ─── GET /api/bugs  (developer only) ─────────────────────────────────────────
const getBugs = async (req, res) => {
  try {
    const bugs = await BugReport.findAll({
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    return res.json({ success: true, data: bugs });
  } catch (error) {
    console.error("getBugs:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch bug reports." });
  }
};

// ─── DELETE /api/bugs  (developer only) ──────────────────────────────────────
const clearBugs = async (req, res) => {
  try {
    await BugReport.destroy({ where: {} , truncate: true });
    return res.json({ success: true, message: "All bug reports cleared." });
  } catch (error) {
    console.error("clearBugs:", error);
    return res.status(500).json({ success: false, message: "Failed to clear bug reports." });
  }
};

module.exports = { reportBug, getBugs, clearBugs };
