import React from 'react';
import type { TransactionHistory, Rating } from '../../types';

interface TransactionHistoryListProps {
  transactions: TransactionHistory[];
  ratings: Rating[];
  currentUserId: string;
  onRateTransaction: (transaction: TransactionHistory, ratingType: 'buyer_to_seller' | 'seller_to_buyer') => void;
  getUserProfile?: (userId: string) => Promise<{ full_name?: string; profile_photo_url?: string } | null>;
}

const TransactionHistoryList: React.FC<TransactionHistoryListProps> = ({
  transactions,
  ratings,
  currentUserId,
  onRateTransaction,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const hasRated = (transactionId: string, ratingType: 'buyer_to_seller' | 'seller_to_buyer') => {
    return ratings.some(r => r.transaction_id === transactionId && r.rating_type === ratingType && r.rater_id === currentUserId);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No transactions yet</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your transaction history will appear here once you complete deals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isBuyer = transaction.buyer_id === currentUserId;
        const canRateBuyer = isBuyer && transaction.status === 'delivered' && !hasRated(transaction.id, 'seller_to_buyer');
        const canRateSeller = !isBuyer && transaction.status === 'delivered' && !hasRated(transaction.id, 'buyer_to_seller');
        const hasRatedBuyer = isBuyer && hasRated(transaction.id, 'seller_to_buyer');
        const hasRatedSeller = !isBuyer && hasRated(transaction.id, 'buyer_to_seller');

        return (
          <div
            key={transaction.id}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {isBuyer ? 'You bought from' : 'You sold to'} {isBuyer ? 'Seller' : 'Buyer'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
              {transaction.status === 'delivered' && (
                <div className="flex gap-2">
                  {canRateBuyer && (
                    <button
                      onClick={() => onRateTransaction(transaction, 'seller_to_buyer')}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      Rate Buyer
                    </button>
                  )}
                  {canRateSeller && (
                    <button
                      onClick={() => onRateTransaction(transaction, 'buyer_to_seller')}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      Rate Seller
                    </button>
                  )}
                  {(hasRatedBuyer || hasRatedSeller) && (
                    <span className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      ✓ Rated
                    </span>
                  )}
                </div>
              )}
              {transaction.completed_at && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Completed: {formatDate(transaction.completed_at)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionHistoryList;
