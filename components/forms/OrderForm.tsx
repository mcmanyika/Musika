import React, { useState, useEffect } from 'react';
import type { Commodity, BuyerOrder } from '../../types';

interface OrderFormProps {
  commodities: Commodity[];
  // FIX: Omitted 'user_id' to match the handler in App.tsx
  onAddOrder: (order: Omit<BuyerOrder, 'id' | 'timestamp' | 'buyerName' | 'user_id'>) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ commodities, onAddOrder }) => {
  const [commodityId, setCommodityId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (commodities.length > 0 && !commodityId) {
      setCommodityId(commodities[0].id);
    }
  }, [commodities, commodityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numQuantity = parseFloat(quantity);
    const numOfferPrice = parseFloat(offerPrice);

    if (!commodityId || !quantity || !offerPrice) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    if (isNaN(numOfferPrice) || numOfferPrice <= 0) {
      setError('Please enter a valid offer price.');
      return;
    }

    const selectedCommodity = commodities.find(c => c.id === commodityId);
    if (!selectedCommodity) {
      setError('Selected commodity not found.');
      return;
    }

    onAddOrder({
      commodityName: selectedCommodity.name,
      commodityUnit: selectedCommodity.unit,
      quantity: numQuantity,
      offerPrice: numOfferPrice,
    });

    // Reset form
    setQuantity('');
    setOfferPrice('');
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="commodity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Commodity
          </label>
          <select
            id="commodity"
            value={commodityId}
            onChange={(e) => setCommodityId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
          >
            {commodities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Quantity (in units)
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 10"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="offerPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Offer Price (USD per unit)
          </label>
          <input
            type="number"
            id="offerPrice"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            step="0.01"
            placeholder="e.g., 1.50"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Post Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
