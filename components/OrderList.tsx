import React from 'react';
import type { BuyerOrder } from '../types';

interface OrderListProps {
  orders: BuyerOrder[];
  searchQuery: string;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
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


const OrderItem: React.FC<{ order: BuyerOrder }> = ({ order }) => {
    const isOffer = !!order.yieldId;

    return (
        <div className={`p-4 rounded-lg shadow-sm border transition-shadow hover:shadow-md ${isOffer ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">
                        {isOffer && <span className="text-emerald-600 dark:text-emerald-400 font-normal">Offer for </span>}
                        {order.commodityName}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Wants: {order.quantity} {order.commodityUnit}(s)
                    </p>
                     {isOffer && order.producerName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Producer: <span className="font-medium">{order.producerName}</span>
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">{formatPrice(order.offerPrice)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">per unit</p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate" title={order.buyerName}>
                    Buyer: <span className="font-normal">{order.buyerName}</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatTimeAgo(order.timestamp)}</p>
            </div>
        </div>
    );
};


const OrderList: React.FC<OrderListProps> = ({ orders, searchQuery }) => {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
           <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
            {searchQuery ? 'No Results Found' : 'No orders or offers yet'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery ? `Your search for "${searchQuery}" did not match any orders.` : 'Place an order or make an offer on a yield posting.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        {orders.map(order => (
            <OrderItem key={order.id} order={order} />
        ))}
    </div>
  );
};

export default OrderList;