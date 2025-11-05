import React from 'react';
import type { Commodity } from '../../types';
import type { SortKey, SortDirection } from '../../App';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '../icons/TrendIcons';
import SortControls from '../ui/SortControls';

interface CommodityListProps {
  commodities: Commodity[];
  selectedCommodityId?: string | null;
  onSelectCommodity: (commodity: Commodity) => void;
  searchQuery: string;
  sortConfig: { key: SortKey, direction: SortDirection };
  onSort: (key: SortKey) => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}

const CommodityListItem: React.FC<{
    commodity: Commodity;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ commodity, isSelected, onSelect }) => {
    const isPositive = commodity.priceChange > 0;
    const isNegative = commodity.priceChange < 0;

    const trendColor = isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-slate-400 dark:text-slate-500';
    const bgColor = isSelected ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'bg-white dark:bg-slate-800';
    const ringColor = isSelected ? 'ring-2 ring-emerald-500' : 'ring-1 ring-slate-200 dark:ring-slate-700';

    return (
        <li
            onClick={onSelect}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${bgColor} ${ringColor} hover:shadow-md hover:ring-emerald-400 dark:hover:ring-emerald-600`}
        >
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{commodity.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">per {commodity.unit}</p>
            </div>
            <div className="text-right flex items-center space-x-2">
                <span className="font-semibold text-slate-900 dark:text-slate-50">{formatPrice(commodity.price)}</span>
                <span className={`flex items-center text-sm font-medium ${trendColor}`}>
                    {isPositive && <ArrowUpIcon />}
                    {isNegative && <ArrowDownIcon />}
                    {!isPositive && !isNegative && <MinusIcon />}
                    <span>{Math.abs(commodity.priceChange).toFixed(2)}</span>
                </span>
            </div>
        </li>
    );
};


const CommodityList: React.FC<CommodityListProps> = ({ commodities, selectedCommodityId, onSelectCommodity, searchQuery, sortConfig, onSort }) => {
  if (searchQuery && commodities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center py-10">
          <p className="text-slate-500 dark:text-slate-400">
              {`No commodities found for "${searchQuery}"`}
          </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SortControls sortConfig={sortConfig} onSort={onSort} />
        <ul className="space-y-3 mt-4">
            {commodities.map((commodity) => (
                <CommodityListItem 
                    key={commodity.id}
                    commodity={commodity}
                    isSelected={commodity.id === selectedCommodityId}
                    onSelect={() => onSelectCommodity(commodity)}
                />
            ))}
        </ul>
        {commodities.length === 0 && !searchQuery && (
             <div className="text-center py-10">
                <p className="text-slate-500 dark:text-slate-400">
                    No commodities to display.
                </p>
            </div>
        )}
    </div>
  );
};

export default CommodityList;
