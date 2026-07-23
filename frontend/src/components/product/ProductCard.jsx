import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import RatingStars from '../common/RatingStars';
import {
  formatPrice,
  getDiscountPercent,
  getFinalPrice,
  getProductImage,
} from '../../utils/helpers';
import { useSettings } from '../../contexts/SettingsContext';
import { buildWhatsAppProductUrl, openWhatsApp } from '../../utils/whatsapp';

export default function ProductCard({ product }) {
  const { settings } = useSettings();
  const discount = getDiscountPercent(product.price, product.discountPrice);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0]?.size || '';
    const color = product.colors?.[0]?.name || '';
    const url = buildWhatsAppProductUrl({
      phone: settings.whatsappNumber,
      product,
      size,
      color,
      quantity: 1,
      productUrl: `${window.location.origin}/product/${product.slug}`,
    });
    if (!openWhatsApp(url)) {
      toast.error('WhatsApp number not configured');
      return;
    }
    toast.success('Opening WhatsApp...');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block animate-fade-up">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 group-hover:shadow-md sm:rounded-2xl dark:bg-ink-soft">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3] dark:bg-black/40">
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.03] sm:p-3"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
            }}
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:rounded-lg sm:px-2 sm:py-1 sm:text-xs">
              -{discount}%
            </span>
          )}

          <button
            type="button"
            onClick={handleWhatsApp}
            className="absolute bottom-2 right-2 rounded-full bg-[#25D366] p-2 text-white shadow-lg transition hover:scale-110 sm:bottom-3 sm:right-3 sm:p-2.5 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            aria-label="Enquire on WhatsApp"
            title="Enquire on WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>
        <div className="space-y-1 p-2.5 sm:space-y-1.5 sm:p-3.5">
          {product.brand?.name && (
            <p className="text-[10px] uppercase tracking-wider text-muted sm:text-xs">
              {product.brand.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-xs font-medium leading-snug sm:text-sm">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <RatingStars rating={product.ratings?.average || 0} size={10} />
            <span className="text-[10px] text-muted sm:text-xs">
              ({product.ratings?.count || 0})
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5 sm:gap-2">
            <span className="text-sm font-semibold sm:text-base">
              {formatPrice(getFinalPrice(product))}
            </span>
            {product.discountPrice != null && (
              <span className="text-xs text-muted line-through sm:text-sm">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
