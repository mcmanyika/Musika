import React, { useMemo } from 'react';
import type { ProducerYield, BuyerOrder } from '../types';

interface YieldListProps {
  yields: ProducerYield[];
  orders: BuyerOrder[];
  onMakeOffer: (yieldPost: ProducerYield) => void;
  searchQuery: string;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


const YieldItem: React.FC<{ yieldPost: ProducerYield; orders: BuyerOrder[]; onMakeOffer: (yieldPost: ProducerYield) => void; }> = ({ yieldPost, orders, onMakeOffer }) => {
    
    const { offerCount, highestOffer } = useMemo(() => {
        const relevantOffers = orders.filter(o => o.yieldId === yieldPost.id);
        const count = relevantOffers.length;
        const highest = relevantOffers.reduce((max, order) => order.offerPrice > max ? order.offerPrice : max, 0);
        return { offerCount: count, highestOffer: highest };
    }, [orders, yieldPost.id]);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-md flex flex-col sm:flex-row sm:space-x-4">
            {yieldPost.productImage && (
                <div className="flex-shrink-0 w-full sm:w-32 mb-4 sm:mb-0">
                    <img
                        src={yieldPost.productImage}
                        alt={yieldPost.commodityName}
                        className="w-full h-32 sm:w-32 sm:h-32 object-cover rounded-md"
                    />
                </div>
            )}
            <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start flex-grow">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{yieldPost.commodityName}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Expected: {yieldPost.expectedQuantity} {yieldPost.commodityUnit}(s)
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                            Producer: <span className="font-normal">{yieldPost.producerName}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-md text-emerald-600 dark:text-emerald-400">Available From</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(yieldPost.expectedDate)}</p>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div className="text-sm">
                        <p className="dark:text-slate-200">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{offerCount}</span> {offerCount === 1 ? 'Offer' : 'Offers'}
                        </p>
                        {highestOffer > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Top Bid: <span className="font-bold">{formatPrice(highestOffer)}</span>
                            </p>
                        )}
                    </div>
                     <button
                        onClick={() => onMakeOffer(yieldPost)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        Make Offer
                    </button>
                </div>
            </div>
        </div>
    );
};


const YieldList: React.FC<YieldListProps> = ({ yields, orders, onMakeOffer, searchQuery }) => {
  if (yields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
            {searchQuery ? 'No Results Found' : 'No yield postings yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery ? `Your search for "${searchQuery}" did not match any yields.` : 'Be the first to post an expected future supply.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        {yields.map(yieldPost => (
            <YieldItem key={yieldPost.id} yieldPost={yieldPost} orders={orders} onMakeOffer={onMakeOffer} />
        ))}
    </div>
  );
};

export default YieldList;