import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
      <Link to="/" className="hover:text-ink dark:hover:text-white transition">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={14} />
          {item.to ? (
            <Link to={item.to} className="hover:text-ink dark:hover:text-white transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
