import Wishlist from '../../models/Wishlist.js';
import Product from '../../models/Product.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse } from '../../utils/apiResponse.js';

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await getOrCreateWishlist(req.user._id);
  wishlist = await wishlist.populate({
    path: 'products',
    populate: { path: 'brand', select: 'name slug' },
  });

  apiResponse(res, { message: 'Wishlist fetched', data: wishlist });
});

export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  let wishlist = await getOrCreateWishlist(req.user._id);
  if (wishlist.products.some((p) => p.toString() === productId)) {
    return next(new AppError('Product already in wishlist', 400));
  }

  wishlist.products.push(productId);
  await wishlist.save();
  wishlist = await wishlist.populate({
    path: 'products',
    populate: { path: 'brand', select: 'name slug' },
  });

  apiResponse(res, {
    statusCode: 201,
    message: 'Added to wishlist',
    data: wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await getOrCreateWishlist(req.user._id);
  const exists = wishlist.products.some((p) => p.toString() === req.params.productId);
  if (!exists) return next(new AppError('Product not in wishlist', 404));

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );
  await wishlist.save();
  wishlist = await wishlist.populate({
    path: 'products',
    populate: { path: 'brand', select: 'name slug' },
  });

  apiResponse(res, { message: 'Removed from wishlist', data: wishlist });
});

export const toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  let wishlist = await getOrCreateWishlist(req.user._id);
  const index = wishlist.products.findIndex((p) => p.toString() === productId);
  let message;

  if (index > -1) {
    wishlist.products.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    wishlist.products.push(productId);
    message = 'Added to wishlist';
  }

  await wishlist.save();
  wishlist = await wishlist.populate({
    path: 'products',
    populate: { path: 'brand', select: 'name slug' },
  });

  apiResponse(res, { message, data: wishlist });
});
