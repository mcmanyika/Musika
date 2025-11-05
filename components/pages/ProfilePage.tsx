import React, { useState, useEffect } from 'react';
import type { UserProfile, UserRatingStats } from '../../types';
import { supabase } from '../../services/supabaseClient';
import RatingDisplay from '../ui/RatingDisplay';

interface ProfilePageProps {
  currentUserId: string;
  profile: UserProfile | null;
  ratingStats: UserRatingStats | null;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUserId, profile, ratingStats, onSave, onClose }) => {
  // Basic Information
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  
  // Business Information
  const [businessName, setBusinessName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [businessAddress, setBusinessAddress] = useState<string>('');
  
  // Profile Photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setBusinessName(profile.business_name || '');
      setBusinessType(profile.business_type || '');
      setRegistrationNumber(profile.registration_number || '');
      setBusinessAddress(profile.business_address || '');
      setProfilePhotoUrl(profile.profile_photo_url || null);
    }
  }, [profile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5242880) {
        setError('Profile photo must be less than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      let finalPhotoUrl = profilePhotoUrl;
      
      // If a new photo was selected, upload it to Supabase Storage
      if (profilePhoto && profilePhoto.startsWith('data:image')) {
        try {
          // Convert base64 to blob
          const fileExt = profilePhoto.split(';')[0].split('/')[1];
          const fileName = `${currentUserId}/profile.${fileExt}`;
          const arr = profilePhoto.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const file = new Blob([u8arr], { type: mime });
          
          // Upload to storage (with upsert to replace existing)
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file, {
              contentType: `image/${fileExt}`,
              upsert: true
            });
          
          if (uploadError) {
            throw new Error(`Photo upload failed: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          
          finalPhotoUrl = publicUrl;
        } catch (photoErr: any) {
          setError(`Failed to upload photo: ${photoErr.message}`);
          setIsLoading(false);
          return;
        }
      }

      await onSave({
        user_id: currentUserId,
        full_name: fullName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        business_name: businessName || undefined,
        business_type: businessType || undefined,
        registration_number: registrationNumber || undefined,
        business_address: businessAddress || undefined,
        profile_photo_url: finalPhotoUrl || undefined,
      });
      
      setSuccess('Profile saved successfully!');
      setProfilePhoto(null); // Clear the temp photo after save
      setProfilePhotoUrl(finalPhotoUrl || null); // Update displayed photo
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profile Settings</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Rating Statistics Section */}
          <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Rating Statistics</h3>
            <RatingDisplay ratingStats={ratingStats} showDetails={true} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Profile Photo</h3>
              <div className="flex items-center space-x-6">
                {(profilePhoto || profilePhotoUrl) && (
                  <div className="flex-shrink-0">
                    <img
                      src={profilePhoto || profilePhotoUrl || ''}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label htmlFor="profile-photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Upload Profile Photo
                  </label>
                  <input
                    type="file"
                    id="profile-photo"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-300"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Maximum file size: 5MB</p>
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g., +263 77 123 4567"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g., Harare"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g., Zimbabwe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Address
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="business-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <label htmlFor="business-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Business Type
                  </label>
                  <input
                    type="text"
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g., Producer, Buyer, Trader"
                  />
                </div>
                <div>
                  <label htmlFor="registration-number" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="registration-number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter registration number (optional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="business-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Business Address
                  </label>
                  <textarea
                    id="business-address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Enter your business address"
                  />
                </div>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md p-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
