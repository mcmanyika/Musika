import React from 'react';
import type { SortKey, SortDirection } from '../../App';
import { ArrowUp, ArrowDown, ArrowsUpDown } from '../icons/SortIcons';

interface SortControlsProps {
    sortConfig: { key: SortKey, direction: SortDirection };
    onSort: (key: SortKey) => void;
}

const sortOptions: { key: SortKey, label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'priceChange', label: 'Change' },
];

const SortButton: React.FC<{
    sortKey: SortKey;
    label: string;
    isActive: boolean;
    direction: SortDirection;
    onClick: () => void;
}> = ({ sortKey, label, isActive, direction, onClick }) => {
    const activeClasses = 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100';
    const inactiveClasses = 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50';

    return (
        <button
            onClick={onClick}
            className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center space-x-2 transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            aria-label={`Sort by ${label} in ${isActive && direction === 'asc' ? 'descending' : 'ascending'} order`}
        >
            <span>{label}</span>
            {isActive ? (
                direction === 'asc' ? <ArrowUp /> : <ArrowDown />
            ) : (
                <ArrowsUpDown />
            )}
        </button>
    );
}

const SortControls: React.FC<SortControlsProps> = ({ sortConfig, onSort }) => {
    return (
        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border-b border-slate-200 dark:border-slate-700 mb-2 flex-wrap sm:flex-nowrap">
            <div className="flex-grow flex space-x-1">
               {sortOptions.map(option => (
                   <SortButton 
                       key={option.key}
                       sortKey={option.key}
                       label={option.label}
                       isActive={sortConfig.key === option.key}
                       direction={sortConfig.direction}
                       onClick={() => onSort(option.key)}
                   />
               ))}
            </div>
        </div>
    );
};

export default SortControls;