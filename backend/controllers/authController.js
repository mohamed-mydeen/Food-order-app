const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, neighborhood, role } = req.body;

    // ── 1. Field presence validation ────────────────────────────────
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required.',
      });
    }

    // ── 2. Field format validation ──────────────────────────────────
    if (name.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Name must be at least 3 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const phoneClean = phone.replace(/\s/g, '');
    if (!/^\d{10}$/.test(phoneClean)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // ── 3. Duplicate check — email AND phone ────────────────────────
    const existingEmail = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const existingPhone = await User.findOne({ where: { phone: phoneClean } });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'An account with this phone number already exists.' });
    }

    // ── 4. Create user ───────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phoneClean,
      address: address || null,
      neighborhood: neighborhood || null,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          neighborhood: user.neighborhood,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    // Handle DB-level unique constraint violations gracefully
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path || 'field';
      return res.status(409).json({ success: false, message: `An account with this ${field} already exists.` });
    }
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};


// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          neighborhood: user.neighborhood,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// ─── Get Current User (me) ───────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { register, login, getMe };
