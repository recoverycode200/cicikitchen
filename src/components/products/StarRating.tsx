import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange && onChange(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${star} bintang`}
          >
            <Star
              size={size}
              className={filled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 fill-neutral-300'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
