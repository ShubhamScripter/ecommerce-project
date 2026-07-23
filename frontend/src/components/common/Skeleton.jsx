import { cn } from '../../utils/helpers';

export function ProductCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-64 w-full" />
      <div className="skeleton h-40 w-full" />
    </div>
  );
}

export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}
