import { useEffect, useState } from 'react';
import { Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

const STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () =>
    adminApi
      .orders({ search, status, limit: 20 })
      .then(({ data }) => setOrders(data.data || []))
      .catch((e) => toast.error(getError(e)));

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, status]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await adminApi.updateOrderStatus(id, { status: newStatus });
      toast.success('Status updated');
      setSelected(data.data);
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const { data } = await adminApi.invoice(id);
      const inv = data.data;
      const w = window.open('', '_blank');
      w.document.write(`
        <html><head><title>${inv.invoiceNumber}</title>
        <style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}</style></head>
        <body>
          <h1>Invoice ${inv.invoiceNumber}</h1>
          <p>Order: ${inv.order.orderNumber}</p>
          <p>Customer: ${inv.order.shippingAddress.fullName}</p>
          <p>Date: ${new Date(inv.order.createdAt).toLocaleString()}</p>
          <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          ${inv.order.items
            .map(
              (i) =>
                `<tr><td>${i.name} (${i.size}/${i.color})</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`
            )
            .join('')}
          </table>
          <h3>Total: ₹${inv.order.totalAmount}</h3>
        </body></html>
      `);
      w.document.close();
      w.print();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Orders</h2>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border/50">
                <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.user?.name || o.shippingAddress?.fullName}</td>
                <td className="px-4 py-3">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="rounded-lg border border-border px-2 py-1 text-xs capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(o)}
                      className="text-xs text-accent hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadInvoice(o._id)}
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary"
                    >
                      <Download size={12} /> Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="font-semibold">{selected.orderNumber}</h3>
            <p className="mt-1 text-sm text-muted capitalize">Status: {selected.status}</p>
            <div className="mt-4 space-y-2 text-sm">
              {selected.items?.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-semibold">Total: ₹{selected.totalAmount}</p>
            <p className="mt-2 text-sm text-muted">
              {selected.shippingAddress?.fullName}, {selected.shippingAddress?.city}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 rounded-xl border px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
