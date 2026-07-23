import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import { uploadMultipleToCloudinary } from '../../utils/cloudinaryUpload.js';
import { updateProductRatings } from '../admin/reviewController.js';

export const getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { product: req.params.productId, status: 'approved' };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Reviews fetched',
    data: reviews,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const purchased = await Order.findOne({
    user: req.user._id,
    status: 'delivered',
    'items.product': productId,
  });

  let images = [];
  if (req.files?.length) {
    images = await uploadMultipleToCloudinary(req.files, 'shoe-ecommerce/reviews');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!purchased,
    status: 'pending',
  });

  await review.populate('user', 'name avatar');

  apiResponse(res, {
    statusCode: 201,
    message: 'Review submitted for approval',
    data: review,
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) return next(new AppError('Review not found', 404));

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.title !== undefined) review.title = req.body.title;
  if (req.body.comment) review.comment = req.body.comment;
  review.status = 'pending';

  await review.save();
  await updateProductRatings(review.product);

  apiResponse(res, { message: 'Review updated', data: review });
});

export const deleteMyReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) return next(new AppError('Review not found', 404));

  const productId = review.product;
  await review.deleteOne();
  await updateProductRatings(productId);

  apiResponse(res, { message: 'Review deleted' });
});
