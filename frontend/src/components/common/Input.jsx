import { cn } from '../../utils/helpers';

export default function Input({ label, error, className, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-ink/80 dark:text-white/80">{label}</span>
      )}
      <input
        className={cn(
          'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-ink dark:border-white/10 dark:bg-ink-soft dark:focus:border-white/40',
          error && 'border-accent-dark',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent-dark">{error}</span>}
    </label>
  );
}
