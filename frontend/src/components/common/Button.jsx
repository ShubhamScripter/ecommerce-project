import { cn } from '../../utils/helpers';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  ...props
}) {
  const variants = {
    primary:
      'bg-ink text-white hover:bg-ink-soft dark:bg-white dark:text-ink dark:hover:bg-paper',
    accent: 'bg-accent text-white hover:bg-accent-dark',
    outline:
      'border border-ink/20 bg-transparent hover:bg-ink hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-ink',
    ghost: 'bg-transparent hover:bg-paper-dark dark:hover:bg-white/10',
    danger: 'bg-accent-dark text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
