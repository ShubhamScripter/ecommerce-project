import Brand from '../../models/Brand.js';
import Product from '../../models/Product.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

export const getBrands = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [brands, total] = await Promise.all([
    Brand.find(filter).sort('sortOrder name').skip(skip).limit(limit),
    Brand.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Brands fetched',
    data: brands,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError('Brand not found', 404));
  apiResponse(res, { message: 'Brand fetched', data: brand });
});

export const createBrand = asyncHandler(async (req, res) => {
  const data = {
    name: req.body.name,
    description: req.body.description,
    website: req.body.website,
    isActive: req.body.isActive !== undefined ? req.body.isActive === true || req.body.isActive === 'true' : true,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : 0,
  };

  if (req.file) {
    data.logo = await uploadToCloudinary(req.file.buffer, 'shoe-ecommerce/brands');
  }

  const brand = await Brand.create(data);
  apiResponse(res, { statusCode: 201, message: 'Brand created', data: brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  let brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError('Brand not found', 404));

  const data = {
    name: req.body.name ?? brand.name,
    description: req.body.description ?? brand.description,
    website: req.body.website ?? brand.website,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : brand.sortOrder,
  };

  if (req.body.isActive !== undefined) {
    data.isActive = req.body.isActive === true || req.body.isActive === 'true';
  }

  if (req.file) {
    if (brand.logo?.public_id) await deleteFromCloudinary(brand.logo.public_id);
    data.logo = await uploadToCloudinary(req.file.buffer, 'shoe-ecommerce/brands');
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  apiResponse(res, { message: 'Brand updated', data: brand });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new AppError('Brand not found', 404));

  const productCount = await Product.countDocuments({ brand: brand._id });
  if (productCount > 0) {
    return next(new AppError('Cannot delete brand with associated products', 400));
  }

  if (brand.logo?.public_id) await deleteFromCloudinary(brand.logo.public_id);
  await brand.deleteOne();

  apiResponse(res, { message: 'Brand deleted' });
});
