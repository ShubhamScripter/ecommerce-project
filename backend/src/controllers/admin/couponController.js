import Coupon from '../../models/Coupon.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';

export const getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.search) {
    filter.code = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Coupons fetched',
    data: coupons,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  apiResponse(res, { message: 'Coupon fetched', data: coupon });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({
    code: req.body.code.toUpperCase(),
    description: req.body.description,
    discountType: req.body.discountType,
    discountValue: req.body.discountValue,
    minOrderAmount: req.body.minOrderAmount || 0,
    maxDiscountAmount: req.body.maxDiscountAmount,
    usageLimit: req.body.usageLimit || null,
    perUserLimit: req.body.perUserLimit || 1,
    expiryDate: req.body.expiryDate,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
  });

  apiResponse(res, { statusCode: 201, message: 'Coupon created', data: coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));

  const fields = [
    'description',
    'discountType',
    'discountValue',
    'minOrderAmount',
    'maxDiscountAmount',
    'usageLimit',
    'perUserLimit',
    'expiryDate',
    'isActive',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) coupon[field] = req.body[field];
  });

  if (req.body.code) coupon.code = req.body.code.toUpperCase();

  await coupon.save();
  apiResponse(res, { message: 'Coupon updated', data: coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return next(new AppError('Coupon not found', 404));
  await coupon.deleteOne();
  apiResponse(res, { message: 'Coupon deleted' });
});
