import React from 'react';
import type { Commodity } from '../types';

interface CompactCommodityListProps {
  commodities: Commodity[];
  selectedCommodityId?: string | null;
  onSelectCommodity: (commodity: Commodity) => void;
}

const CompactCommodityList: React.FC<CompactCommodityListProps> = ({ commodities, selectedCommodityId, onSelectCommodity }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
      {commodities.length > 0 ? (
        <ul className="space-y-1">
          {commodities.map((commodity) => {
            const isSelected = commodity.id === selectedCommodityId;
            return (
              <li key={commodity.id}>
                <button
                  onClick={() => onSelectCommodity(commodity)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isSelected
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                  aria-current={isSelected ? 'true' : 'false'}
                >
                  {commodity.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No commodities match your search.</p>
        </div>
      )}
    </div>
  );
};

export default CompactCommodityList;
