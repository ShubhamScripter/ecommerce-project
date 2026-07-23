import express from 'express';
import {
  getProducts,
  getProductBySlug,
  instantSearch,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCategories,
  getBrands,
  getBanners,
  getSettings,
  getHomeData,
} from '../../controllers/customer/productController.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../../controllers/customer/cartController.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} from '../../controllers/customer/wishlistController.js';
import {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelOrder,
  requestReturn,
} from '../../controllers/customer/orderController.js';
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../controllers/customer/profileController.js';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteMyReview,
} from '../../controllers/customer/reviewController.js';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { uploadSingle, uploadMultiple } from '../../utils/upload.js';
import {
  cartItemValidation,
  addressValidation,
  reviewValidation,
} from '../../validators/index.js';
import {
  mongoIdValidation,
  updateProfileValidation,
} from '../../validators/authValidators.js';

const router = express.Router();

// Public catalog
router.get('/home', getHomeData);
router.get('/products', getProducts);
router.get('/products/search', instantSearch);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/new-arrivals', getNewArrivals);
router.get('/products/best-sellers', getBestSellers);
router.get('/products/:slug', getProductBySlug);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/banners', getBanners);
router.get('/settings', getSettings);
router.get('/products/:productId/reviews', getProductReviews);

// Cart (protected)
router.get('/cart', protect, getCart);
router.post('/cart', protect, cartItemValidation, validate, addToCart);
router.put('/cart/:itemId', protect, updateCartItem);
router.delete('/cart/:itemId', protect, removeCartItem);
router.delete('/cart', protect, clearCart);
router.post('/cart/coupon', protect, applyCoupon);
router.delete('/cart/coupon', protect, removeCoupon);

// Wishlist
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Orders
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getMyOrders);
router.get('/orders/:id', protect, mongoIdValidation, validate, getMyOrder);
router.put('/orders/:id/cancel', protect, mongoIdValidation, validate, cancelOrder);
router.put('/orders/:id/return', protect, mongoIdValidation, validate, requestReturn);

// Profile & addresses
router.get('/profile', protect, getProfile);
router.put(
  '/profile',
  protect,
  uploadSingle('avatar'),
  updateProfileValidation,
  validate,
  updateProfile
);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addressValidation, validate, createAddress);
router.put('/addresses/:id', protect, mongoIdValidation, addressValidation, validate, updateAddress);
router.delete('/addresses/:id', protect, mongoIdValidation, validate, deleteAddress);
router.put('/addresses/:id/default', protect, mongoIdValidation, validate, setDefaultAddress);

// Reviews
router.post(
  '/reviews',
  protect,
  uploadMultiple('images', 5),
  reviewValidation,
  validate,
  createReview
);
router.put('/reviews/:id', protect, mongoIdValidation, validate, updateReview);
router.delete('/reviews/:id', protect, mongoIdValidation, validate, deleteMyReview);

export default router;
