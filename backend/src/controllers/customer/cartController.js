import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import Coupon from '../../models/Coupon.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse } from '../../utils/apiResponse.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const populateCart = (cart) =>
  cart.populate([
    {
      path: 'items.product',
      select: 'name slug price discountPrice images stock sizes colors isActive',
    },
    { path: 'coupon', select: 'code discountType discountValue' },
  ]);

export const getCart = asyncHandler(async (req, res) => {
  let cart = await getOrCreateCart(req.user._id);
  cart = await populateCart(cart);

  apiResponse(res, {
    message: 'Cart fetched',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  const sizeOption = product.sizes.find((s) => s.size === size);
  if (!sizeOption) return next(new AppError('Selected size is not available', 400));
  if (sizeOption.stock < quantity) {
    return next(new AppError('Insufficient stock for selected size', 400));
  }

  const colorExists = product.colors.some(
    (c) => c.name.toLowerCase() === color.toLowerCase()
  );
  if (!colorExists) return next(new AppError('Selected color is not available', 400));

  let cart = await getOrCreateCart(req.user._id);
  const price = product.discountPrice != null ? product.discountPrice : product.price;

  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color.toLowerCase() === color.toLowerCase()
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + Number(quantity);
    if (sizeOption.stock < newQty) {
      return next(new AppError('Insufficient stock', 400));
    }
    cart.items[existingIndex].quantity = newQty;
    cart.items[existingIndex].price = price;
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      size,
      color,
      price,
    });
  }

  await cart.save();
  cart = await populateCart(cart);

  apiResponse(res, {
    statusCode: 201,
    message: 'Item added to cart',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  let cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Cart item not found', 404));

  const product = await Product.findById(item.product);
  if (!product) return next(new AppError('Product no longer available', 404));

  const sizeOption = product.sizes.find((s) => s.size === item.size);
  if (!sizeOption || sizeOption.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  item.quantity = quantity;
  item.price = product.discountPrice != null ? product.discountPrice : product.price;
  await cart.save();
  cart = await populateCart(cart);

  apiResponse(res, {
    message: 'Cart updated',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});

export const removeCartItem = asyncHandler(async (req, res, next) => {
  let cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Cart item not found', 404));

  item.deleteOne();
  await cart.save();
  cart = await populateCart(cart);

  apiResponse(res, {
    message: 'Item removed from cart',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  let cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = null;
  cart.discountAmount = 0;
  await cart.save();

  apiResponse(res, { message: 'Cart cleared', data: cart });
});

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new AppError('Coupon code is required', 400));

  let cart = await getOrCreateCart(req.user._id);
  if (!cart.items.length) return next(new AppError('Cart is empty', 400));

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return next(new AppError('Invalid coupon code', 404));

  const validation = coupon.isValid(cart.subtotal);
  if (!validation.valid) return next(new AppError(validation.message, 400));

  const userUsage = coupon.usedBy.filter(
    (u) => u.user.toString() === req.user._id.toString()
  ).length;
  if (userUsage >= coupon.perUserLimit) {
    return next(new AppError('You have already used this coupon', 400));
  }

  cart.coupon = coupon._id;
  cart.discountAmount = coupon.calculateDiscount(cart.subtotal);
  await cart.save();
  cart = await populateCart(cart);

  apiResponse(res, {
    message: 'Coupon applied',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  let cart = await getOrCreateCart(req.user._id);
  cart.coupon = null;
  cart.discountAmount = 0;
  await cart.save();
  cart = await populateCart(cart);

  apiResponse(res, {
    message: 'Coupon removed',
    data: {
      ...cart.toObject(),
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
    },
  });
});
