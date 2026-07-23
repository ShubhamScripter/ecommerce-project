import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../services';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import RatingStars from '../components/common/RatingStars';
import toast from 'react-hot-toast';

function HeroSlider({ banners }) {
  const [index, setIndex] = useState(0);
  const slides = banners?.length
    ? banners
    : [
        {
          title: 'Step Into Greatness',
          subtitle: 'Premium footwear engineered for every stride',
          image: { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&q=80' },
          link: '/shop',
          buttonText: 'Shop Now',
        },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[70vh] sm:min-h-[480px] md:h-[82vh]">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={s.mobileImage?.url || s.image?.url}
            alt={s.title}
            className="h-full w-full object-cover object-center md:hidden"
          />
          <img
            src={s.image?.url || s.mobileImage?.url}
            alt={s.title}
            className="hidden h-full w-full object-cover object-center md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 md:bg-gradient-to-r md:from-black/75 md:via-black/40 md:to-transparent" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:pb-16 lg:px-6 lg:pb-24">
        <p className="font-display text-5xl leading-none text-white sm:text-7xl md:text-8xl lg:text-9xl animate-fade-up">
          STRIDE
        </p>
        <h1
          className="mt-2 max-w-xl text-xl font-medium text-white/95 sm:text-2xl md:text-3xl animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          {slide.title}
        </h1>
        <p
          className="mt-2 max-w-md text-sm text-white/70 sm:mt-3 sm:text-base animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          {slide.subtitle}
        </p>
        <div
          className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Link to={slide.link || '/shop'} className="w-full sm:w-auto">
            <Button size="lg" variant="accent" className="w-full sm:w-auto">
              {slide.buttonText || 'Shop Now'}
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/shop?newArrival=true" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/40 text-white hover:bg-white hover:text-ink sm:w-auto"
            >
              New Arrivals
            </Button>
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/40 sm:left-4 sm:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/40 sm:right-4 sm:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-white sm:w-8' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SectionHeader({ title, subtitle, to }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8 sm:gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="flex shrink-0 items-center gap-1 text-xs font-medium hover:text-accent sm:text-sm"
        >
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function ProductGrid({ products, loading }) {
  if (loading) return <ProductCardSkeleton />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    productService
      .getHome()
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load home data'))
      .finally(() => setLoading(false));
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  return (
    <div className="safe-pb-float md:pb-0">
      <HeroSlider banners={data?.banners} />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-16 sm:py-14 lg:space-y-20 lg:px-6 lg:py-16">
        <section>
          <SectionHeader title="Featured" subtitle="Handpicked for you" to="/shop?featured=true" />
          <ProductGrid products={data?.featured || []} loading={loading} />
        </section>

        <section>
          <SectionHeader title="Categories" subtitle="Find your style" />
          <div className="scroll-x pb-1 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-6 sm:pb-0">
            {(data?.categories || []).map((cat, i) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat._id}`}
                className="group w-[42vw] rounded-2xl bg-paper-dark p-5 text-center transition hover:bg-ink hover:text-white sm:w-auto dark:bg-ink-soft dark:hover:bg-white dark:hover:text-ink animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <p className="font-display text-xl sm:text-2xl">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh drops this week"
            to="/shop?newArrival=true"
          />
          <ProductGrid products={data?.newArrivals || []} loading={loading} />
        </section>

        <section>
          <SectionHeader title="Brands" subtitle="Icons you trust" />
          <div className="scroll-x sm:flex sm:flex-wrap sm:justify-center sm:gap-4 sm:overflow-visible md:gap-6">
            {(data?.brands || []).map((brand) => (
              <Link
                key={brand._id}
                to={`/shop?brand=${brand._id}`}
                className="rounded-xl border border-line bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider transition hover:border-ink sm:px-6 sm:py-4 sm:text-sm dark:border-white/10 dark:bg-ink-soft dark:hover:border-white/40"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Best Sellers"
            subtitle="Customer favorites"
            to="/shop?bestSeller=true"
          />
          <ProductGrid products={data?.bestSellers || []} loading={loading} />
        </section>

        {data?.reviews?.length > 0 && (
          <section>
            <SectionHeader title="Reviews" subtitle="What our customers say" />
            <div className="scroll-x sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3 sm:pb-0">
              {data.reviews.map((r) => (
                <div
                  key={r._id}
                  className="w-[78vw] rounded-2xl bg-white p-5 shadow-sm sm:w-auto dark:bg-ink-soft"
                >
                  <RatingStars rating={r.rating} />
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink/80 dark:text-white/80">
                    "{r.comment}"
                  </p>
                  <p className="mt-4 text-sm font-medium">{r.user?.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-2xl bg-ink px-5 py-10 text-white sm:rounded-3xl sm:px-8 sm:py-14 md:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e85d04_0%,_transparent_50%)] opacity-40" />
          <div className="relative mx-auto max-w-xl text-center">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl">Stay in stride</h2>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              Get early access to drops, exclusive deals, and style tips.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl border-0 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:bg-white/15"
              />
              <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
