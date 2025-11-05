import React from 'react';
import type { ProducerYield, BuyerOrder, UserRatingStats } from '../../types';
import StarRating from '../ui/StarRating';

interface ViewOffersModalProps {
  yieldPost: ProducerYield;
  offers: BuyerOrder[];
  userRatingStatsMap?: Record<string, UserRatingStats>;
  isOpen: boolean;
  onClose: () => void;
  onViewBuyer?: (order: BuyerOrder) => void;
  onAcceptOffer?: (order: BuyerOrder) => void;
  currentUserId?: string;
  transactions?: any[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const ViewOffersModal: React.FC<ViewOffersModalProps> = ({
  yieldPost,
  offers,
  userRatingStatsMap,
  isOpen,
  onClose,
  onViewBuyer,
  onAcceptOffer,
  currentUserId,
  transactions,
}) => {
  if (!isOpen) return null;

  // Filter offers for this yield
  const relevantOffers = offers.filter(o => o.yieldId === yieldPost.id);
  
  // Check which offer is accepted (if any) - only one transaction per yield should exist
  const acceptedTransaction = transactions?.find(t => t.yield_id === yieldPost.id);
  
  // Check if current user is the seller (producer)
  const isSeller = yieldPost.user_id === currentUserId;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buyer Offers</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {yieldPost.commodityName} - {yieldPost.expectedQuantity} {yieldPost.commodityUnit}(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {relevantOffers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No buyer offers yet for this yield.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relevantOffers.map(offer => {
                const isAccepted = acceptedTransaction?.order_id === offer.id;
                const totalPrice = offer.quantity * offer.offerPrice;
                
                return (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isAccepted 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1" 
                        onClick={() => onViewBuyer?.(offer)}
                        style={{ cursor: onViewBuyer ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {offer.buyerName}
                          </h3>
                          {isAccepted && (
                            <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                              Accepted
                            </span>
                          )}
                          {userRatingStatsMap && (
                            <StarRating
                              rating={userRatingStatsMap[offer.user_id]?.average_overall || 0}
                              size="sm"
                              readOnly
                            />
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          <p>
                            <span className="font-medium">Quantity:</span> {offer.quantity} {offer.commodityUnit}(s)
                          </p>
                          <p>
                            <span className="font-medium">Offer Price:</span> {formatPrice(offer.offerPrice)} per {offer.commodityUnit}
                          </p>
                          <p>
                            <span className="font-medium">Total Value:</span> {formatPrice(totalPrice)}
                          </p>
                          <p>
                            <span className="font-medium">Offer Posted:</span>{' '}
                            {new Date(offer.timestamp).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 ml-4">
                        {isSeller && onAcceptOffer && !isAccepted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcceptOffer(offer);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Accept Offer
                          </button>
                        )}
                        {onViewBuyer && (
                          <button
                            onClick={() => onViewBuyer(offer)}
                            className="px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                          >
                            View Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-medium rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOffersModal;
