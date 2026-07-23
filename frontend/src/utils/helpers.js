export const formatPrice = (amount, symbol = '₹') => {
  if (amount == null) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
};

export const getDiscountPercent = (price, discountPrice) => {
  if (!discountPrice || !price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const getFinalPrice = (product) =>
  product.discountPrice != null ? product.discountPrice : product.price;

/** Resolve relative /uploads paths against API host */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
};

export const getProductImage = (product, index = 0) =>
  getMediaUrl(product?.images?.[index]?.url) ||
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
