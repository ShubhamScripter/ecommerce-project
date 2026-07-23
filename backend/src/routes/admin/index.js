import express from 'express';
import { getDashboardStats } from '../../controllers/admin/dashboardController.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  reorderProductImages,
} from '../../controllers/admin/productController.js';
import {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/admin/categoryController.js';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../../controllers/admin/brandController.js';
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  getInvoice,
} from '../../controllers/admin/orderController.js';
import {
  getUsers,
  getUser,
  blockUser,
  unblockUser,
} from '../../controllers/admin/userController.js';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../controllers/admin/couponController.js';
import {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
} from '../../controllers/admin/bannerController.js';
import {
  getReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from '../../controllers/admin/reviewController.js';
import { getSettings, updateSettings } from '../../controllers/admin/settingsController.js';
import { protect, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  uploadSingle,
  uploadFields,
  uploadProductImages,
} from '../../utils/upload.js';
import {
  productValidation,
  categoryValidation,
  brandValidation,
  couponValidation,
  bannerValidation,
  orderStatusValidation,
} from '../../validators/index.js';
import { mongoIdValidation } from '../../validators/authValidators.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router
  .route('/products')
  .get(getProducts)
  .post(uploadProductImages(10), productValidation, validate, createProduct);
router
  .route('/products/:id')
  .get(mongoIdValidation, validate, getProduct)
  .put(mongoIdValidation, uploadProductImages(10), productValidation, validate, updateProduct)
  .delete(mongoIdValidation, validate, deleteProduct);
router.delete(
  '/products/:id/images/:imageId',
  mongoIdValidation,
  validate,
  deleteProductImage
);
router.put('/products/:id/images/reorder', mongoIdValidation, validate, reorderProductImages);

// Categories
router.get('/categories/tree', getCategoryTree);
router
  .route('/categories')
  .get(getCategories)
  .post(uploadSingle('image'), categoryValidation, validate, createCategory);
router
  .route('/categories/:id')
  .get(mongoIdValidation, validate, getCategory)
  .put(mongoIdValidation, uploadSingle('image'), categoryValidation, validate, updateCategory)
  .delete(mongoIdValidation, validate, deleteCategory);

// Brands
router
  .route('/brands')
  .get(getBrands)
  .post(uploadSingle('logo'), brandValidation, validate, createBrand);
router
  .route('/brands/:id')
  .get(mongoIdValidation, validate, getBrand)
  .put(mongoIdValidation, uploadSingle('logo'), brandValidation, validate, updateBrand)
  .delete(mongoIdValidation, validate, deleteBrand);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', mongoIdValidation, validate, getOrder);
router.put(
  '/orders/:id/status',
  mongoIdValidation,
  orderStatusValidation,
  validate,
  updateOrderStatus
);
router.get('/orders/:id/invoice', mongoIdValidation, validate, getInvoice);

// Users
router.get('/users', getUsers);
router.get('/users/:id', mongoIdValidation, validate, getUser);
router.put('/users/:id/block', mongoIdValidation, validate, blockUser);
router.put('/users/:id/unblock', mongoIdValidation, validate, unblockUser);

// Coupons
router
  .route('/coupons')
  .get(getCoupons)
  .post(couponValidation, validate, createCoupon);
router
  .route('/coupons/:id')
  .get(mongoIdValidation, validate, getCoupon)
  .put(mongoIdValidation, couponValidation, validate, updateCoupon)
  .delete(mongoIdValidation, validate, deleteCoupon);

// Banners
router
  .route('/banners')
  .get(getBanners)
  .post(
    uploadFields([
      { name: 'image', maxCount: 1 },
      { name: 'mobileImage', maxCount: 1 },
    ]),
    bannerValidation,
    validate,
    createBanner
  );
router
  .route('/banners/:id')
  .get(mongoIdValidation, validate, getBanner)
  .put(
    mongoIdValidation,
    uploadFields([
      { name: 'image', maxCount: 1 },
      { name: 'mobileImage', maxCount: 1 },
    ]),
    bannerValidation,
    validate,
    updateBanner
  )
  .delete(mongoIdValidation, validate, deleteBanner);
router.put('/banners/:id/toggle', mongoIdValidation, validate, toggleBanner);

// Reviews
router.get('/reviews', getReviews);
router.put('/reviews/:id/approve', mongoIdValidation, validate, approveReview);
router.put('/reviews/:id/reject', mongoIdValidation, validate, rejectReview);
router.delete('/reviews/:id', mongoIdValidation, validate, deleteReview);

// Settings
router
  .route('/settings')
  .get(getSettings)
  .put(
    uploadFields([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
    updateSettings
  );

export default router;
