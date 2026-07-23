import Product from '../../models/Product.js';
import Review from '../../models/Review.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import {
  mapDiskFilesToImages,
  deleteLocalFile,
  deleteLocalFiles,
} from '../../utils/localUpload.js';
import slugify from 'slugify';

const parseJSON = (value, fallback) => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildProductData = (body) => {
  const data = {
    name: body.name,
    description: body.description,
    brand: body.brand,
    category: body.category,
    sku: body.sku,
    price: Number(body.price),
    stock: Number(body.stock),
    gender: body.gender,
  };

  if (body.slug) data.slug = slugify(body.slug, { lower: true, strict: true });
  if (body.subCategory) data.subCategory = body.subCategory;
  if (body.discountPrice !== undefined && body.discountPrice !== '') {
    data.discountPrice = Number(body.discountPrice);
  } else {
    data.discountPrice = undefined;
  }
  if (body.weight !== undefined && body.weight !== '') data.weight = Number(body.weight);
  if (body.material !== undefined) data.material = body.material;
  if (body.features !== undefined) data.features = parseJSON(body.features, []);
  if (body.colors !== undefined) data.colors = parseJSON(body.colors, []);
  if (body.sizes !== undefined) data.sizes = parseJSON(body.sizes, []);
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured === true || body.isFeatured === 'true';
  if (body.isBestSeller !== undefined) data.isBestSeller = body.isBestSeller === true || body.isBestSeller === 'true';
  if (body.isNewArrival !== undefined) data.isNewArrival = body.isNewArrival === true || body.isNewArrival === 'true';
  if (body.isActive !== undefined) data.isActive = body.isActive === true || body.isActive === 'true';

  return data;
};

// @desc    Get all products (admin)
// @route   GET /api/admin/products
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = req.query.brand;
  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    price_asc: 'price',
    price_desc: '-price',
    name: 'name',
    stock: 'stock',
  };
  const sort = sortMap[req.query.sort] || '-createdAt';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Products fetched',
    data: products,
    meta: buildPaginationMeta(total, page, limit),
  });
});

// @desc    Get single product
// @route   GET /api/admin/products/:id
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('brand', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name');

  if (!product) return next(new AppError('Product not found', 404));

  apiResponse(res, { message: 'Product fetched', data: product });
});

// @desc    Create product
// @route   POST /api/admin/products
export const createProduct = asyncHandler(async (req, res) => {
  const data = buildProductData(req.body);

  if (req.files?.length) {
    data.images = mapDiskFilesToImages(req.files, data.name);
  }

  const product = await Product.create(data);
  await product.populate([
    { path: 'brand', select: 'name' },
    { path: 'category', select: 'name' },
    { path: 'subCategory', select: 'name' },
  ]);

  apiResponse(res, {
    statusCode: 201,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const data = buildProductData(req.body);

  if (req.files?.length) {
    const startOrder = product.images.length;
    const newImages = mapDiskFilesToImages(req.files, data.name || product.name).map(
      (img, index) => ({
        ...img,
        sortOrder: startOrder + index,
      })
    );
    data.images = [...product.images, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  })
    .populate('brand', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name');

  apiResponse(res, { message: 'Product updated successfully', data: product });
});

// @desc    Delete product image
// @route   DELETE /api/admin/products/:id/images/:imageId
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const image = product.images.id(req.params.imageId);
  if (!image) return next(new AppError('Image not found', 404));

  deleteLocalFile(image.public_id);
  image.deleteOne();
  await product.save();

  apiResponse(res, { message: 'Image deleted', data: product });
});

// @desc    Reorder product images
// @route   PUT /api/admin/products/:id/images/reorder
export const reorderProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const { imageIds } = req.body;
  if (!Array.isArray(imageIds)) {
    return next(new AppError('imageIds array is required', 400));
  }

  const imageMap = new Map(product.images.map((img) => [img._id.toString(), img]));
  const reordered = imageIds
    .map((id, index) => {
      const img = imageMap.get(id);
      if (!img) return null;
      img.sortOrder = index;
      return img;
    })
    .filter(Boolean);

  product.images = reordered;
  await product.save();

  apiResponse(res, { message: 'Images reordered', data: product });
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const publicIds = product.images.map((img) => img.public_id);
  deleteLocalFiles(publicIds);
  await Review.deleteMany({ product: product._id });
  await product.deleteOne();

  apiResponse(res, { message: 'Product deleted successfully' });
});
