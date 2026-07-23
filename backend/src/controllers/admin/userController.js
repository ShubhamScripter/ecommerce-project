import User from '../../models/User.js';
import Order from '../../models/Order.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { role: 'customer' };

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.isBlocked !== undefined) {
    filter.isBlocked = req.query.isBlocked === 'true';
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Users fetched',
    data: users,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') {
    return next(new AppError('User not found', 404));
  }

  const orders = await Order.find({ user: user._id })
    .sort('-createdAt')
    .limit(10)
    .select('orderNumber totalAmount status createdAt');

  apiResponse(res, {
    message: 'User fetched',
    data: { user, recentOrders: orders },
  });
});

export const blockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') {
    return next(new AppError('User not found', 404));
  }

  user.isBlocked = true;
  await user.save({ validateBeforeSave: false });

  apiResponse(res, { message: 'User blocked successfully', data: user });
});

export const unblockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') {
    return next(new AppError('User not found', 404));
  }

  user.isBlocked = false;
  await user.save({ validateBeforeSave: false });

  apiResponse(res, { message: 'User unblocked successfully', data: user });
});
