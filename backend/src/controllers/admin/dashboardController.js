import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Brand from '../../models/Brand.js';
import Review from '../../models/Review.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse } from '../../utils/apiResponse.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalBrands,
    totalOrders,
    pendingReviews,
    revenueAgg,
    recentOrders,
    ordersByStatus,
    salesLast7Days,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Category.countDocuments({ parent: null }),
    Brand.countDocuments(),
    Order.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] }, paymentStatus: { $in: ['paid', 'pending'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
        },
      },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10)
      .select('orderNumber totalAmount status paymentStatus createdAt user'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $nin: ['cancelled'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revenue = revenueAgg[0] || { totalRevenue: 0, totalSales: 0 };

  apiResponse(res, {
    message: 'Dashboard stats fetched',
    data: {
      totalSales: revenue.totalSales,
      totalRevenue: revenue.totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      totalCategories,
      totalBrands,
      pendingReviews,
      recentOrders,
      ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count])),
      salesLast7Days,
    },
  });
});
