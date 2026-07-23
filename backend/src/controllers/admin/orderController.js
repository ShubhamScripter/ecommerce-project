import Order from '../../models/Order.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';

export const getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.search) {
    filter.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Orders fetched',
    data: orders,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('statusHistory.updatedBy', 'name');

  if (!order) return next(new AppError('Order not found', 404));
  apiResponse(res, { message: 'Order fetched', data: order });
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  const { status, note, trackingNumber } = req.body;

  order.status = status;
  order.statusHistory.push({
    status,
    note,
    updatedBy: req.user._id,
  });

  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') order.paymentStatus = 'paid';
  }
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = note;
  }

  await order.save();
  await order.populate('user', 'name email phone');

  apiResponse(res, { message: 'Order status updated', data: order });
});

export const getInvoice = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return next(new AppError('Order not found', 404));

  apiResponse(res, {
    message: 'Invoice data fetched',
    data: {
      invoiceNumber: `INV-${order.orderNumber}`,
      order,
      issuedAt: new Date(),
    },
  });
});
