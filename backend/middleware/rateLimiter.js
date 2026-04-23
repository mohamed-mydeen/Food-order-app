const rateLimit = require('express-rate-limit')

// ── Auth limiter — prevents brute-force on login/register ───────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
})

// ── General API limiter — prevents abuse of public endpoints ────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 300,                   // 300 requests per window (generous for legitimate use)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
})

module.exports = { authLimiter, apiLimiter }
