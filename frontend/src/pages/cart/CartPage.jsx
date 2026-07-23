import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { PageSkeleton } from '../../components/common/Skeleton';
import { useCart } from '../../contexts/CartContext';
import { formatPrice, getProductImage } from '../../utils/helpers';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  if (loading) return <PageSkeleton />;

  if (!cart?.items?.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const discount = cart.discountAmount || 0;
  const total = Math.max(0, subtotal - discount);

  const handleCoupon = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch {
      // handled
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-6 safe-pb-float md:pb-8">
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <h1 className="mt-3 font-display text-4xl sm:mt-4 sm:text-5xl">Cart</h1>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-3 sm:space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm sm:gap-4 sm:p-4 dark:bg-ink-soft"
            >
              <Link to={`/product/${item.product?.slug}`} className="shrink-0">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product?.name}
                  className="h-20 w-20 rounded-xl object-cover sm:h-28 sm:w-28"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.product?.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:underline sm:text-base"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      Size: {item.size} · Color: {item.color}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="shrink-0 self-start p-1 text-muted hover:text-accent-dark"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <div className="inline-flex items-center rounded-lg border border-line dark:border-white/10">
                    <button
                      type="button"
                      className="p-2"
                      onClick={() =>
                        item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-2"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold sm:text-base">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-ink-soft lg:sticky lg:top-24">
          <h3 className="text-lg font-semibold">Order Summary</h3>

          <form onSubmit={handleCoupon} className="mt-4 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full rounded-xl border border-line bg-transparent py-2.5 pl-9 pr-3 text-sm dark:border-white/10"
              />
            </div>
            <Button type="submit" variant="outline" loading={applying}>
              Apply
            </Button>
          </form>

          {cart.coupon && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
              <span className="truncate">
                Coupon applied{cart.coupon.code ? `: ${cart.coupon.code}` : ''}
              </span>
              <button type="button" onClick={removeCoupon} className="ml-2 shrink-0 underline">
                Remove
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold dark:border-white/10">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted">Shipping & tax calculated at checkout</p>
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-muted hover:text-ink dark:hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
