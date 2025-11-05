import React, { useState, useEffect } from 'react';
import type { Commodity, ProducerYield } from '../../types';

interface EditYieldModalProps {
  yieldPost: ProducerYield;
  commodities: Commodity[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateYield: (id: string, yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => Promise<void>;
}

const EditYieldModal: React.FC<EditYieldModalProps> = ({ yieldPost, commodities, isOpen, onClose, onUpdateYield }) => {
  const [commodityId, setCommodityId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && yieldPost) {
      // Find commodity by name
      const commodity = commodities.find(c => c.name === yieldPost.commodityName);
      setCommodityId(commodity?.id || '');
      setQuantity(yieldPost.expectedQuantity.toString());
      setExpectedDate(yieldPost.expectedDate);
      setProductImage(yieldPost.productImage || null);
      setError(null);
    }
  }, [isOpen, yieldPost, commodities]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const numQuantity = parseFloat(quantity);

    if (!commodityId || !quantity || !expectedDate) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid quantity.');
      setIsSubmitting(false);
      return;
    }
    if (new Date(expectedDate) <= new Date()) {
      setError('Expected date must be in the future.');
      setIsSubmitting(false);
      return;
    }

    const selectedCommodity = commodities.find(c => c.id === commodityId);
    if (!selectedCommodity) {
      setError('Selected commodity not found.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onUpdateYield(yieldPost.id, {
        commodityName: selectedCommodity.name,
        commodityUnit: selectedCommodity.unit,
        expectedQuantity: numQuantity,
        expectedDate,
        productImage: productImage || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update yield. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Yield Listing</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-commodity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Commodity
            </label>
            <select
              id="edit-commodity"
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
            <label htmlFor="edit-quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Expected Quantity (in units)
            </label>
            <input
              type="number"
              id="edit-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 500"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="edit-expectedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Expected Availability Date
            </label>
            <input
              type="date"
              id="edit-expectedDate"
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
              <label htmlFor="edit-file-upload" className="cursor-pointer bg-white dark:bg-slate-700 dark:hover:bg-slate-600 py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                <span>Upload a file</span>
                <input
                  id="edit-file-upload"
                  name="edit-file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {productImage && (
              <div className="mt-4 relative">
                <img src={productImage} alt="Product preview" className="w-full h-auto rounded-md max-h-48 object-cover" />
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Yield'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditYieldModal;
