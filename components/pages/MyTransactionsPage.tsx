import React, { useState } from 'react';
import type { TransactionHistory, Rating } from '../../types';
import TransactionHistoryList from '../lists/TransactionHistoryList';

interface MyTransactionsPageProps {
  transactions: TransactionHistory[];
  ratings: Rating[];
  currentUserId: string;
  onRateTransaction: (transaction: TransactionHistory, ratingType: 'buyer_to_seller' | 'seller_to_buyer') => void;
}

type ViewTab = 'buyer' | 'seller' | 'transporter';

const MyTransactionsPage: React.FC<MyTransactionsPageProps> = ({
  transactions,
  ratings,
  currentUserId,
  onRateTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('buyer');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by role
    let roleMatch = false;
    if (activeTab === 'buyer') {
      roleMatch = transaction.buyer_id === currentUserId;
    } else if (activeTab === 'seller') {
      roleMatch = transaction.seller_id === currentUserId;
    } else if (activeTab === 'transporter') {
      // For transporter, we'd need to check if transport_bid_id matches user's transport bids
      // For now, filter transactions that have a transport_bid_id
      roleMatch = !!transaction.transport_bid_id;
    }

    // Filter by status
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;

    return roleMatch && statusMatch;
  });

  const tabs: { id: ViewTab; label: string; count: number }[] = [
    {
      id: 'buyer',
      label: 'As Buyer',
      count: transactions.filter(t => t.buyer_id === currentUserId).length,
    },
    {
      id: 'seller',
      label: 'As Seller',
      count: transactions.filter(t => t.seller_id === currentUserId).length,
    },
    {
      id: 'transporter',
      label: 'As Transporter',
      count: transactions.filter(t => !!t.transport_bid_id).length,
    },
  ];

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Transactions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          View and manage your transaction history
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by status:</span>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${
                  statusFilter === filter.value
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div>
        <TransactionHistoryList
          transactions={filteredTransactions}
          ratings={ratings}
          currentUserId={currentUserId}
          onRateTransaction={onRateTransaction}
        />
      </div>
    </div>
  );
};

export default MyTransactionsPage;
