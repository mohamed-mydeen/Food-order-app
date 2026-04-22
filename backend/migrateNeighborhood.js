const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    console.log('Migrating users table... adding neighborhood column');
    await sequelize.query('ALTER TABLE users ADD COLUMN neighborhood VARCHAR(100) DEFAULT NULL;');
    console.log('✅ Migration success: neighborhood column added.');

  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('⚠️ Column neighborhood already exists. Skipping.');
    } else {
      console.error('❌ Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
})();
