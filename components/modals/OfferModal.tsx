import React, { useState } from 'react';
import type { ProducerYield, BuyerOrder } from '../../types';

interface OfferModalProps {
  yieldPost: ProducerYield;
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Omit<BuyerOrder, 'id' | 'timestamp' | 'buyerName' | 'user_id'>) => void;
}

const OfferModal: React.FC<OfferModalProps> = ({ yieldPost, isOpen, onClose, onAddOrder }) => {
  const [quantity, setQuantity] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const numQuantity = parseFloat(quantity);
    const numOfferPrice = parseFloat(offerPrice);

    if (!quantity || !offerPrice) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid quantity.');
      setIsSubmitting(false);
      return;
    }
    if (numQuantity > yieldPost.expectedQuantity) {
        setError(`Quantity cannot exceed the available ${yieldPost.expectedQuantity} ${yieldPost.commodityUnit}(s).`);
        setIsSubmitting(false);
        return;
    }
    if (isNaN(numOfferPrice) || numOfferPrice <= 0) {
      setError('Please enter a valid offer price.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddOrder({
        commodityName: yieldPost.commodityName,
        commodityUnit: yieldPost.commodityUnit,
        quantity: numQuantity,
        offerPrice: numOfferPrice,
        yieldId: yieldPost.id,
        producerName: yieldPost.producerName,
      });
      
      // Reset form fields after successful submission
      setQuantity('');
      setOfferPrice('');
      setError(null);
    } catch (err) {
      setError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Make an Offer</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">For {yieldPost.producerName}'s {yieldPost.commodityName}</p>
            </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Quantity (Max: {yieldPost.expectedQuantity} {yieldPost.commodityUnit}s)
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 10"
              max={yieldPost.expectedQuantity}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="offerPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Offer Price (USD per {yieldPost.commodityUnit})
            </label>
            <input
              type="number"
              id="offerPrice"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              step="0.01"
              placeholder="e.g., 1.50"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800 transition-colors"
            >
                Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;