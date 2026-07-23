import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(null);

  const load = () =>
    adminApi
      .coupons({ limit: 50 })
      .then(({ data }) => setCoupons(data.data || []))
      .catch((e) => toast.error(getError(e)));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      };
      if (form._id) await adminApi.updateCoupon(form._id, payload);
      else await adminApi.createCoupon(payload);
      toast.success('Coupon saved');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Coupons</h2>
        <button
          onClick={() =>
            setForm({
              code: '',
              discountType: 'percentage',
              discountValue: '',
              minOrderAmount: 0,
              usageLimit: '',
              expiryDate: '',
              isActive: true,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-2">
          <input
            required
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <select
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
          <input
            required
            type="number"
            placeholder="Discount value"
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Min order"
            value={form.minOrderAmount}
            onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Usage limit"
            value={form.usageLimit}
            onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            required
            type="date"
            value={form.expiryDate?.slice?.(0, 10) || form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-border/50">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3 capitalize">{c.discountType}</td>
                <td className="px-4 py-3">
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-4 py-3">
                  {c.usedCount}/{c.usageLimit || '∞'}
                </td>
                <td className="px-4 py-3">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(c._id)} className="text-danger">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
