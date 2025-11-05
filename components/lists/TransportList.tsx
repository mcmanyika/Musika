import React, { useMemo, useState } from 'react';
import type { BuyerOrder, TransportBid, UserRatingStats, ProducerYield } from '../../types';
import StarRating from '../ui/StarRating';

interface TransportListProps {
  deals: BuyerOrder[];
  bids: TransportBid[];
  onPlaceBid: (deal: BuyerOrder) => void;
  searchQuery: string;
  yields?: ProducerYield[];
  userRatingStatsMap?: Record<string, UserRatingStats>;
  onViewTransporter?: (bid: TransportBid) => void;
  onAcceptBid?: (bid: TransportBid) => void;
  currentUserId?: string;
  transactions?: any[];
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

const DealItem: React.FC<{ 
  deal: BuyerOrder; 
  bids: TransportBid[]; 
  onPlaceBid: (deal: BuyerOrder) => void;
  yields?: ProducerYield[];
  userRatingStatsMap?: Record<string, UserRatingStats>;
  onViewTransporter?: (bid: TransportBid) => void;
  onAcceptBid?: (bid: TransportBid) => void;
  currentUserId?: string;
  transactions?: any[];
}> = ({ deal, bids, onPlaceBid, yields, userRatingStatsMap, onViewTransporter, onAcceptBid, currentUserId, transactions }) => {
    const [showBids, setShowBids] = useState<boolean>(false);
    
    const { bidCount, lowestBid, relevantBids } = useMemo(() => {
        const filteredBids = bids.filter(b => b.orderId === deal.id);
        const count = filteredBids.length;
        const lowest = filteredBids.reduce((min, bid) => bid.bidAmount < min ? bid.bidAmount : min, Infinity);
        return { 
            bidCount: count, 
            lowestBid: lowest === Infinity ? 0 : lowest,
            relevantBids: filteredBids
        };
    }, [bids, deal.id]);
    
    // Check if current user is the seller (producer) for this deal
    const isSeller = deal.yieldId && yields && yields.some(y => y.id === deal.yieldId && y.user_id === currentUserId);
    
    // Check which bid is accepted (if any) for this order
    const acceptedTransaction = transactions?.find(t => t.order_id === deal.id && t.transport_bid_id);
    
    // Check if any bid has been accepted for this deal (to prevent more bids)
    const hasAcceptedBid = !!acceptedTransaction;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{deal.commodityName}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {deal.quantity} {deal.commodityUnit}(s)
                    </p>
                </div>
                <div className="text-right">
                     <p className="text-xs text-slate-500 dark:text-slate-400">Deal Value</p>
                    <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">{formatPrice(deal.offerPrice * deal.quantity)}</p>
                </div>
            </div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                    <p><span className="font-semibold">From (Producer):</span> {deal.producerName}</p>
                    {userRatingStatsMap && deal.yieldId && yields && (() => {
                        const yieldPost = yields.find(y => y.id === deal.yieldId);
                        return yieldPost ? (
                            <StarRating
                                rating={userRatingStatsMap[yieldPost.user_id]?.average_overall || 0}
                                size="sm"
                                readOnly
                            />
                        ) : null;
                    })()}
                </div>
                <div className="flex items-center gap-2">
                    <p><span className="font-semibold">To (Buyer):</span> {deal.buyerName}</p>
                    {userRatingStatsMap && (
                        <StarRating
                            rating={userRatingStatsMap[deal.user_id]?.average_overall || 0}
                            size="sm"
                            readOnly
                        />
                    )}
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">
                        <p className="dark:text-slate-200">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{bidCount}</span> Transport {bidCount === 1 ? 'Bid' : 'Bids'}
                        </p>
                        {lowestBid > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Lowest: <span className="font-bold">{formatPrice(lowestBid)}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        {isSeller && bidCount > 0 && (
                            <button
                                onClick={() => setShowBids(!showBids)}
                                className="px-3 py-1 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                            >
                                {showBids ? 'Hide' : 'View'} Bids
                            </button>
                        )}
                        {hasAcceptedBid ? (
                            <div className="px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                                Bid Accepted
                            </div>
                        ) : (
                            <button
                                onClick={() => onPlaceBid(deal)}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                            >
                                Place Bid
                            </button>
                        )}
                    </div>
                </div>
                {isSeller && showBids && relevantBids.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {relevantBids.map(bid => {
                            const isAccepted = acceptedTransaction?.transport_bid_id === bid.id;
                            return (
                                <div
                                    key={bid.id}
                                    className={`p-3 rounded-md border ${
                                        isAccepted 
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50'
                                    } transition-all`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1" onClick={() => onViewTransporter?.(bid)} style={{ cursor: onViewTransporter ? 'pointer' : 'default' }}>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    {bid.transporterName}
                                                </p>
                                                {isAccepted && (
                                                    <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                                        Accepted
                                                    </span>
                                                )}
                                                {userRatingStatsMap && (
                                                    <StarRating
                                                        rating={userRatingStatsMap[bid.user_id]?.average_overall || 0}
                                                        size="sm"
                                                        readOnly
                                                    />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Est. Delivery: {new Date(bid.estimatedDeliveryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatPrice(bid.bidAmount)}
                                            </p>
                                            {isSeller && onAcceptBid && !isAccepted && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAcceptBid(bid);
                                                    }}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                >
                                                    Accept
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
        </div>
    );
};


const TransportList: React.FC<TransportListProps> = ({ deals, bids, onPlaceBid, searchQuery, yields, userRatingStatsMap, onViewTransporter, onAcceptBid, currentUserId, transactions }) => {
  if (deals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 min-h-[300px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 003.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 003.375 3.375v1.875" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
            {searchQuery ? 'No Gigs Found' : 'No Transport Gigs Available'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery ? `Your search for "${searchQuery}" did not match any gigs.` : 'When a buyer makes an offer on a yield, it will appear here.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map(deal => (
            <DealItem 
                key={deal.id} 
                deal={deal} 
                bids={bids} 
                onPlaceBid={onPlaceBid}
                yields={yields}
                userRatingStatsMap={userRatingStatsMap}
                onViewTransporter={onViewTransporter}
                onAcceptBid={onAcceptBid}
                currentUserId={currentUserId}
                transactions={transactions}
            />
        ))}
    </div>
  );
};

export default TransportList;
