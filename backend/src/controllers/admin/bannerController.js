import Banner from '../../models/Banner.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse, paginate, buildPaginationMeta } from '../../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

export const getBanners = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

  const [banners, total] = await Promise.all([
    Banner.find(filter).sort('sortOrder -createdAt').skip(skip).limit(limit),
    Banner.countDocuments(filter),
  ]);

  apiResponse(res, {
    message: 'Banners fetched',
    data: banners,
    meta: buildPaginationMeta(total, page, limit),
  });
});

export const getBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError('Banner not found', 404));
  apiResponse(res, { message: 'Banner fetched', data: banner });
});

export const createBanner = asyncHandler(async (req, res, next) => {
  if (!req.file && !req.files?.image?.[0]) {
    return next(new AppError('Banner image is required', 400));
  }

  const imageFile = req.file || req.files.image[0];
  const image = await uploadToCloudinary(imageFile.buffer, 'shoe-ecommerce/banners');

  let mobileImage;
  if (req.files?.mobileImage?.[0]) {
    mobileImage = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      'shoe-ecommerce/banners'
    );
  }

  const banner = await Banner.create({
    title: req.body.title,
    subtitle: req.body.subtitle,
    type: req.body.type,
    image,
    mobileImage,
    link: req.body.link,
    buttonText: req.body.buttonText || 'Shop Now',
    isActive: req.body.isActive !== undefined ? req.body.isActive === true || req.body.isActive === 'true' : true,
    sortOrder: req.body.sortOrder != null ? Number(req.body.sortOrder) : 0,
    startDate: req.body.startDate || Date.now(),
    endDate: req.body.endDate || undefined,
  });

  apiResponse(res, { statusCode: 201, message: 'Banner created', data: banner });
});

export const updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError('Banner not found', 404));

  const fields = ['title', 'subtitle', 'type', 'link', 'buttonText', 'startDate', 'endDate'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) banner[field] = req.body[field];
  });

  if (req.body.isActive !== undefined) {
    banner.isActive = req.body.isActive === true || req.body.isActive === 'true';
  }
  if (req.body.sortOrder != null) banner.sortOrder = Number(req.body.sortOrder);

  const imageFile = req.file || req.files?.image?.[0];
  if (imageFile) {
    if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
    banner.image = await uploadToCloudinary(imageFile.buffer, 'shoe-ecommerce/banners');
  }

  if (req.files?.mobileImage?.[0]) {
    if (banner.mobileImage?.public_id) await deleteFromCloudinary(banner.mobileImage.public_id);
    banner.mobileImage = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      'shoe-ecommerce/banners'
    );
  }

  await banner.save();
  apiResponse(res, { message: 'Banner updated', data: banner });
});

export const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError('Banner not found', 404));

  if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
  if (banner.mobileImage?.public_id) await deleteFromCloudinary(banner.mobileImage.public_id);
  await banner.deleteOne();

  apiResponse(res, { message: 'Banner deleted' });
});

export const toggleBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return next(new AppError('Banner not found', 404));

  banner.isActive = !banner.isActive;
  await banner.save();

  apiResponse(res, {
    message: `Banner ${banner.isActive ? 'enabled' : 'disabled'}`,
    data: banner,
  });
});
