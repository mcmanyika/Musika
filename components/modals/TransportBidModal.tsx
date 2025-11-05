import React, { useState } from 'react';
import type { BuyerOrder, TransportBid } from '../../types';

interface TransportBidModalProps {
  deal: BuyerOrder;
  isOpen: boolean;
  onClose: () => void;
  // FIX: Omitted 'user_id' to match the handler in App.tsx
  onAddBid: (bid: Omit<TransportBid, 'id' | 'timestamp' | 'transporterName' | 'user_id'>) => void;
}

const TransportBidModal: React.FC<TransportBidModalProps> = ({ deal, isOpen, onClose, onAddBid }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numBidAmount = parseFloat(bidAmount);

    if (!bidAmount || !estimatedDeliveryDate) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(numBidAmount) || numBidAmount <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }
    if (new Date(estimatedDeliveryDate) <= new Date()) {
      setError('Estimated delivery date must be in the future.');
      return;
    }


    onAddBid({
      orderId: deal.id,
      bidAmount: numBidAmount,
      estimatedDeliveryDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Place a Transport Bid</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">For {deal.quantity} {deal.commodityUnit}(s) of {deal.commodityName}</p>
            </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
             Bid Amount (USD)
            </label>
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              step="0.01"
              placeholder="e.g., 50.00"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              id="deliveryDate"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
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
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportBidModal;
