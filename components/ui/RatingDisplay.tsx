import React from 'react';
import type { UserRatingStats } from '../../types';
import StarRating from './StarRating';

interface RatingDisplayProps {
  ratingStats: UserRatingStats | null;
  showDetails?: boolean;
  compact?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ ratingStats, showDetails = true, compact = false }) => {
  if (!ratingStats || ratingStats.total_ratings === 0) {
    return (
      <div className="text-slate-400 dark:text-slate-500 text-sm">
        {compact ? 'No ratings' : 'No ratings yet'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StarRating
          rating={ratingStats.average_overall}
          size="sm"
          showLabel
          label={ratingStats.average_overall.toFixed(1)}
          readOnly
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({ratingStats.total_ratings} {ratingStats.total_ratings === 1 ? 'rating' : 'ratings'})
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Rating</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {ratingStats.average_overall.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Based on {ratingStats.total_ratings} {ratingStats.total_ratings === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
        <StarRating
          rating={ratingStats.average_overall}
          size="lg"
          readOnly
        />
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quality</span>
            <div className="flex items-center gap-2">
              <StarRating
                rating={ratingStats.average_quality}
                size="sm"
                readOnly
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                {ratingStats.average_quality.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Communication</span>
            <div className="flex items-center gap-2">
              <StarRating
                rating={ratingStats.average_communication}
                size="sm"
                readOnly
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                {ratingStats.average_communication.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Timeliness</span>
            <div className="flex items-center gap-2">
              <StarRating
                rating={ratingStats.average_timeliness}
                size="sm"
                readOnly
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                {ratingStats.average_timeliness.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
