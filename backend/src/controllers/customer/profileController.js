import User from '../../models/User.js';
import Address from '../../models/Address.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  apiResponse(res, { message: 'Profile fetched', data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.name) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;

  if (req.file) {
    if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id);
    user.avatar = await uploadToCloudinary(req.file.buffer, 'shoe-ecommerce/avatars');
  }

  await user.save();
  apiResponse(res, { message: 'Profile updated', data: user });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort('-isDefault -createdAt');
  apiResponse(res, { message: 'Addresses fetched', data: addresses });
});

export const createAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    ...req.body,
    user: req.user._id,
  });

  apiResponse(res, { statusCode: 201, message: 'Address created', data: address });
});

export const updateAddress = asyncHandler(async (req, res, next) => {
  let address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError('Address not found', 404));

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const fields = [
    'fullName',
    'phone',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'postalCode',
    'country',
    'label',
    'isDefault',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) address[field] = req.body[field];
  });

  await address.save();
  apiResponse(res, { message: 'Address updated', data: address });
});

export const deleteAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError('Address not found', 404));

  await address.deleteOne();
  apiResponse(res, { message: 'Address deleted' });
});

export const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) return next(new AppError('Address not found', 404));

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  apiResponse(res, { message: 'Default address set', data: address });
});
