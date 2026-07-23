import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function CategoriesPage() {
  const [tree, setTree] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    adminApi
      .categoryTree()
      .then(({ data }) => setTree(data.data || []))
      .catch((e) => toast.error(getError(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.description) fd.append('description', form.description);
      if (form.parent) fd.append('parent', form.parent);
      fd.append('isActive', form.isActive ? 'true' : 'false');
      if (form.image) fd.append('image', form.image);

      if (form._id) await adminApi.updateCategory(form._id, fd);
      else await adminApi.createCategory(fd);

      toast.success('Category saved');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Categories</h2>
        <button
          onClick={() =>
            setForm({ name: '', description: '', parent: '', isActive: true })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          />
          <select
            value={form.parent || ''}
            onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm"
          >
            <option value="">Main Category</option>
            {tree.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Description"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-xl border border-border px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] }))}
            className="text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-white">
              Save
            </button>
            <button type="button" onClick={() => setForm(null)} className="rounded-xl border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          tree.map((cat) => (
            <div key={cat._id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-muted">{cat.subCategories?.length || 0} sub-categories</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setForm({
                        _id: cat._id,
                        name: cat.name,
                        description: cat.description || '',
                        parent: '',
                        isActive: cat.isActive,
                      })
                    }
                    className="rounded-lg p-2 hover:bg-surface"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(cat._id)} className="rounded-lg p-2 text-danger hover:bg-rose-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {cat.subCategories?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat.subCategories.map((sub) => (
                    <span
                      key={sub._id}
                      className="group inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-sm"
                    >
                      {sub.name}
                      <button
                        onClick={() =>
                          setForm({
                            _id: sub._id,
                            name: sub.name,
                            description: sub.description || '',
                            parent: cat._id,
                            isActive: sub.isActive,
                          })
                        }
                        className="opacity-50 hover:opacity-100"
                      >
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => remove(sub._id)} className="text-danger opacity-50 hover:opacity-100">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
