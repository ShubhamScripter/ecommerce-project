import { formatPrice, getFinalPrice } from './helpers';

/** Normalize phone to digits only (WhatsApp wa.me format) */
export const normalizeWhatsAppNumber = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
};

/**
 * Build WhatsApp chat URL with pre-filled product enquiry message.
 */
export const buildWhatsAppProductUrl = ({
  phone,
  product,
  size,
  color,
  quantity = 1,
  productUrl,
}) => {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;

  const price = formatPrice(getFinalPrice(product));
  const lines = [
    '*Product Enquiry — Stride Shoes*',
    '',
    `*Product:* ${product.name}`,
    product.brand?.name ? `*Brand:* ${product.brand.name}` : null,
    `*Price:* ${price}`,
    size ? `*Size:* ${size}` : null,
    color ? `*Color:* ${color}` : null,
    `*Quantity:* ${quantity}`,
    product.sku ? `*SKU:* ${product.sku}` : null,
    productUrl ? `*Link:* ${productUrl}` : null,
    '',
    'I am interested in this product. Please share availability and next steps.',
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${number}?text=${text}`;
};

export const buildWhatsAppSupportUrl = (phone, message = 'Hi! I want to know more about your shoes collection.') => {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const openWhatsApp = (url) => {
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};
