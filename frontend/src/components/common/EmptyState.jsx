import { PackageOpen } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back soon or explore our collection.',
  actionLabel,
  actionTo,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="mb-4 rounded-2xl bg-paper-dark p-5 dark:bg-white/5">
        <Icon size={36} className="text-muted" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
