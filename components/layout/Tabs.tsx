import React from 'react';

type TabId = 'orders' | 'yields' | 'prices' | 'transport' | 'transactions' | 'listings';

interface Tab {
  id: TabId;
  label: string;
  requiresAuth?: boolean;
}

const tabs: Tab[] = [
  { id: 'yields', label: 'Producer Yields' },
  { id: 'prices', label: 'Market Prices' },
  { id: 'orders', label: 'Buyer Orders' },
  { id: 'transport', label: 'Transport Gigs' },
  { id: 'listings', label: 'My Listings', requiresAuth: true },
  { id: 'transactions', label: 'My Transactions', requiresAuth: true },
];

interface TabsProps {
  activeTab: TabId;
  onTabClick: (tabId: TabId) => void;
  isAuthenticated?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabClick, isAuthenticated = false }) => {
  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || isAuthenticated);

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
          value={activeTab}
          onChange={(e) => onTabClick(e.target.value as TabId)}
        >
          {visibleTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${
                    tab.id === activeTab
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-300'
                  }
                `}
                aria-current={tab.id === activeTab ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Tabs;