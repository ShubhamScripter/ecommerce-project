import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .settings()
      .then(({ data }) => {
        const s = data.data;
        setForm({
          websiteName: s.websiteName || '',
          whatsappNumber: s.whatsappNumber || '919876543210',
          email: s.contact?.email || '',
          phone: s.contact?.phone || '',
          address: s.contact?.address || '',
          facebook: s.socialLinks?.facebook || '',
          instagram: s.socialLinks?.instagram || '',
          twitter: s.socialLinks?.twitter || '',
          shippingCharges: s.shippingCharges ?? 49,
          freeShippingMinOrder: s.freeShippingMinOrder ?? 999,
          taxPercentage: s.taxPercentage ?? 18,
          currencyCode: s.currency?.code || 'INR',
          currencySymbol: s.currency?.symbol || '₹',
        });
      })
      .catch((e) => toast.error(getError(e)))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('websiteName', form.websiteName);
      fd.append('whatsappNumber', form.whatsappNumber);
      fd.append('shippingCharges', form.shippingCharges);
      fd.append('freeShippingMinOrder', form.freeShippingMinOrder);
      fd.append('taxPercentage', form.taxPercentage);
      fd.append(
        'contact',
        JSON.stringify({
          email: form.email,
          phone: form.phone,
          address: form.address,
        })
      );
      fd.append(
        'socialLinks',
        JSON.stringify({
          facebook: form.facebook,
          instagram: form.instagram,
          twitter: form.twitter,
        })
      );
      fd.append(
        'currency',
        JSON.stringify({
          code: form.currencyCode,
          symbol: form.currencySymbol,
        })
      );
      if (form.logo) fd.append('logo', form.logo);

      await adminApi.updateSettings(fd);
      toast.success('Settings updated');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <p className="text-muted">Loading...</p>;

  const input = (key, label, type = 'text') => (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="font-display text-2xl font-bold">Settings</h2>
      <form onSubmit={save} className="space-y-4 rounded-2xl bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {input('websiteName', 'Website Name')}
          {input('whatsappNumber', 'WhatsApp Number (with country code, e.g. 919876543210)')}
          {input('email', 'Contact Email', 'email')}
          {input('phone', 'Contact Phone')}
          {input('address', 'Address')}
          {input('shippingCharges', 'Shipping Charges', 'number')}
          {input('freeShippingMinOrder', 'Free Shipping Min Order', 'number')}
          {input('taxPercentage', 'Tax Percentage', 'number')}
          {input('currencyCode', 'Currency Code')}
          {input('currencySymbol', 'Currency Symbol')}
          {input('facebook', 'Facebook')}
          {input('instagram', 'Instagram')}
          {input('twitter', 'Twitter')}
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, logo: e.target.files[0] }))}
            className="text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
