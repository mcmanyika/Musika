import React from 'react';

interface StarRatingProps {
  rating: number; // 0-5 for display, or current rating for input
  onRatingChange?: (rating: number) => void; // If provided, makes it interactive
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 'md',
  showLabel = false,
  label,
  readOnly = false 
}) => {
  const isInteractive = onRatingChange && !readOnly;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starValue: number) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (isInteractive) {
      // Optional: Add hover effect by storing hover state
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${isInteractive ? 'cursor-pointer' : ''}`}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          const isFull = starValue <= fullStars;
          const isHalf = starValue === fullStars + 1 && hasHalfStar;
          
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              disabled={readOnly || !isInteractive}
              className={`${sizeClasses[size]} ${
                isInteractive && !readOnly
                  ? 'hover:scale-110 transition-transform'
                  : ''
              } ${readOnly ? 'cursor-default' : ''}`}
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              {isFull ? (
                <svg
                  className={`${sizeClasses[size]} text-yellow-400 fill-current`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : isHalf ? (
                <svg
                  className={`${sizeClasses[size]} text-yellow-400`}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <defs>
                    <linearGradient id={`half-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    fill={`url(#half-${index})`}
                  />
                </svg>
              ) : (
                <svg
                  className={`${sizeClasses[size]} text-slate-300 dark:text-slate-600 fill-current`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {label || `${rating.toFixed(1)} / 5.0`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
