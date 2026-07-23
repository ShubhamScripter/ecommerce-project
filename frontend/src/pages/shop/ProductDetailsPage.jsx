import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services';
import ProductCard from '../../components/product/ProductCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import WhatsAppOrderButton from '../../components/common/WhatsAppOrderButton';
import { PageSkeleton } from '../../components/common/Skeleton';
import {
  formatPrice,
  getDiscountPercent,
  getFinalPrice,
  getMediaUrl,
  getProductImage,
} from '../../utils/helpers';
import { useSettings } from '../../contexts/SettingsContext';
import { buildWhatsAppProductUrl, openWhatsApp } from '../../utils/whatsapp';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { settings } = useSettings();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setLoading(true);
    productService
      .getProduct(slug)
      .then(({ data: res }) => {
        setData(res.data);
        const p = res.data.product;
        setSelectedSize(p.sizes?.[0]?.size || '');
        setSelectedColor(p.colors?.[0]?.name || '');
        setActiveImage(0);
        setQuantity(1);
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageSkeleton />;
  if (!data?.product) {
    return (
      <div className="py-20 text-center">
        <p>Product not found</p>
        <Link to="/shop" className="mt-4 inline-block text-accent">
          Back to shop
        </Link>
      </div>
    );
  }

  const { product, similar, reviews } = data;
  const discount = getDiscountPercent(product.price, product.discountPrice);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch {
      // cancelled
    }
  };

  const handleWhatsApp = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    const url = buildWhatsAppProductUrl({
      phone: settings.whatsappNumber,
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
      productUrl: window.location.href,
    });
    if (!openWhatsApp(url)) {
      toast.error('WhatsApp number not configured');
      return;
    }
    toast.success('Opening WhatsApp...');
  };

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8 lg:px-6 safe-pb-float md:pb-8">
      <div className="overflow-x-auto">
        <Breadcrumb
          items={[
            { label: 'Shop', to: '/shop' },
            { label: product.name },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-3 sm:space-y-4">
          <div
            className="relative aspect-square overflow-hidden rounded-2xl bg-[#f3f3f3] sm:rounded-3xl dark:bg-ink-soft"
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) setZooming(true);
            }}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={onMouseMove}
          >
            <img
              src={getProductImage(product, activeImage)}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-200 sm:p-6"
              style={
                zooming
                  ? {
                      transform: 'scale(1.8)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
              }}
            />
          </div>
          <div className="scroll-x gap-2 sm:gap-3">
            {(product.images || []).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-20 ${
                  activeImage === i ? 'border-ink dark:border-white' : 'border-transparent'
                }`}
              >
                <img
                  src={getMediaUrl(img.url)}
                  alt=""
                  className="h-full w-full object-contain bg-[#f3f3f3] p-1 dark:bg-black/40"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-up">
          <p className="text-xs uppercase tracking-wider text-muted sm:text-sm">
            {product.brand?.name}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <RatingStars rating={product.ratings?.average || 0} />
            <span className="text-xs text-muted sm:text-sm">
              {product.ratings?.average?.toFixed(1)} ({product.ratings?.count} reviews)
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:mt-5 sm:gap-3">
            <span className="text-2xl font-semibold sm:text-3xl">
              {formatPrice(getFinalPrice(product))}
            </span>
            {product.discountPrice != null && (
              <>
                <span className="text-base text-muted line-through sm:text-lg">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-semibold text-accent sm:text-sm">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:mt-5 dark:text-white/70">
            {product.description}
          </p>

          <div className="mt-5 sm:mt-6">
            <p className="mb-2 text-sm font-medium">
              Color: <span className="text-muted">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(product.colors || []).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`rounded-xl border-2 px-3 py-2 text-xs sm:px-4 sm:text-sm ${
                    selectedColor === c.name
                      ? 'border-ink dark:border-white'
                      : 'border-line dark:border-white/10'
                  }`}
                >
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full border"
                    style={{ backgroundColor: c.hex || '#ccc' }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <p className="mb-2 text-sm font-medium">Size</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || []).map((s) => (
                <button
                  key={s.size}
                  type="button"
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  className={`h-10 w-10 rounded-xl text-sm font-medium disabled:opacity-30 sm:h-11 sm:w-11 ${
                    selectedSize === s.size
                      ? 'bg-ink text-white dark:bg-white dark:text-ink'
                      : 'bg-paper-dark dark:bg-white/10'
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <p className="mb-2 text-sm font-medium">Quantity</p>
            <div className="inline-flex items-center rounded-xl border border-line dark:border-white/10">
              <button
                type="button"
                className="p-3"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                type="button"
                className="p-3"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="mt-6 hidden gap-3 md:flex">
            <WhatsAppOrderButton
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              className="flex-1"
            />
            <Button size="lg" variant="outline" onClick={handleShare} aria-label="Share">
              <Share2 size={18} />
            </Button>
          </div>
          <p className="mt-2 hidden text-center text-xs text-muted md:block">
            Select size & color, then enquire on WhatsApp — no login needed
          </p>

          {product.features?.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 font-semibold">Features</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky WhatsApp CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur safe-bottom md:hidden dark:border-white/10 dark:bg-ink/95">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button variant="outline" onClick={handleShare} aria-label="Share">
            <Share2 size={16} />
          </Button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1ebe57]"
          >
            <MessageCircle size={18} />
            Enquire on WhatsApp
          </button>
        </div>
      </div>

      <section className="mt-12 sm:mt-16">
        <h2 className="font-display text-3xl sm:text-4xl">Reviews</h2>
        {reviews?.length ? (
          <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 dark:bg-ink-soft"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.user?.name}</p>
                  <RatingStars rating={r.rating} size={12} />
                </div>
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No reviews yet.</p>
        )}
      </section>

      {similar?.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <h2 className="mb-4 font-display text-3xl sm:mb-6 sm:text-4xl">Similar Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
