import React, { useEffect, useState } from 'react';
import type { BuyerOrder, UserProfile, UserRatingStats } from '../../types';
import { supabase } from '../../services/supabaseClient';
import RatingDisplay from '../ui/RatingDisplay';

interface BuyerDetailsModalProps {
  order: BuyerOrder;
  isOpen: boolean;
  onClose: () => void;
  userRatingStats?: UserRatingStats;
}

const BuyerDetailsModal: React.FC<BuyerDetailsModalProps> = ({ order, isOpen, onClose, userRatingStats }) => {
  const [buyerProfile, setBuyerProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && order.user_id) {
      fetchBuyerProfile();
    } else {
      setBuyerProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order.user_id]);

  const fetchBuyerProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', order.user_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching buyer profile:', error);
      } else if (data) {
        setBuyerProfile(data);
      }
    } catch (err) {
      console.error('Error fetching buyer profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buyer Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Commodity</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{order.commodityName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{order.quantity} {order.commodityUnit}(s)</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Offer Price</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatPrice(order.offerPrice)} per unit</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Total Value</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{formatPrice(order.offerPrice * order.quantity)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400">Posted</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(order.timestamp)}</p>
              </div>
              {order.yieldId && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400">Type</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">Offer on Yield</p>
                </div>
              )}
            </div>
          </div>

          {/* Buyer Profile */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Buyer Profile</h3>
            <div className="flex items-start gap-4">
              {buyerProfile?.profile_photo_url && (
                <img
                  src={buyerProfile.profile_photo_url}
                  alt={buyerProfile.full_name || order.buyerName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {buyerProfile?.full_name || order.buyerName}
                </h4>
                {buyerProfile?.full_name && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.buyerName}</p>
                )}
                {userRatingStats && (
                  <div className="mt-2">
                    <RatingDisplay
                      ratingStats={userRatingStats}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(buyerProfile?.phone || buyerProfile?.address || buyerProfile?.city || buyerProfile?.country) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                {buyerProfile.phone && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{buyerProfile.phone}</p>
                  </div>
                )}
                {(buyerProfile.address || buyerProfile.city || buyerProfile.country) && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {[buyerProfile.address, buyerProfile.city, buyerProfile.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Business Information */}
          {(buyerProfile?.business_name || buyerProfile?.business_type || buyerProfile?.business_address) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Business Information</h3>
              <div className="space-y-2 text-sm">
                {buyerProfile.business_name && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Name</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{buyerProfile.business_name}</p>
                  </div>
                )}
                {buyerProfile.business_type && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Type</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{buyerProfile.business_type}</p>
                  </div>
                )}
                {buyerProfile.registration_number && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Registration Number</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{buyerProfile.registration_number}</p>
                  </div>
                )}
                {buyerProfile.business_address && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Address</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{buyerProfile.business_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">Loading buyer profile...</p>
            </div>
          )}

          {/* No Profile Information */}
          {!isLoading && !buyerProfile && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <p>No additional profile information available.</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerDetailsModal;
