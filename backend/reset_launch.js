const { Op } = require('sequelize');
const { sequelize, User, Cart, Order, OrderItem, NotificationToken, Review, Wishlist, BugReport } = require('./models');

async function resetForLaunch() {
  try {
    console.log('🚀 Starting Database Reset for Production Launch...');

    // 1. Delete all order-related data
    console.log('Clearing Order Items...');
    await OrderItem.destroy({ where: {}, truncate: false });
    
    console.log('Clearing Orders...');
    await Order.destroy({ where: {}, truncate: false });

    // 2. Delete cart and wishlist items
    console.log('Clearing Carts...');
    await Cart.destroy({ where: {}, truncate: false });
    
    console.log('Clearing Wishlists...');
    await Wishlist.destroy({ where: {}, truncate: false });

    // 3. Delete user interactions
    console.log('Clearing Reviews...');
    await Review.destroy({ where: {}, truncate: false });
    
    console.log('Clearing Notification Tokens...');
    await NotificationToken.destroy({ where: {}, truncate: false });

    console.log('Clearing Bug Reports...');
    await BugReport.destroy({ where: {}, truncate: false });

    // 4. Delete Users (Except Admin/Developer)
    console.log('Clearing Standard Users (Keeping Admins)...');
    await User.destroy({
      where: {
        role: {
          [Op.notIn]: ['admin', 'developer']
        }
      },
      truncate: false
    });

    console.log('✅ Success: All test orders and users cleared! Ready for launch.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetForLaunch();
