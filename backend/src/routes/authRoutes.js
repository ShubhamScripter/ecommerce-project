import express from 'express';
import {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/customer/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/admin/login', authLimiter, loginValidation, validate, adminLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  validate,
  forgotPassword
);
router.put(
  '/reset-password/:token',
  passwordResetLimiter,
  resetPasswordValidation,
  validate,
  resetPassword
);
router.put(
  '/update-password',
  protect,
  changePasswordValidation,
  validate,
  updatePassword
);

export default router;
