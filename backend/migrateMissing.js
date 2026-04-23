const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL;');
        console.log('✅ Added address column');
    } catch(e) {
        if (!e.message.includes('Duplicate column name')) {
             console.error('Failed to add address', e.message);
        } else {
             console.log('✅ Address column already exists');
        }
    }
    
    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN pincode VARCHAR(10) DEFAULT NULL;');
        console.log('✅ Added pincode column');
    } catch(e) {
        if (!e.message.includes('Duplicate column name')) {
             console.error('Failed to add pincode', e.message);
        } else {
             console.log('✅ Pincode column already exists');
        }
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
})();
