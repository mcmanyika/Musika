import React, { useState, useEffect } from 'react';
import type { Commodity, ProducerYield } from '../types';

interface YieldFormProps {
  commodities: Commodity[];
  // FIX: Omitted 'user_id' and clarified parameter name to match the handler in App.tsx
  onAddYield: (yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => void;
}

const YieldForm: React.FC<YieldFormProps> = ({ commodities, onAddYield }) => {
  const [commodityId, setCommodityId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (commodities.length > 0 && !commodityId) {
      setCommodityId(commodities[0].id);
    }
  }, [commodities, commodityId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numQuantity = parseFloat(quantity);

    if (!commodityId || !quantity || !expectedDate) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
     if (new Date(expectedDate) <= new Date()) {
      setError('Expected date must be in the future.');
      return;
    }

    const selectedCommodity = commodities.find(c => c.id === commodityId);
    if (!selectedCommodity) {
      setError('Selected commodity not found.');
      return;
    }

    onAddYield({
      commodityName: selectedCommodity.name,
      commodityUnit: selectedCommodity.unit,
      expectedQuantity: numQuantity,
      expectedDate,
      productImage: productImage || undefined,
    });

    // Reset form
    setQuantity('');
    setExpectedDate('');
    setProductImage(null);
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="yield-commodity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Commodity
          </label>
          <select
            id="yield-commodity"
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
          <label htmlFor="yield-quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Expected Quantity (in units)
          </label>
          <input
            type="number"
            id="yield-quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 500"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="expectedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Expected Availability Date
          </label>
          <input
            type="date"
            id="expectedDate"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Product Image (Optional)
          </label>
          <div className="mt-1 flex items-center">
            <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-slate-700 dark:hover:bg-slate-600 py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          {productImage && (
            <div className="mt-4 relative">
              <img src={productImage} alt="Product preview" className="w-full h-auto rounded-md" />
              <button
                type="button"
                onClick={() => setProductImage(null)}
                className="absolute top-2 right-2 bg-white/70 dark:bg-slate-800/70 rounded-full p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>


        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Post Yield
          </button>
        </div>
      </form>
    </div>
  );
};

export default YieldForm;
