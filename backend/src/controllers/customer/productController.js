import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Brand from '../../models/Brand.js';
import Banner from '../../models/Banner.js';
import Review from '../../models/Review.js';
import Settings from '../../models/Settings.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';

const buildShopFilter = (query) => {
  const filter = { isActive: true };

  if (query.search) {
    const q = query.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (query.category) filter.category = query.category;
  if (query.subCategory) filter.subCategory = query.subCategory;
  if (query.brand) {
    filter.brand = query.brand.includes(',')
      ? { $in: query.brand.split(',') }
      : query.brand;
  }
  if (query.gender) filter.gender = query.gender;
  if (query.color) {
    filter['colors.name'] = { $regex: query.color, $options: 'i' };
  }
  if (query.size) {
    filter['sizes.size'] = query.size;
  }
  if (query.minPrice || query.maxPrice) {
    const priceFilter = {};
    if (query.minPrice) priceFilter.$gte = Number(query.minPrice);
    if (query.maxPrice) priceFilter.$lte = Number(query.maxPrice);
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { discountPrice: { $exists: true, $ne: null, ...priceFilter } },
        {
          $and: [
            { $or: [{ discountPrice: null }, { discountPrice: { $exists: false } }] },
            { price: priceFilter },
          ],
        },
      ],
    });
  }
  if (query.rating) {
    filter['ratings.average'] = { $gte: Number(query.rating) };
  }
  if (query.availability === 'in_stock') {
    filter.stock = { $gt: 0 };
  } else if (query.availability === 'out_of_stock') {
    filter.stock = 0;
  }
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.newArrival === 'true') filter.isNewArrival = true;

  return filter;
};

const getSortOption = (sort) => {
  const map = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
    best_rated: { 'ratings.average': -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };
  return map[sort] || { createdAt: -1 };
};

export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = buildShopFilter(req.query);
  const sort = getSortOption(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug')
      .select('-features')
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

export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug');

  if (!product) return next(new AppError('Product not found', 404));

  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

  const similar = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category._id }, { brand: product.brand._id }],
  })
    .populate('brand', 'name slug')
    .limit(8)
    .select('name slug price discountPrice images ratings brand');

  const reviews = await Review.find({ product: product._id, status: 'approved' })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  apiResponse(res, {
    message: 'Product fetched',
    data: { product, similar, reviews },
  });
});

export const instantSearch = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    return apiResponse(res, { message: 'Search results', data: [] });
  }

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
    ],
  })
    .populate('brand', 'name')
    .select('name slug price discountPrice images brand')
    .limit(8);

  apiResponse(res, { message: 'Search results', data: products });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('brand', 'name slug')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 8);

  apiResponse(res, { message: 'Featured products', data: products });
});

export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isNewArrival: true })
    .populate('brand', 'name slug')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 8);

  apiResponse(res, { message: 'New arrivals', data: products });
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isBestSeller: true })
    .populate('brand', 'name slug')
    .sort('-soldCount')
    .limit(Number(req.query.limit) || 8);

  apiResponse(res, { message: 'Best sellers', data: products });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null, isActive: true })
    .populate({
      path: 'subCategories',
      match: { isActive: true },
      options: { sort: { sortOrder: 1, name: 1 } },
    })
    .sort('sortOrder name');

  apiResponse(res, { message: 'Categories fetched', data: categories });
});

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort('sortOrder name');
  apiResponse(res, { message: 'Brands fetched', data: brands });
});

export const getBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = {
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }, { endDate: { $exists: false } }],
  };
  if (req.query.type) filter.type = req.query.type;

  const banners = await Banner.find(filter).sort('sortOrder');
  apiResponse(res, { message: 'Banners fetched', data: banners });
});

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  apiResponse(res, { message: 'Settings fetched', data: settings });
});

export const getHomeData = asyncHandler(async (req, res) => {
  const now = new Date();
  const [
    banners,
    featured,
    newArrivals,
    bestSellers,
    categories,
    brands,
    reviews,
    settings,
  ] = await Promise.all([
    Banner.find({
      isActive: true,
      type: { $in: ['hero_slider', 'homepage'] },
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }, { endDate: { $exists: false } }],
    }).sort('sortOrder'),
    Product.find({ isActive: true, isFeatured: true })
      .populate('brand', 'name slug')
      .limit(8),
    Product.find({ isActive: true, isNewArrival: true })
      .populate('brand', 'name slug')
      .sort('-createdAt')
      .limit(8),
    Product.find({ isActive: true, isBestSeller: true })
      .populate('brand', 'name slug')
      .sort('-soldCount')
      .limit(8),
    Category.find({ parent: null, isActive: true }).sort('sortOrder').limit(8),
    Brand.find({ isActive: true }).sort('sortOrder').limit(12),
    Review.find({ status: 'approved' })
      .populate('user', 'name avatar')
      .populate('product', 'name slug')
      .sort('-createdAt')
      .limit(6),
    Settings.findOne(),
  ]);

  apiResponse(res, {
    message: 'Home data fetched',
    data: {
      banners,
      featured,
      newArrivals,
      bestSellers,
      categories,
      brands,
      reviews,
      settings: settings || {},
    },
  });
});
