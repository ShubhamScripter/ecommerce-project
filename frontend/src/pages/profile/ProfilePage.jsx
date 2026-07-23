import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, MapPin, Package, User as UserIcon, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import ProductCard from '../../components/product/ProductCard';
import { PageSkeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { orderService, profileService } from '../../services';
import { formatPrice, getErrorMessage, getProductImage } from '../../utils/helpers';

const TABS = [
  { id: 'info', label: 'Profile', icon: UserIcon },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'info';
  const { user, logout, setUser } = useAuth();
  const { wishlist, fetchWishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 'orders') {
          const { data } = await orderService.getAll();
          setOrders(data.data || []);
        } else if (tab === 'wishlist') {
          await fetchWishlist();
        } else if (tab === 'addresses') {
          const { data } = await profileService.getAddresses();
          setAddresses(data.data || []);
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await profileService.update(profileForm);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (addressForm._id) {
        await profileService.updateAddress(addressForm._id, addressForm);
      } else {
        await profileService.createAddress(addressForm);
      }
      const { data } = await profileService.getAddresses();
      setAddresses(data.data || []);
      setAddressForm(null);
      toast.success('Address saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await profileService.deleteAddress(id);
      setAddresses((a) => a.filter((x) => x._id !== id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-6 safe-pb-float md:pb-8">
      <Breadcrumb items={[{ label: 'Profile' }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 sm:mt-4 sm:gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Profile</h1>
          <p className="mt-1 text-sm text-muted">Manage your account</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:mt-8 sm:gap-8 lg:flex-row">
        <aside className="scroll-x gap-2 pb-1 lg:flex lg:w-52 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSearchParams({ tab: t.id })}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'bg-paper-dark dark:bg-white/10'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </aside>

        <div className="min-w-0 flex-1 rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-ink-soft">
          {loading && tab !== 'info' ? (
            <PageSkeleton />
          ) : tab === 'info' ? (
            <form onSubmit={saveProfile} className="max-w-md space-y-4">
              <Input
                label="Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </form>
          ) : tab === 'orders' ? (
            orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Your order history will appear here."
                actionLabel="Start Shopping"
                actionTo="/shop"
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-xl border border-line p-4 dark:border-white/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-lg bg-paper-dark px-2 py-1 text-xs capitalize dark:bg-white/10">
                          {order.status.replace('_', ' ')}
                        </span>
                        <p className="mt-1 font-semibold">{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {order.items.map((item, i) => (
                        <img
                          key={i}
                          src={item.image || getProductImage({ images: [{ url: item.image }] })}
                          alt={item.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'wishlist' ? (
            wishlist.length === 0 ? (
              <EmptyState
                title="Wishlist is empty"
                description="Save items you love for later."
                actionLabel="Browse Shop"
                actionTo="/shop"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {wishlist.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )
          ) : (
            <div>
              <div className="mb-4 flex justify-between">
                <h3 className="font-semibold">Saved Addresses</h3>
                <Button
                  size="sm"
                  onClick={() =>
                    setAddressForm({
                      fullName: '',
                      phone: '',
                      addressLine1: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India',
                      label: 'home',
                    })
                  }
                >
                  Add Address
                </Button>
              </div>

              {addressForm && (
                <form onSubmit={saveAddress} className="mb-6 grid gap-3 sm:grid-cols-2 rounded-xl border border-line p-4 dark:border-white/10">
                  {['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'].map((key) => (
                    <Input
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1')}
                      required={key !== 'addressLine2'}
                      value={addressForm[key] || ''}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  ))}
                  <div className="sm:col-span-2 flex gap-2">
                    <Button type="submit" loading={saving}>
                      Save
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setAddressForm(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <EmptyState title="No addresses" description="Add a shipping address." />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="flex justify-between gap-4 rounded-xl border border-line p-4 dark:border-white/10"
                    >
                      <div className="text-sm">
                        <p className="font-medium">
                          {addr.fullName} · {addr.phone}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs text-accent">Default</span>
                          )}
                        </p>
                        <p className="mt-1 text-muted">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-sm text-muted hover:text-ink"
                          onClick={() => setAddressForm(addr)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm text-accent-dark"
                          onClick={() => deleteAddress(addr._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
