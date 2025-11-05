import React, { useState } from 'react';
import type { Rating } from '../../types';
import StarRating from '../ui/StarRating';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rating: Omit<Rating, 'id' | 'created_at' | 'updated_at' | 'overall_rating'>) => Promise<void>;
  ratedUserName: string;
  ratingType: 'buyer_to_seller' | 'seller_to_buyer';
  transactionId: string;
  raterId: string;
  ratedUserId: string;
  existingRating?: Rating | null;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ratedUserName,
  ratingType,
  transactionId,
  raterId,
  ratedUserId,
  existingRating
}) => {
  const [qualityRating, setQualityRating] = useState<number>(existingRating?.quality_rating || 0);
  const [communicationRating, setCommunicationRating] = useState<number>(existingRating?.communication_rating || 0);
  const [timelinessRating, setTimelinessRating] = useState<number>(existingRating?.timeliness_rating || 0);
  const [reviewText, setReviewText] = useState<string>(existingRating?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateOverall = () => {
    if (qualityRating > 0 && communicationRating > 0 && timelinessRating > 0) {
      return Math.round(((qualityRating + communicationRating + timelinessRating) / 3) * 100) / 100;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (qualityRating === 0 || communicationRating === 0 || timelinessRating === 0) {
      setError('Please provide ratings for all aspects (Quality, Communication, and Timeliness).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        transaction_id: transactionId,
        rater_id: raterId,
        rated_user_id: ratedUserId,
        rating_type: ratingType,
        quality_rating: qualityRating,
        communication_rating: communicationRating,
        timeliness_rating: timelinessRating,
        review_text: reviewText || undefined,
      });
      onClose();
      // Reset form
      setQualityRating(0);
      setCommunicationRating(0);
      setTimelinessRating(0);
      setReviewText('');
    } catch (err: any) {
      setError(err.message || 'Failed to save rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallRating = calculateOverall();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {existingRating ? 'Update Rating' : 'Rate Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              Rate your experience with <span className="font-semibold text-slate-800 dark:text-slate-100">{ratedUserName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quality Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Quality <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={qualityRating}
                onRatingChange={setQualityRating}
                size="lg"
                showLabel
                label={qualityRating > 0 ? `${qualityRating}.0 / 5.0` : 'Not rated'}
              />
            </div>

            {/* Communication Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Communication <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={communicationRating}
                onRatingChange={setCommunicationRating}
                size="lg"
                showLabel
                label={communicationRating > 0 ? `${communicationRating}.0 / 5.0` : 'Not rated'}
              />
            </div>

            {/* Timeliness Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Timeliness <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={timelinessRating}
                onRatingChange={setTimelinessRating}
                size="lg"
                showLabel
                label={timelinessRating > 0 ? `${timelinessRating}.0 / 5.0` : 'Not rated'}
              />
            </div>

            {/* Overall Rating Display */}
            {overallRating > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Rating:</span>
                  <StarRating
                    rating={overallRating}
                    size="md"
                    showLabel
                    label={`${overallRating.toFixed(2)} / 5.0`}
                    readOnly
                  />
                </div>
              </div>
            )}

            {/* Review Text */}
            <div>
              <label htmlFor="review-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Review (Optional)
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Share your experience (optional)..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || overallRating === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : existingRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
