import { useEffect, useState } from 'react';
import { Plus, Trash2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(null);

  const load = () =>
    adminApi
      .banners({ limit: 50 })
      .then(({ data }) => setBanners(data.data || []))
      .catch((e) => toast.error(getError(e)));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.subtitle) fd.append('subtitle', form.subtitle);
      fd.append('type', form.type);
      if (form.link) fd.append('link', form.link);
      if (form.buttonText) fd.append('buttonText', form.buttonText);
      fd.append('isActive', form.isActive ? 'true' : 'false');
      if (form.startDate) fd.append('startDate', form.startDate);
      if (form.endDate) fd.append('endDate', form.endDate);
      if (form.image) fd.append('image', form.image);

      if (form._id) await adminApi.updateBanner(form._id, fd);
      else {
        if (!form.image) {
          toast.error('Image is required');
          return;
        }
        await adminApi.createBanner(fd);
      }
      toast.success('Banner saved');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const toggle = async (id) => {
    try {
      await adminApi.toggleBanner(id);
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete banner?')) return;
    try {
      await adminApi.deleteBanner(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Banners</h2>
        <button
          onClick={() =>
            setForm({
              title: '',
              subtitle: '',
              type: 'hero_slider',
              link: '/shop',
              buttonText: 'Shop Now',
              isActive: true,
              startDate: '',
              endDate: '',
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          >
            {['homepage', 'offer', 'festival', 'hero_slider'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            placeholder="Subtitle"
            value={form.subtitle || ''}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Link"
            value={form.link || ''}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Button text"
            value={form.buttonText || ''}
            onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={form.startDate || ''}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={form.endDate || ''}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] }))}
            className="text-sm sm:col-span-2"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <div key={b._id} className="overflow-hidden rounded-2xl bg-card shadow-sm">
            <img src={b.image?.url} alt={b.title} className="h-40 w-full object-cover" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-xs capitalize text-muted">
                  {b.type} · {b.isActive ? 'Active' : 'Disabled'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(b._id)} className="rounded-lg p-2 hover:bg-surface">
                  <Power size={14} />
                </button>
                <button onClick={() => remove(b._id)} className="rounded-lg p-2 text-danger hover:bg-rose-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
