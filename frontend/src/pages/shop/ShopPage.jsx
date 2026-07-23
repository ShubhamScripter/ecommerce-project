import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../../services';
import ProductCard from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Popular' },
  { value: 'best_rated', label: 'Best Rated' },
];

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Navy', 'Grey', 'Brown', 'Pink', 'Green'];
const SIZES = ['6', '7', '8', '9', '10', '11', '12'];

function FilterPanel({
  filters,
  categories,
  brands,
  updateFilter,
  clearFilters,
}) {
  const subCategories = categories.flatMap((cat) =>
    (cat.subCategories || []).map((sub) => ({
      ...sub,
      parentName: cat.name,
    }))
  );

  const chipClass = (active) =>
    `rounded-lg px-3 py-1.5 text-sm capitalize transition ${
      active
        ? 'bg-ink text-white dark:bg-white dark:text-ink'
        : 'bg-paper-dark text-ink hover:bg-line dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
    }`;

  const listBtnClass = (active) =>
    `block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
      active
        ? 'bg-ink font-medium text-white dark:bg-white dark:text-ink'
        : 'text-ink/80 hover:bg-paper-dark dark:text-white/80 dark:hover:bg-white/10'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/10">
        <h3 className="text-base font-semibold">Filters</h3>
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-accent hover:underline"
        >
          Clear all
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Gender
        </h4>
        <div className="flex flex-wrap gap-2">
          {['men', 'women', 'unisex', 'kids'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateFilter('gender', filters.gender === g ? '' : g)}
              className={chipClass(filters.gender === g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Category
        </h4>
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() =>
                updateFilter('category', filters.category === cat._id ? '' : cat._id)
              }
              className={listBtnClass(filters.category === cat._id)}
            >
              {cat.name}
            </button>
          ))}
          {subCategories.length > 0 && (
            <>
              <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Types
              </p>
              {subCategories.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() =>
                    updateFilter(
                      'subCategory',
                      filters.subCategory === sub._id ? '' : sub._id
                    )
                  }
                  className={listBtnClass(filters.subCategory === sub._id)}
                >
                  {sub.name}
                </button>
              ))}
            </>
          )}
          {categories.length === 0 && (
            <p className="px-3 text-sm text-muted">No categories</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Brand
        </h4>
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {brands.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => updateFilter('brand', filters.brand === b._id ? '' : b._id)}
              className={listBtnClass(filters.brand === b._id)}
            >
              {b.name}
            </button>
          ))}
          {brands.length === 0 && (
            <p className="px-3 text-sm text-muted">No brands</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateFilter('color', filters.color === c ? '' : c)}
              className={chipClass(filters.color === c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateFilter('size', filters.size === s ? '' : s)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                filters.size === s
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'bg-paper-dark dark:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Price
        </h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink dark:border-white/10 dark:bg-ink-soft"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink dark:border-white/10 dark:bg-ink-soft"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Rating
        </h4>
        <div className="flex flex-wrap gap-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                updateFilter('rating', filters.rating === String(r) ? '' : String(r))
              }
              className={chipClass(filters.rating === String(r))}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Availability
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'in_stock', label: 'In Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' },
          ].map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() =>
                updateFilter(
                  'availability',
                  filters.availability === a.value ? '' : a.value
                )
              }
              className={chipClass(filters.availability === a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    brand: searchParams.get('brand') || '',
    gender: searchParams.get('gender') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    availability: searchParams.get('availability') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    bestSeller: searchParams.get('bestSeller') || '',
    newArrival: searchParams.get('newArrival') || '',
    page: searchParams.get('page') || '1',
  };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  useEffect(() => {
    Promise.all([productService.getCategories(), productService.getBrands()])
      .then(([cats, brs]) => {
        setCategories(cats.data.data || []);
        setBrands(brs.data.data || []);
      })
      .catch(() => {
        setCategories([]);
        setBrands([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    );
    productService
      .getProducts(params)
      .then(({ data }) => {
        setProducts(data.data || []);
        setMeta(data.meta);
      })
      .catch(() => {
        setProducts([]);
        setMeta(null);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const filterProps = {
    filters,
    categories,
    brands,
    updateFilter,
    clearFilters,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <Breadcrumb items={[{ label: 'Shop' }]} />

      <div className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Shop</h1>
          <p className="mt-1 text-sm text-muted">
            {meta ? `${meta.total} products` : 'Browse our collection'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="w-44 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink dark:border-white/10 dark:bg-ink-soft sm:w-56"
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium shadow-sm md:hidden dark:border-white/10 dark:bg-ink-soft"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter size={16} />
            Filters
          </button>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted" />
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-soft"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {/* Desktop / tablet sidebar */}
        <aside className="hidden w-full shrink-0 md:block md:w-64 lg:w-72">
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-soft">
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <ProductCardSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              actionLabel="Clear Filters"
              actionTo="/shop"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination
                meta={meta}
                onPageChange={(page) => updateFilter('page', String(page))}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl animate-fade-up dark:bg-ink">
            <div className="flex items-center justify-between border-b border-line px-4 py-4 dark:border-white/10">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 hover:bg-paper-dark dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel {...filterProps} />
            </div>
            <div className="border-t border-line p-4 dark:border-white/10">
              <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
