import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: 'Stride',
      trim: true,
    },
    logo: {
      public_id: String,
      url: String,
    },
    favicon: {
      public_id: String,
      url: String,
    },
    contact: {
      email: { type: String, default: 'support@stride.com' },
      phone: { type: String, default: '+91 98765 43210' },
      address: {
        type: String,
        default: '123 Commerce Street, Mumbai, India',
      },
    },
    whatsappNumber: {
      type: String,
      default: '919549710379',
      trim: true,
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    shippingCharges: {
      type: Number,
      default: 49,
      min: 0,
    },
    freeShippingMinOrder: {
      type: Number,
      default: 999,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
    },
    metaTitle: {
      type: String,
      default: 'Stride - Premium Footwear',
    },
    metaDescription: {
      type: String,
      default: 'Shop premium shoes from top brands. Free shipping on orders above ₹999.',
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
