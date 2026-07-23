import Settings from '../../models/Settings.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  apiResponse(res, { message: 'Settings fetched', data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const simpleFields = [
    'websiteName',
    'whatsappNumber',
    'shippingCharges',
    'freeShippingMinOrder',
    'taxPercentage',
    'metaTitle',
    'metaDescription',
  ];

  simpleFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  if (req.body.contact) {
    const contact =
      typeof req.body.contact === 'string' ? JSON.parse(req.body.contact) : req.body.contact;
    settings.contact = { ...settings.contact.toObject?.() || settings.contact, ...contact };
  }

  if (req.body.socialLinks) {
    const social =
      typeof req.body.socialLinks === 'string'
        ? JSON.parse(req.body.socialLinks)
        : req.body.socialLinks;
    settings.socialLinks = {
      ...(settings.socialLinks.toObject?.() || settings.socialLinks),
      ...social,
    };
  }

  if (req.body.currency) {
    const currency =
      typeof req.body.currency === 'string' ? JSON.parse(req.body.currency) : req.body.currency;
    settings.currency = {
      ...(settings.currency.toObject?.() || settings.currency),
      ...currency,
    };
  }

  if (req.files?.logo?.[0]) {
    if (settings.logo?.public_id) await deleteFromCloudinary(settings.logo.public_id);
    settings.logo = await uploadToCloudinary(req.files.logo[0].buffer, 'shoe-ecommerce/settings');
  }

  if (req.files?.favicon?.[0]) {
    if (settings.favicon?.public_id) await deleteFromCloudinary(settings.favicon.public_id);
    settings.favicon = await uploadToCloudinary(
      req.files.favicon[0].buffer,
      'shoe-ecommerce/settings'
    );
  }

  await settings.save();
  apiResponse(res, { message: 'Settings updated', data: settings });
});
