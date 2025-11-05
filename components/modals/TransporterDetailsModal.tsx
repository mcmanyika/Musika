import React, { useEffect, useState } from 'react';
import type { TransportBid, UserProfile, UserRatingStats } from '../../types';
import { supabase } from '../../services/supabaseClient';
import RatingDisplay from '../ui/RatingDisplay';

interface TransporterDetailsModalProps {
  transportBid: TransportBid;
  isOpen: boolean;
  onClose: () => void;
  userRatingStats?: UserRatingStats;
}

const TransporterDetailsModal: React.FC<TransporterDetailsModalProps> = ({ transportBid, isOpen, onClose, userRatingStats }) => {
  const [transporterProfile, setTransporterProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && transportBid.user_id) {
      fetchTransporterProfile();
    } else {
      setTransporterProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transportBid.user_id]);

  const fetchTransporterProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', transportBid.user_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching transporter profile:', error);
      } else if (data) {
        setTransporterProfile(data);
      }
    } catch (err) {
      console.error('Error fetching transporter profile:', err);
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Transporter Details</h2>
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
          {/* Transport Bid Information */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Transport Bid Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Bid Amount</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatPrice(transportBid.bidAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Estimated Delivery</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(transportBid.estimatedDeliveryDate)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400">Bid Posted</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{formatDate(transportBid.timestamp)}</p>
              </div>
            </div>
          </div>

          {/* Transporter Profile */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Transporter Profile</h3>
            <div className="flex items-start gap-4">
              {transporterProfile?.profile_photo_url && (
                <img
                  src={transporterProfile.profile_photo_url}
                  alt={transporterProfile.full_name || transportBid.transporterName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {transporterProfile?.full_name || transportBid.transporterName}
                </h4>
                {transporterProfile?.full_name && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{transportBid.transporterName}</p>
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
          {(transporterProfile?.phone || transporterProfile?.address || transporterProfile?.city || transporterProfile?.country) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                {transporterProfile.phone && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{transporterProfile.phone}</p>
                  </div>
                )}
                {(transporterProfile.address || transporterProfile.city || transporterProfile.country) && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {[transporterProfile.address, transporterProfile.city, transporterProfile.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Business Information */}
          {(transporterProfile?.business_name || transporterProfile?.business_type || transporterProfile?.business_address) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Business Information</h3>
              <div className="space-y-2 text-sm">
                {transporterProfile.business_name && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Name</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{transporterProfile.business_name}</p>
                  </div>
                )}
                {transporterProfile.business_type && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Type</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{transporterProfile.business_type}</p>
                  </div>
                )}
                {transporterProfile.registration_number && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Registration Number</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{transporterProfile.registration_number}</p>
                  </div>
                )}
                {transporterProfile.business_address && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Business Address</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{transporterProfile.business_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">Loading transporter profile...</p>
            </div>
          )}

          {/* No Profile Information */}
          {!isLoading && !transporterProfile && (
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

export default TransporterDetailsModal;
