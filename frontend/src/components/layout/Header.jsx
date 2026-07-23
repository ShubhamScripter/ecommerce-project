import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Moon, Sun, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPrice, getFinalPrice, getProductImage } from '../../utils/helpers';
import { buildWhatsAppSupportUrl, openWhatsApp } from '../../utils/whatsapp';

export default function Header() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await productService.search(query);
        setResults(data.data || []);
        setShowSearch(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('drawer-open', menuOpen);
    return () => document.body.classList.remove('drawer-open');
  }, [menuOpen]);

  const navLinks = [
    { label: 'All Shoes', to: '/shop' },
    { label: 'Men', to: '/shop?gender=men' },
    { label: 'Women', to: '/shop?gender=women' },
    { label: 'Kids', to: '/shop?gender=kids' },
    { label: 'New Arrivals', to: '/shop?newArrival=true' },
    { label: 'Best Sellers', to: '/shop?bestSeller=true' },
  ];

  const closeMenu = () => setMenuOpen(false);

  const submitSearch = (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    setShowSearch(false);
    setMobileSearchOpen(false);
    closeMenu();
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  const openSupportWhatsApp = () => {
    const url = buildWhatsAppSupportUrl(
      settings.whatsappNumber,
      'Hi! I want to know more about your shoes collection.'
    );
    if (!openWhatsApp(url)) {
      toast.error('WhatsApp number not configured');
      return;
    }
    closeMenu();
  };

  const SearchResults = () =>
    showSearch && results.length > 0 ? (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-2xl border border-line bg-white shadow-xl dark:border-white/10 dark:bg-ink-soft">
        {results.map((p) => (
          <button
            key={p._id}
            type="button"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-paper dark:hover:bg-white/5"
            onClick={() => {
              navigate(`/product/${p.slug}`);
              setQuery('');
              setShowSearch(false);
              setMobileSearchOpen(false);
              closeMenu();
            }}
          >
            <img
              src={getProductImage(p)}
              alt={p.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted">{formatPrice(getFinalPrice(p))}</p>
            </div>
          </button>
        ))}
      </div>
    ) : null;

  const mobileMenu =
    menuOpen &&
    createPortal(
      <div className="fixed inset-0 z-[9999] lg:hidden" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/50" onClick={closeMenu} aria-hidden="true" />
        <div
          className="absolute left-0 top-0 flex h-full w-[85%] max-w-[320px] flex-col bg-white shadow-2xl dark:bg-ink"
          style={{
            animation: 'slide-in-left 0.28s ease both',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-4 dark:border-white/10">
            <span className="font-display text-2xl">STRIDE</span>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-paper-dark dark:hover:bg-white/10"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Browse
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3.5 text-base font-medium hover:bg-paper-dark dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-3 border-t border-line dark:border-white/10" />
            <button
              type="button"
              onClick={openSupportWhatsApp}
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-3.5 text-left text-base font-medium text-white"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </button>
          </nav>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/95 backdrop-blur-md dark:border-white/10 dark:bg-ink/95">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-6">
          <button
            type="button"
            className="touch-target flex items-center justify-center rounded-lg p-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            className="font-display shrink-0 text-2xl tracking-wide text-ink sm:text-3xl dark:text-white"
          >
            STRIDE
          </Link>

          <nav className="ml-4 hidden items-center gap-5 lg:flex xl:gap-6">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-ink/70 transition hover:text-ink dark:text-white/70 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className="relative ml-auto hidden min-w-0 max-w-md flex-1 sm:block"
            ref={searchRef}
          >
            <form onSubmit={submitSearch}>
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length && setShowSearch(true)}
                placeholder="Search shoes..."
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ink dark:border-white/10 dark:bg-ink-soft dark:focus:border-white/30"
              />
            </form>
            <SearchResults />
          </div>

          <div className="ml-auto flex items-center gap-0.5 sm:ml-0 sm:gap-1">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="touch-target flex items-center justify-center rounded-lg p-2 sm:hidden"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="touch-target flex items-center justify-center rounded-lg p-2 hover:bg-paper-dark dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={openSupportWhatsApp}
              className="touch-target flex items-center justify-center rounded-lg p-2 text-[#25D366] hover:bg-paper-dark dark:hover:bg-white/10"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div
            className="border-t border-line px-3 py-3 sm:hidden dark:border-white/10"
            ref={searchRef}
          >
            <form onSubmit={submitSearch} className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shoes..."
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none dark:border-white/10 dark:bg-ink-soft"
              />
              <SearchResults />
            </form>
          </div>
        )}
      </header>

      {mobileMenu}
    </>
  );
}
