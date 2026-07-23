import { body } from 'express-validator';

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('brand').isMongoId().withMessage('Valid brand ID is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('subCategory').optional({ nullable: true }).isMongoId().withMessage('Invalid sub category ID'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('gender')
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Gender must be men, women, unisex, or kids'),
  body('material').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('isFeatured').optional().isBoolean(),
  body('isBestSeller').optional().isBoolean(),
  body('isNewArrival').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('parent').optional({ nullable: true }).isMongoId().withMessage('Invalid parent category ID'),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];

export const brandValidation = [
  body('name').trim().notEmpty().withMessage('Brand name is required').isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('isActive').optional().isBoolean(),
];

export const couponValidation = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').isLength({ max: 20 }),
  body('discountType')
    .isIn(['flat', 'percentage'])
    .withMessage('Discount type must be flat or percentage'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('maxDiscountAmount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional({ nullable: true }).isInt({ min: 1 }),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('isActive').optional().isBoolean(),
];

export const bannerValidation = [
  body('title').trim().notEmpty().withMessage('Banner title is required').isLength({ max: 100 }),
  body('type')
    .isIn(['homepage', 'offer', 'festival', 'hero_slider'])
    .withMessage('Invalid banner type'),
  body('link').optional().trim(),
  body('buttonText').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];

export const orderStatusValidation = [
  body('status')
    .isIn([
      'pending',
      'confirmed',
      'packed',
      'shipped',
      'delivered',
      'cancelled',
      'return_requested',
      'returned',
    ])
    .withMessage('Invalid order status'),
  body('note').optional().trim(),
  body('trackingNumber').optional().trim(),
];

export const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required').isLength({ max: 1000 }),
  body('title').optional().trim().isLength({ max: 100 }),
];

export const addressValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('country').optional().trim(),
  body('label').optional().isIn(['home', 'work', 'other']),
  body('isDefault').optional().isBoolean(),
];

export const cartItemValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('size').trim().notEmpty().withMessage('Size is required'),
  body('color').trim().notEmpty().withMessage('Color is required'),
];
