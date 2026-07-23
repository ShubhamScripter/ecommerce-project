import Order from '../../models/Order.js';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import Coupon from '../../models/Coupon.js';
import Address from '../../models/Address.js';
import Settings from '../../models/Settings.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import { generateOrderNumber } from '../../utils/orderNumber.js';

export const createOrder = asyncHandler(async (req, res, next) => {
  const { addressId, shippingAddress, paymentMethod = 'cod', notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) {
    return next(new AppError('Cart is empty', 400));
  }

  let address;
  if (addressId) {
    address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return next(new AppError('Address not found', 404));
  } else if (shippingAddress) {
    address = shippingAddress;
  } else {
    return next(new AppError('Shipping address is required', 400));
  }

  // Validate stock
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      return next(new AppError(`Product unavailable: ${item.product}`, 400));
    }
    const sizeOption = product.sizes.find((s) => s.size === item.size);
    if (!sizeOption || sizeOption.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name} (size ${item.size})`, 400));
    }
  }

  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  const subtotal = cart.subtotal;
  let discountAmount = cart.discountAmount || 0;
  let couponData = null;

  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon) {
      const validation = coupon.isValid(subtotal);
      if (validation.valid) {
        discountAmount = coupon.calculateDiscount(subtotal);
        couponData = {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };
      } else {
        discountAmount = 0;
      }
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingCharge =
    afterDiscount >= settings.freeShippingMinOrder ? 0 : settings.shippingCharges;
  const taxAmount = (afterDiscount * settings.taxPercentage) / 100;
  const totalAmount = afterDiscount + shippingCharge + taxAmount;

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0]?.url || '',
    sku: item.product.sku,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India',
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
    subtotal,
    shippingCharge,
    taxAmount,
    discountAmount,
    totalAmount,
    coupon: couponData,
    notes,
  });

  // Decrement stock & update sold count
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
    if (sizeIndex > -1) {
      product.sizes[sizeIndex].stock -= item.quantity;
    }
    product.stock = Math.max(0, product.stock - item.quantity);
    product.soldCount += item.quantity;
    await product.save();
  }

  // Update coupon usage
  if (cart.coupon && couponData) {
    await Coupon.findByIdAndUpdate(cart.coupon, {
      $inc: { usedCount: 1 },
      $push: { usedBy: { user: req.user._id, order: order._id } },
    });
  }

  // Clear cart
  cart.items = [];
  cart.coupon = null;
  cart.discountAmount = 0;
  await cart.save();

  apiResponse(res, {
    statusCode: 201,
    message: 'Order placed successfully',
    data: order,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Orders fetched',
    data: orders,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getMyOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) return next(new AppError('Order not found', 404));
  apiResponse(res, { message: 'Order fetched', data: order });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) return next(new AppError('Order not found', 404));

  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'cancelled',
    note: order.cancelReason,
    updatedBy: req.user._id,
  });

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex > -1) product.sizes[sizeIndex].stock += item.quantity;
      product.stock += item.quantity;
      product.soldCount = Math.max(0, product.soldCount - item.quantity);
      await product.save();
    }
  }

  await order.save();
  apiResponse(res, { message: 'Order cancelled', data: order });
});

export const requestReturn = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) return next(new AppError('Order not found', 404));
  if (order.status !== 'delivered') {
    return next(new AppError('Only delivered orders can be returned', 400));
  }

  order.status = 'return_requested';
  order.statusHistory.push({
    status: 'return_requested',
    note: req.body.reason || 'Return requested by customer',
    updatedBy: req.user._id,
  });
  await order.save();

  apiResponse(res, { message: 'Return requested', data: order });
});
