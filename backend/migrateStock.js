const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    console.log('Migrating products table... adding in_stock column');
    await sequelize.query('ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;');
    console.log('✅ Migration success: in_stock column added.');

  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('⚠️ Column in_stock already exists. Skipping.');
    } else {
      console.error('❌ Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
})();
