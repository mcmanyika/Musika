
import React from 'react';
import type { Commodity, Theme } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  commodity: Commodity;
  theme: Theme;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
                <p className="label font-semibold text-slate-700 dark:text-slate-200">{`${label}`}</p>
                <p className="intro text-emerald-600 dark:text-emerald-400">{`Price: $${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ commodity, theme }) => {
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'; // slate-400 vs slate-500
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 vs slate-200

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-96">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">{commodity.name} - Price History</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Last 7 Days (per {commodity.unit})</p>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={commodity.history}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" stroke={tickColor} tick={{ fontSize: 12 }} />
          <YAxis stroke={tickColor} tick={{ fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "14px", color: tickColor}} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            strokeWidth={2} 
            activeDot={{ r: 8, fill: '#10b981' }} 
            dot={{ r: 4, fill: '#10b981' }}
            name="Price (USD)"
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;