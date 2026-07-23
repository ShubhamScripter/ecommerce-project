import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';
import { getMediaUrl } from '../../utils/media';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  brand: '',
  category: '',
  subCategory: '',
  sku: '',
  price: '',
  discountPrice: '',
  stock: '',
  gender: 'unisex',
  material: '',
  weight: '',
  features: '',
  colors: '[{"name":"Black","hex":"#111111"}]',
  sizes: '[{"size":"8","stock":10},{"size":"9","stock":10},{"size":"10","stock":10}]',
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isActive: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    Promise.all([
      adminApi.brands({ limit: 100 }),
      adminApi.categoryTree(),
    ]).then(([b, c]) => {
      setBrands(b.data.data || []);
      setCategories(c.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminApi.product(id).then(({ data }) => {
      const p = data.data;
      setForm({
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        brand: p.brand?._id || p.brand || '',
        category: p.category?._id || p.category || '',
        subCategory: p.subCategory?._id || p.subCategory || '',
        sku: p.sku || '',
        price: p.price ?? '',
        discountPrice: p.discountPrice ?? '',
        stock: p.stock ?? '',
        gender: p.gender || 'unisex',
        material: p.material || '',
        weight: p.weight ?? '',
        features: (p.features || []).join('\n'),
        colors: JSON.stringify(p.colors || [], null, 0),
        sizes: JSON.stringify(p.sizes || [], null, 0),
        isFeatured: !!p.isFeatured,
        isBestSeller: !!p.isBestSeller,
        isNewArrival: !!p.isNewArrival,
        isActive: p.isActive !== false,
      });
      setExistingImages(p.images || []);
      const cat = p.category?._id || p.category;
      if (cat) {
        adminApi.categories({ parent: cat, limit: 100 }).then(({ data: d }) => {
          setSubCategories(d.data || []);
        });
      }
    });
  }, [id, isEdit]);

  useEffect(() => {
    if (!form.category) {
      setSubCategories([]);
      return;
    }
    adminApi.categories({ parent: form.category, limit: 100 }).then(({ data }) => {
      setSubCategories(data.data || []);
    });
  }, [form.category]);

  const onFiles = (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    setImages((prev) => [...prev, ...list].slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'features') {
          fd.append(
            'features',
            JSON.stringify(
              String(val)
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          );
        } else if (typeof val === 'boolean') {
          fd.append(key, val ? 'true' : 'false');
        } else if (val !== '' && val != null) {
          fd.append(key, val);
        }
      });
      images.forEach((file) => fd.append('images', file));

      if (isEdit) {
        await adminApi.updateProduct(id, fd);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(fd);
        toast.success('Product created');
      }
      navigate('/products');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await adminApi.deleteProductImage(id, imageId);
      setExistingImages((imgs) => imgs.filter((i) => i._id !== imageId));
      toast.success('Image deleted');
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const moveImage = async (from, to) => {
    if (to < 0 || to >= existingImages.length) return;
    const next = [...existingImages];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setExistingImages(next);
    try {
      await adminApi.reorderImages(
        id,
        next.map((i) => i._id)
      );
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const field = (key, label, props = {}) => (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={form[key]}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: props.type === 'checkbox' ? e.target.checked : e.target.value,
          }))
        }
        className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
        {...props}
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'Product Name', { required: true })}
          {field('slug', 'Slug (optional)')}
          {field('sku', 'SKU', { required: true })}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Brand</span>
            <select
              required
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Category</span>
            <select
              required
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value, subCategory: '' }))
              }
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Sub Category</span>
            <select
              value={form.subCategory}
              onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              <option value="">None</option>
              {subCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {field('price', 'Price', { type: 'number', required: true, min: 0 })}
          {field('discountPrice', 'Discount Price', { type: 'number', min: 0 })}
          {field('stock', 'Stock', { type: 'number', required: true, min: 0 })}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              {['men', 'women', 'unisex', 'kids'].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          {field('material', 'Material')}
          {field('weight', 'Weight (kg)', { type: 'number', min: 0, step: 0.01 })}
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Features (one per line)</span>
          <textarea
            rows={3}
            value={form.features}
            onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Colors (JSON)</span>
            <textarea
              rows={3}
              value={form.colors}
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
              className="w-full rounded-xl border border-border px-3 py-2.5 font-mono text-xs"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Sizes (JSON)</span>
            <textarea
              rows={3}
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              className="w-full rounded-xl border border-border px-3 py-2.5 font-mono text-xs"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          {[
            ['isFeatured', 'Featured'],
            ['isBestSeller', 'Best Seller'],
            ['isNewArrival', 'New Arrival'],
            ['isActive', 'Active'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Images */}
        <div>
          <p className="mb-2 text-sm font-medium">Product Images</p>
          {isEdit && existingImages.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {existingImages.map((img, index) => (
                <div key={img._id} className="relative">
                  <img
                    src={getMediaUrl(img.url)}
                    alt=""
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 rounded-b-xl bg-black/50 p-1">
                    <button type="button" onClick={() => moveImage(index, index - 1)}>
                      <GripVertical size={12} className="text-white" />
                    </button>
                    <button type="button" onClick={() => deleteImage(img._id)}>
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
              dragOver ? 'border-accent bg-blue-50' : 'border-border'
            }`}
          >
            <Upload size={24} className="text-muted" />
            <p className="mt-2 text-sm text-muted">Drag & drop images or</p>
            <label className="mt-2 cursor-pointer text-sm font-medium text-accent">
              Browse files
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((file, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                    className="absolute -right-1 -top-1 rounded-full bg-danger p-0.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-xl border border-border px-6 py-2.5 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
