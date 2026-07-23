import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.parent === 'null' || req.query.main === 'true') {
    filter.parent = null;
  } else if (req.query.parent) {
    filter.parent = req.query.parent;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate('parent', 'name')
      .populate('subCategories')
      .sort('sortOrder name')
      .skip(skip)
      .limit(limit),
    Category.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Categories fetched',
    data: categories,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null })
    .populate({
      path: 'subCategories',
      match: req.query.isActive !== undefined ? { isActive: req.query.isActive === 'true' } : {},
      options: { sort: { sortOrder: 1, name: 1 } },
    })
    .sort('sortOrder name');

  apiResponse(res, { message: 'Category tree fetched', data: categories });
});

export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name')
    .populate('subCategories');

  if (!category) return next(new AppError('Category not found', 404));
  apiResponse(res, { message: 'Category fetched', data: category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = {
    name: req.body.name,
    description: req.body.description,
    parent: req.body.parent || null,
    isActive: req.body.isActive !== undefined ? req.body.isActive === true || req.body.isActive === 'true' : true,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : 0,
  };

  if (req.file) {
    data.image = await uploadToCloudinary(req.file.buffer, 'shoe-ecommerce/categories');
  }

  const category = await Category.create(data);
  apiResponse(res, { statusCode: 201, message: 'Category created', data: category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));

  const data = {
    name: req.body.name ?? category.name,
    description: req.body.description ?? category.description,
    parent: req.body.parent !== undefined ? req.body.parent || null : category.parent,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : category.sortOrder,
  };

  if (req.body.isActive !== undefined) {
    data.isActive = req.body.isActive === true || req.body.isActive === 'true';
  }

  if (req.file) {
    if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
    data.image = await uploadToCloudinary(req.file.buffer, 'shoe-ecommerce/categories');
  }

  category = await Category.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate('parent', 'name');

  apiResponse(res, { message: 'Category updated', data: category });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));

  const childCount = await Category.countDocuments({ parent: category._id });
  if (childCount > 0) {
    return next(new AppError('Delete sub-categories first', 400));
  }

  const productCount = await Product.countDocuments({
    $or: [{ category: category._id }, { subCategory: category._id }],
  });
  if (productCount > 0) {
    return next(new AppError('Cannot delete category with associated products', 400));
  }

  if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
  await category.deleteOne();

  apiResponse(res, { message: 'Category deleted' });
});
