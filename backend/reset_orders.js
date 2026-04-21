const { sequelize, Order, OrderItem } = require('./models');

async function resetOrders() {
  try {
    console.log('Resetting orders table...');
    // Delete all order items first (foreign key constraint)
    await OrderItem.destroy({ where: {}, truncate: false });
    // Delete all orders
    await Order.destroy({ where: {}, truncate: false });
    
    // Reset auto-increment
    await sequelize.query('ALTER TABLE orders AUTO_INCREMENT = 1');
    await sequelize.query('ALTER TABLE order_items AUTO_INCREMENT = 1');
    
    console.log('Success: All orders cleared and counter reset to 1.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting orders:', error);
    process.exit(1);
  }
}

resetOrders();
