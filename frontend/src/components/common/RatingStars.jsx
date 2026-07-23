import { Star } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function RatingStars({ rating = 0, size = 14, className }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? 'fill-accent text-accent'
              : 'fill-transparent text-line dark:text-white/20'
          }
        />
      ))}
    </div>
  );
}
