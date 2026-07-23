import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(null);

  const load = () =>
    adminApi
      .brands({ limit: 100 })
      .then(({ data }) => setBrands(data.data || []))
      .catch((e) => toast.error(getError(e)));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.description) fd.append('description', form.description);
      if (form.website) fd.append('website', form.website);
      fd.append('isActive', form.isActive ? 'true' : 'false');
      if (form.logo) fd.append('logo', form.logo);

      if (form._id) await adminApi.updateBrand(form._id, fd);
      else await adminApi.createBrand(fd);

      toast.success('Brand saved');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete brand?')) return;
    try {
      await adminApi.deleteBrand(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Brands</h2>
        <button
          onClick={() => setForm({ name: '', description: '', website: '', isActive: true })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-2">
          <input
            required
            placeholder="Brand name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Website"
            value={form.website || ''}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <input
            placeholder="Description"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm sm:col-span-2"
          />
          <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, logo: e.target.files[0] }))} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Save</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b._id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {b.logo?.url ? (
                <img src={b.logo.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface font-bold">
                  {b.name[0]}
                </div>
              )}
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted">{b.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setForm({
                    _id: b._id,
                    name: b.name,
                    description: b.description || '',
                    website: b.website || '',
                    isActive: b.isActive,
                  })
                }
                className="rounded-lg p-2 hover:bg-surface"
              >
                <Pencil size={14} />
              </button>
              <button onClick={() => remove(b._id)} className="rounded-lg p-2 text-danger hover:bg-rose-50">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
