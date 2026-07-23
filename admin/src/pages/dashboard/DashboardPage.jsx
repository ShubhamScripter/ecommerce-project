import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Tags,
  Star,
} from 'lucide-react';
import { adminApi } from '../../services';
import { getError } from '../../services/api';
import toast from 'react-hot-toast';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(({ data }) => setStats(data.data))
      .catch((e) => toast.error(getError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  }

  const cards = [
    { label: 'Total Revenue', value: formatINR(stats?.totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Users', value: stats?.totalUsers, icon: Users, color: 'bg-violet-50 text-violet-600' },
    { label: 'Products', value: stats?.totalProducts, icon: Package, color: 'bg-amber-50 text-amber-600' },
    { label: 'Categories', value: stats?.totalCategories, icon: Tags, color: 'bg-rose-50 text-rose-600' },
    { label: 'Pending Reviews', value: stats?.pendingReviews, icon: Star, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted">Store overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{c.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{c.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${c.color}`}>
                <c.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Link to="/orders" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((o) => (
                <tr key={o._id} className="border-b border-border/60">
                  <td className="py-3 font-medium">{o.orderNumber}</td>
                  <td className="py-3">{o.user?.name || '—'}</td>
                  <td className="py-3">{formatINR(o.totalAmount)}</td>
                  <td className="py-3">
                    <span className="rounded-lg bg-surface px-2 py-1 text-xs capitalize">
                      {o.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
