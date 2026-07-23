import dotenv from 'dotenv';
import mongoose from 'mongoose';
import slugify from 'slugify';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Address from '../models/Address.js';

dotenv.config();

const PRODUCT_COUNT = 250;

const brands = [
  'Nike',
  'Adidas',
  'Puma',
  'Reebok',
  'Woodland',
  'Bata',
  'Campus',
  'Asian',
];

const subCategoryNames = [
  'Sneakers',
  'Running',
  'Casual',
  'Formal',
  'Loafers',
  'Boots',
  'Sandals',
  'Slippers',
  'Sports',
  'Basketball',
  'Football',
  'Cricket',
  'Trekking',
];

/**
 * Only use URLs that return HTTP 200 (verified).
 * No fit=crop — cropping was cutting shoes in half.
 */
const CANDIDATE_SHOE_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
  'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
  'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80',
  'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
  'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
  'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
  'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&q=80',
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=80',
  'https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&q=80',
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80',
  'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=80',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
  'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
];

let RELIABLE_SHOE_IMAGES = [];

const verifyImageUrl = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
};

const loadVerifiedImages = async () => {
  console.log('Verifying product image URLs...');
  const ok = [];
  for (const url of CANDIDATE_SHOE_IMAGES) {
    const valid = await verifyImageUrl(url);
    if (valid) {
      ok.push(url);
      console.log(`  ✓ ${url.split('?')[0].split('/').pop()}`);
    } else {
      console.log(`  ✗ skipped (broken): ${url.split('?')[0].split('/').pop()}`);
    }
  }
  if (ok.length < 8) {
    throw new Error(`Only ${ok.length} working images found — need at least 8`);
  }
  console.log(`Using ${ok.length} verified shoe images`);
  return ok;
};

const adjectives = [
  'Aero',
  'Pulse',
  'Urban',
  'Swift',
  'Prime',
  'Flex',
  'Storm',
  'Nova',
  'Trail',
  'Core',
  'Elite',
  'Bolt',
  'Vista',
  'Stride',
  'Velocity',
  'Horizon',
  'Summit',
  'Orbit',
  'Blaze',
  'Shadow',
  'Fusion',
  'Quantum',
  'Turbo',
  'Vertex',
  'Alpha',
];

const modelNames = [
  'Runner',
  'Trainer',
  'Sneaker',
  'Court',
  'Walker',
  'Glide',
  'Dash',
  'Kick',
  'Slip',
  'Boot',
  'Oxford',
  'Loafer',
  'Sandal',
  'Slide',
  'Cleat',
  'Hiker',
  'Marathon',
  'Street',
  'Classic',
  'Pro',
];

const seriesTags = [
  'X',
  'Pro',
  'Lite',
  'Max',
  'Elite',
  'Plus',
  'Air',
  'Neo',
  'GT',
  'SE',
  'V2',
  'V3',
  'One',
  'Zero',
  'Ultra',
];

const colorPalette = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B3A4B' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Beige', hex: '#D4C4A8' },
  { name: 'Orange', hex: '#EA580C' },
];

const materials = [
  'Mesh & Synthetic',
  'Leather',
  'Genuine Leather',
  'Canvas',
  'Nubuck Leather',
  'Primeknit',
  'Knit Upper',
  'Suede & Mesh',
  'Synthetic Leather',
  'Flyknit',
];

const featurePools = [
  'Breathable mesh',
  'Cushioned midsole',
  'Lightweight design',
  'Non-slip sole',
  'Padded collar',
  'Memory foam insole',
  'Durable outsole',
  'Flexible grooves',
  'Ankle support',
  'Water resistant',
  'Easy slip-on',
  'Reflective accents',
  'Ortholite sockliner',
  'Shock absorption',
];

const genders = ['men', 'women', 'unisex', 'kids'];

const sizeSets = {
  men: ['6', '7', '8', '9', '10', '11', '12'],
  women: ['4', '5', '6', '7', '8', '9'],
  unisex: ['6', '7', '8', '9', '10', '11'],
  kids: ['1', '2', '3', '4', '5', '6'],
};

const pick = (arr, i) => arr[i % arr.length];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildImages = (productIndex, productName) => {
  const images = [];
  for (let i = 0; i < 3; i++) {
    const url = pick(RELIABLE_SHOE_IMAGES, productIndex * 3 + i);
    images.push({
      public_id: `seed/product-${productIndex + 1}-${i + 1}`,
      url,
      alt: `${productName} view ${i + 1}`,
      sortOrder: i,
    });
  }
  return images;
};

const buildProduct = (index, brandDocs, shoesCategory, subCategories) => {
  const n = index + 1;
  const brand = pick(brandDocs, index);
  const sub = pick(subCategories, index);
  const gender = pick(genders, index);
  const adj = pick(adjectives, index);
  const model = pick(modelNames, index * 3);
  const series = pick(seriesTags, index * 7);
  const name = `${adj} ${model} ${series} ${String(n).padStart(3, '0')}`;

  const basePrice = randInt(1999, 18999);
  const hasDiscount = index % 3 !== 0;
  const discountPrice = hasDiscount
    ? Math.round(basePrice * (0.65 + (index % 20) / 100))
    : undefined;

  const colorA = pick(colorPalette, index);
  const colorB = pick(colorPalette, index + 5);
  const colors =
    colorA.name === colorB.name
      ? [colorA, pick(colorPalette, index + 8)]
      : [colorA, colorB];

  const sizeList = sizeSets[gender];
  const sizes = sizeList.map((size) => ({
    size,
    stock: randInt(2, 18),
  }));
  const stock = sizes.reduce((sum, s) => sum + s.stock, 0);

  const features = [
    pick(featurePools, index),
    pick(featurePools, index + 3),
    pick(featurePools, index + 7),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    name,
    slug: slugify(name, { lower: true, strict: true }),
    description: `Premium ${sub.name.toLowerCase()} footwear from ${brand.name}. The ${name} delivers everyday comfort with a stylish silhouette — ideal for ${gender === 'unisex' ? 'everyone' : gender}. Engineered for durability and all-day wear.`,
    features,
    brand: brand._id,
    category: shoesCategory._id,
    subCategory: sub._id,
    sku: `SHOE-${String(n).padStart(4, '0')}`,
    price: basePrice,
    ...(discountPrice != null && discountPrice < basePrice ? { discountPrice } : {}),
    stock,
    gender,
    colors,
    sizes,
    images: buildImages(index, name),
    weight: Number((0.5 + Math.random() * 0.9).toFixed(2)),
    material: pick(materials, index),
    isFeatured: index % 11 === 0,
    isBestSeller: index % 7 === 0,
    isNewArrival: index % 5 === 0,
    isActive: true,
    ratings: {
      average: Number((3.2 + Math.random() * 1.7).toFixed(1)),
      count: randInt(0, 120),
    },
    soldCount: randInt(0, 350),
    views: randInt(10, 5000),
  };
};

const seed = async () => {
  try {
    await connectDB();

    RELIABLE_SHOE_IMAGES = await loadVerifiedImages();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Settings.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Address.deleteMany({}),
    ]);

    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@shoestore.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      phone: '+919876543210',
    });

    console.log('Creating demo customer...');
    await User.create({
      name: 'Demo Customer',
      email: 'customer@shoestore.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '+919876543211',
    });

    console.log('Creating brands...');
    const createdBrands = [];
    for (let index = 0; index < brands.length; index++) {
      const name = brands[index];
      createdBrands.push(
        await Brand.create({
          name,
          slug: slugify(name, { lower: true, strict: true }),
          description: `${name} official footwear collection`,
          sortOrder: index,
          isActive: true,
        })
      );
    }

    console.log('Creating categories...');
    const shoes = await Category.create({
      name: 'Shoes',
      slug: 'shoes',
      description: 'All footwear categories',
      parent: null,
      sortOrder: 0,
    });

    const subCategories = [];
    for (let index = 0; index < subCategoryNames.length; index++) {
      const name = subCategoryNames[index];
      subCategories.push(
        await Category.create({
          name,
          slug: slugify(name, { lower: true, strict: true }),
          description: `${name} shoes`,
          parent: shoes._id,
          sortOrder: index,
        })
      );
    }

    console.log(`Creating ${PRODUCT_COUNT} products with images...`);
    const products = [];
    for (let i = 0; i < PRODUCT_COUNT; i++) {
      products.push(buildProduct(i, createdBrands, shoes, subCategories));
    }

    // Insert in batches for reliability
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`  Inserted ${Math.min(i + batchSize, products.length)} / ${PRODUCT_COUNT}`);
    }

    const withImages = await Product.countDocuments({
      'images.0': { $exists: true },
    });

    console.log('Creating settings...');
    await Settings.create({
      websiteName: 'Stride',
      whatsappNumber: '919549710379',
      contact: {
        email: 'support@stride.com',
        phone: '+919549710379',
        address: '123 Commerce Street, Mumbai, Maharashtra, India',
      },
      socialLinks: {
        facebook: 'https://facebook.com/stride',
        instagram: 'https://instagram.com/stride',
        twitter: 'https://twitter.com/stride',
      },
      shippingCharges: 49,
      freeShippingMinOrder: 999,
      taxPercentage: 18,
      currency: { code: 'INR', symbol: '₹' },
    });

    console.log('Creating coupons...');
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: '10% off for new customers',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 999,
        maxDiscountAmount: 500,
        usageLimit: 1000,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FLAT500',
        description: 'Flat ₹500 off',
        discountType: 'flat',
        discountValue: 500,
        minOrderAmount: 2999,
        usageLimit: 500,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Creating banners...');
    await Banner.insertMany([
      {
        title: 'Step Into Greatness',
        subtitle: 'New season drops from Nike, Adidas & more',
        type: 'hero_slider',
        image: {
          public_id: 'seed/banner-1',
          url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&q=80',
        },
        link: '/shop',
        buttonText: 'Shop Now',
        sortOrder: 0,
      },
      {
        title: 'Up to 40% Off Running',
        subtitle: 'Limited time offer on performance footwear',
        type: 'offer',
        image: {
          public_id: 'seed/banner-2',
          url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&q=80',
        },
        link: '/shop?subCategory=running',
        buttonText: 'Explore Deals',
        sortOrder: 1,
      },
    ]);

    console.log('\n✅ Seed completed successfully!');
    console.log('─────────────────────────────────');
    console.log(`Products: ${PRODUCT_COUNT} (with images: ${withImages})`);
    console.log(`Admin:    ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('Customer: customer@shoestore.com / Customer@123');
    console.log('─────────────────────────────────');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
