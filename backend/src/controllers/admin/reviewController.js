import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';

const updateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: {
        average: Math.round(stats[0].average * 10) / 10,
        count: stats[0].count,
      },
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratings: { average: 0, count: 0 },
    });
  }
};

export const getReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.product) filter.product = req.query.product;
  if (req.query.rating) filter.rating = Number(req.query.rating);
  if (req.query.search) {
    filter.$or = [
      { comment: { $regex: req.query.search, $options: 'i' } },
      { title: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name images slug')
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

export const approveReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  review.status = 'approved';
  await review.save();
  await updateProductRatings(review.product);

  apiResponse(res, { message: 'Review approved', data: review });
});

export const rejectReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  review.status = 'rejected';
  await review.save();
  await updateProductRatings(review.product);

  apiResponse(res, { message: 'Review rejected', data: review });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const productId = review.product;
  await review.deleteOne();
  await updateProductRatings(productId);

  apiResponse(res, { message: 'Review deleted' });
});

export { updateProductRatings };
