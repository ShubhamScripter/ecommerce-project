import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { PageSkeleton } from '../../components/common/Skeleton';
import { useCart } from '../../contexts/CartContext';
import { orderService, profileService, productService } from '../../services';
import { formatPrice, getErrorMessage } from '../../utils/helpers';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    label: 'home',
  });

  useEffect(() => {
    Promise.all([profileService.getAddresses(), productService.getSettings()])
      .then(([addr, sett]) => {
        const list = addr.data.data || [];
        setAddresses(list);
        setSettings(sett.data.data);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddress(def._id);
        if (!list.length) setShowNewAddress(true);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading || cartLoading) return <PageSkeleton />;

  if (!cart?.items?.length) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.subtotal || 0;
  const discount = cart.discountAmount || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const freeMin = settings?.freeShippingMinOrder ?? 999;
  const shipping =
    afterDiscount >= freeMin ? 0 : settings?.shippingCharges ?? 49;
  const tax = (afterDiscount * (settings?.taxPercentage ?? 18)) / 100;
  const total = afterDiscount + shipping + tax;

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      let payload = { paymentMethod };

      if (showNewAddress || !selectedAddress) {
        const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
        for (const field of required) {
          if (!newAddress[field]) {
            toast.error('Please fill all address fields');
            setSubmitting(false);
            return;
          }
        }
        const { data } = await profileService.createAddress(newAddress);
        payload.addressId = data.data._id;
      } else {
        payload.addressId = selectedAddress;
      }

      const { data } = await orderService.create(payload);
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate(`/profile?tab=orders&order=${data.data._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-6 safe-pb-float md:pb-8">
      <Breadcrumb items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mt-3 font-display text-4xl sm:mt-4 sm:text-5xl">Checkout</h1>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-5 sm:space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-ink-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              {addresses.length > 0 && (
                <button
                  className="text-sm text-accent"
                  onClick={() => setShowNewAddress(!showNewAddress)}
                >
                  {showNewAddress ? 'Use saved' : 'Add new'}
                </button>
              )}
            </div>

            {!showNewAddress && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                      selectedAddress === addr._id
                        ? 'border-ink dark:border-white'
                        : 'border-line dark:border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {addr.fullName} · {addr.phone}
                      </p>
                      <p className="mt-1 text-muted">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city},{' '}
                        {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries({
                  fullName: 'Full Name',
                  phone: 'Phone',
                  addressLine1: 'Address Line 1',
                  addressLine2: 'Address Line 2',
                  city: 'City',
                  state: 'State',
                  postalCode: 'Postal Code',
                }).map(([key, label]) => (
                  <Input
                    key={key}
                    label={label}
                    value={newAddress[key]}
                    onChange={(e) =>
                      setNewAddress((a) => ({ ...a, [key]: e.target.value }))
                    }
                    className={key.startsWith('address') ? 'sm:col-span-2' : ''}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-ink-soft">
            <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'upi', label: 'UPI' },
                { value: 'card', label: 'Card' },
                { value: 'netbanking', label: 'Net Banking' },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    paymentMethod === m.value
                      ? 'border-ink dark:border-white'
                      : 'border-line dark:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-ink-soft lg:sticky lg:top-24">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="mt-4 max-h-48 space-y-2 overflow-auto text-sm">
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between gap-2">
                <span className="text-muted">
                  {item.product?.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm dark:border-white/10">
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
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tax ({settings?.taxPercentage ?? 18}%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold dark:border-white/10">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            size="lg"
            loading={submitting}
            onClick={handlePlaceOrder}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
