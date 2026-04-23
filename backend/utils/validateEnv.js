/**
 * validateEnv.js
 * Called once on server startup to ensure all required environment
 * variables are present. Crashes early with a clear message rather
 * than failing silently at runtime.
 */

const REQUIRED = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
]

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('\n❌  STARTUP FAILED — Missing required environment variables:')
    missing.forEach((key) => console.error(`   • ${key}`))
    console.error('\nPlease set these in your .env file or Render environment settings.\n')
    process.exit(1)
  }

  // Security warnings
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET is weak (< 32 chars). Use a strong random secret in production.')
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️  Running in ${process.env.NODE_ENV || 'development'} mode.`)
  }

  console.log('✅ Environment variables validated.')
}

module.exports = validateEnv
