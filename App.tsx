
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// FIX: Import User from local types file.
import type { Commodity, BuyerOrder, ProducerYield, Theme, TransportBid, User, UserProfile, Rating, TransactionHistory, UserRatingStats } from './types';
import { supabase } from './services/supabaseClient';
// Removed Gemini import - now fetching from Supabase
import { dummyCommodities, dummyYields, dummyOrders, dummyTransportBids } from './services/dummyData';
import { Header } from './components/layout/Header';
import LoadingSpinner from './components/layout/LoadingSpinner';
import Tabs from './components/layout/Tabs';
import AuthModal from './components/modals/AuthModal';
import OfferModal from './components/modals/OfferModal';
import TransportBidModal from './components/modals/TransportBidModal';
import YieldForm from './components/forms/YieldForm';
import OrderForm from './components/forms/OrderForm';
import YieldList from './components/lists/YieldList';
import OrderList from './components/lists/OrderList';
import TransportList from './components/lists/TransportList';
import CommodityList from './components/lists/CommodityList';
import CompactCommodityList from './components/lists/CompactCommodityList';
import PriceChart from './components/charts/PriceChart';
import SearchInput from './components/ui/SearchInput';
import SortControls from './components/ui/SortControls';
import Pagination from './components/ui/Pagination';
import ProfilePage from './components/pages/ProfilePage';
import MyTransactionsPage from './components/pages/MyTransactionsPage';
import MyListingsPage from './components/pages/MyListingsPage';
import RatingModal from './components/modals/RatingModal';
import TransporterDetailsModal from './components/modals/TransporterDetailsModal';


type Tab = 'orders' | 'yields' | 'prices' | 'transport' | 'transactions' | 'listings';
export type SortKey = 'name' | 'price' | 'priceChange';
export type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  // FIX: Corrected typo from Commodority to Commodity.
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [yields, setYields] = useState<ProducerYield[]>([]);
  const [transportBids, setTransportBids] = useState<TransportBid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start as false to show UI immediately
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('yields');
  const [offerModalYield, setOfferModalYield] = useState<ProducerYield | null>(null);
  const [bidModalDeal, setBidModalDeal] = useState<BuyerOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [yieldsPage, setYieldsPage] = useState<number>(1);
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [transportPage, setTransportPage] = useState<number>(1);
  const itemsPerPage = 10; // Number of items per page
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [ratingStats, setRatingStats] = useState<UserRatingStats | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [ratingModalTransaction, setRatingModalTransaction] = useState<TransactionHistory | null>(null);
  const [ratingModalType, setRatingModalType] = useState<'buyer_to_seller' | 'seller_to_buyer' | null>(null);
  const [selectedTransportBidForModal, setSelectedTransportBidForModal] = useState<TransportBid | null>(null);
  const [isTransporterDetailsModalOpen, setIsTransporterDetailsModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Supabase Auth Listener
  useEffect(() => {
    setIsSessionLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(session?.user ?? null);
        setIsSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Supabase Real-time Subscriptions
  useEffect(() => {
      if (!currentUser) return; // Don't subscribe if not logged in

      const yieldChannel = supabase.channel('public:producer_yields')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'producer_yields' }, () => fetchYields())
        .subscribe();
        
      const orderChannel = supabase.channel('public:buyer_orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_orders' }, () => fetchOrders())
        .subscribe();

      const bidChannel = supabase.channel('public:transport_bids')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_bids' }, () => fetchTransportBids())
        .subscribe();

      return () => {
          supabase.removeChannel(yieldChannel);
          supabase.removeChannel(orderChannel);
          supabase.removeChannel(bidChannel);
      };
  }, [currentUser]);

  const fetchYields = async () => {
      // Optimize query: limit results and select only needed columns
      const { data, error } = await supabase
          .from('producer_yields')
          .select('id, user_id, commodityname, commodityunit, expectedquantity, expecteddate, producername, productimage, timestamp')
          .order('timestamp', { ascending: false })
          .limit(100); // Limit to most recent 100 items
      
      if (error) {
          console.error('Error fetching yields:', error);
          return;
      }
      
      // Transform database columns (lowercase) to camelCase to match TypeScript interface
      const transformedData = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          commodityName: item.commodityname || item.commodityName,
          commodityUnit: item.commodityunit || item.commodityUnit,
          expectedQuantity: item.expectedquantity || item.expectedQuantity,
          expectedDate: item.expecteddate || item.expectedDate,
          producerName: item.producername || item.producerName,
          productImage: item.productimage || item.productImage,
          timestamp: item.timestamp,
      }));
      
      setYields(transformedData);
  };
  const fetchOrders = async () => {
      // Optimize query: limit results and select only needed columns
      const { data, error } = await supabase
          .from('buyer_orders')
          .select('id, user_id, commodityname, commodityunit, quantity, offerprice, buyername, yieldid, producername, timestamp')
          .order('timestamp', { ascending: false })
          .limit(100); // Limit to most recent 100 items
      
      if (error) {
          console.error('Error fetching orders:', error);
          return;
      }
      
      // Transform database columns (lowercase) to camelCase to match TypeScript interface
      const transformedData = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          commodityName: item.commodityname || item.commodityName,
          commodityUnit: item.commodityunit || item.commodityUnit,
          quantity: item.quantity,
          offerPrice: item.offerprice || item.offerPrice,
          buyerName: item.buyername || item.buyerName,
          yieldId: item.yieldid || item.yieldId,
          producerName: item.producername || item.producerName,
          timestamp: item.timestamp,
      }));
      
      setOrders(transformedData);
  };
  const fetchTransportBids = async () => {
      // Optimize query: limit results and select only needed columns
      const { data, error } = await supabase
          .from('transport_bids')
          .select('id, user_id, orderid, transportername, bidamount, estimateddeliverydate, timestamp')
          .order('timestamp', { ascending: false })
          .limit(100); // Limit to most recent 100 items
      
      if (error) {
          console.error('Error fetching bids:', error);
          return;
      }
      
      // Transform database columns (lowercase) to camelCase to match TypeScript interface
      const transformedData = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          orderId: item.orderid || item.orderId,
          transporterName: item.transportername || item.transporterName,
          bidAmount: item.bidamount || item.bidAmount,
          estimatedDeliveryDate: item.estimateddeliverydate || item.estimatedDeliveryDate,
          timestamp: item.timestamp,
      }));
      
      setTransportBids(transformedData);
  };
  
  const fetchInitialData = useCallback(async () => {
      await Promise.all([
          fetchYields(),
          fetchOrders(),
          fetchTransportBids(),
          fetchRatings(),
          fetchTransactions()
      ]);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (data) {
      // Transform database columns to match TypeScript interface
      const transformedProfile: UserProfile = {
        user_id: data.user_id,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        business_name: data.business_name,
        business_type: data.business_type,
        registration_number: data.registration_number,
        business_address: data.business_address,
        profile_photo_url: data.profile_photo_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      return transformedProfile;
    }
    return null;
  };

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return;
    }

    const transformedData = (data || []).map((item: any) => ({
      id: item.id,
      transaction_id: item.transaction_id,
      rater_id: item.rater_id,
      rated_user_id: item.rated_user_id,
      rating_type: item.rating_type,
      quality_rating: item.quality_rating,
      communication_rating: item.communication_rating,
      timeliness_rating: item.timeliness_rating,
      overall_rating: parseFloat(item.overall_rating) || 0,
      review_text: item.review_text,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    setRatings(transformedData);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    const transformedData = (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      yield_id: item.yield_id,
      buyer_id: item.buyer_id,
      seller_id: item.seller_id,
      transport_bid_id: item.transport_bid_id,
      status: item.status,
      completed_at: item.completed_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    setTransactions(transformedData);
  };

  const fetchRatingStats = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_user_rating_stats', { user_uuid: userId });

    if (error) {
      console.error('Error fetching rating stats:', error);
      return null;
    }

    if (data && data.length > 0) {
      const stats = data[0];
      return {
        user_id: userId,
        total_ratings: parseInt(stats.total_ratings) || 0,
        average_overall: parseFloat(stats.average_overall) || 0,
        average_quality: parseFloat(stats.average_quality) || 0,
        average_communication: parseFloat(stats.average_communication) || 0,
        average_timeliness: parseFloat(stats.average_timeliness) || 0,
      };
    }
    return null;
  };

  const handleRateTransaction = async (transaction: TransactionHistory, ratingType: 'buyer_to_seller' | 'seller_to_buyer') => {
    setRatingModalTransaction(transaction);
    setRatingModalType(ratingType);
    setRatingModalOpen(true);
  };

  const handleSaveRating = async (ratingData: Omit<Rating, 'id' | 'created_at' | 'updated_at' | 'overall_rating'>) => {
    if (!currentUser) return;

    // Check if rating already exists
    const existingRating = ratings.find(
      r => r.transaction_id === ratingData.transaction_id &&
           r.rater_id === ratingData.rater_id &&
           r.rating_type === ratingData.rating_type
    );

    if (existingRating) {
      // Update existing rating
      const { error } = await supabase
        .from('ratings')
        .update({
          quality_rating: ratingData.quality_rating,
          communication_rating: ratingData.communication_rating,
          timeliness_rating: ratingData.timeliness_rating,
          review_text: ratingData.review_text,
        })
        .eq('id', existingRating.id);

      if (error) {
        console.error('Error updating rating:', error);
        throw new Error(`Failed to update rating: ${error.message}`);
      }
    } else {
      // Insert new rating
      const { error } = await supabase
        .from('ratings')
        .insert({
          transaction_id: ratingData.transaction_id,
          rater_id: ratingData.rater_id,
          rated_user_id: ratingData.rated_user_id,
          rating_type: ratingData.rating_type,
          quality_rating: ratingData.quality_rating,
          communication_rating: ratingData.communication_rating,
          timeliness_rating: ratingData.timeliness_rating,
          review_text: ratingData.review_text,
        });

      if (error) {
        console.error('Error saving rating:', error);
        throw new Error(`Failed to save rating: ${error.message}`);
      }
    }

    // Refresh ratings and stats
    await fetchRatings();
    if (currentUser) {
      const stats = await fetchRatingStats(currentUser.id);
      setRatingStats(stats);
    }
  };

  const handleProfileClick = async () => {
    if (!currentUser) return;
    
    // Load profile if not already loaded
    if (!userProfile) {
      const profile = await fetchUserProfile(currentUser.id);
      setUserProfile(profile);
    }
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    if (!currentUser) return;

    let profilePhotoUrl = profileData.profile_photo_url;
    
    // Handle profile photo upload if a new photo was selected
    // Check if ProfilePage passed a base64 image (will need to update ProfilePage to pass it)
    // For now, we'll handle it in the ProfilePage component itself via a separate handler
    
    // Prepare data for upsert (all lowercase column names)
    const insertData: any = {
      user_id: currentUser.id,
    };

    if (profileData.full_name !== undefined) insertData.full_name = profileData.full_name;
    if (profileData.phone !== undefined) insertData.phone = profileData.phone;
    if (profileData.address !== undefined) insertData.address = profileData.address;
    if (profileData.city !== undefined) insertData.city = profileData.city;
    if (profileData.country !== undefined) insertData.country = profileData.country;
    if (profileData.business_name !== undefined) insertData.business_name = profileData.business_name;
    if (profileData.business_type !== undefined) insertData.business_type = profileData.business_type;
    if (profileData.registration_number !== undefined) insertData.registration_number = profileData.registration_number;
    if (profileData.business_address !== undefined) insertData.business_address = profileData.business_address;
    if (profilePhotoUrl !== undefined) insertData.profile_photo_url = profilePhotoUrl;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(insertData, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving profile:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    // Reload profile
    const updatedProfile = await fetchUserProfile(currentUser.id);
    setUserProfile(updatedProfile);
  };


  // Track if we've loaded data for this user session
  const hasLoadedDataRef = useRef<string | null>(null);

  const fetchCommodities = async () => {
    // Fetch commodities from Supabase instead of Gemini API
    const { data, error } = await supabase
      .from('commodities')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching commodities:', error);
      return;
    }
    
    // Transform database columns (lowercase) to camelCase to match TypeScript interface
    const transformedData = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      price: parseFloat(item.price) || 0,
      priceChange: parseFloat(item.pricechange) || 0,
      history: item.history || [],
    }));
    
    return transformedData;
  };

  const loadCommodityData = useCallback(async () => {
    // Don't block UI - load commodities in background
    setError(null);
    try {
      const data = await fetchCommodities();
      if (data && data.length > 0) {
        setCommodities(data);
        setSelectedCommodity(prev => data.find(c => c.id === prev?.id) || data[0]);
      } else {
        setSelectedCommodity(null);
      }
    } catch (err: any) {
      // Only show error if commodities array is empty (non-critical error)
      const errorMessage = err?.message || 'Failed to fetch commodity prices. Please try again later.';
      if (commodities.length === 0) {
        setError(errorMessage);
      } else {
        // Silently log if we have cached data
        console.warn('Error refreshing commodity data:', err);
      }
    }
  }, [commodities.length]);

  // Fetch data only when user is logged in and hasn't loaded yet
  useEffect(() => {
    const userId = currentUser?.id;
    
    // Only load if we have a user and haven't loaded data for this user yet
    if (userId && hasLoadedDataRef.current !== userId) {
      hasLoadedDataRef.current = userId;
      
      // Load all data in parallel - don't block UI
      setIsLoading(false); // Don't show loading spinner immediately
      
      // Start fetching all data simultaneously
      Promise.all([
        fetchInitialData(), // Fetch yields, orders, bids, ratings, transactions in parallel
        loadCommodityData(), // Fetch commodities separately (may be slower)
        fetchUserProfile(userId).then(profile => {
          if (profile) setUserProfile(profile);
        }), // Load user profile
        fetchRatingStats(userId).then(stats => {
          if (stats) setRatingStats(stats);
        }) // Load rating stats
      ]).catch(err => {
        console.error('Error loading initial data:', err);
      });
      
    } else if (!userId) {
      // Reset when user logs out
      hasLoadedDataRef.current = null;
      setCommodities([]);
      setSelectedCommodity(null);
      setOrders([]);
      setYields([]);
      setTransportBids([]);
      setUserProfile(null);
      setIsLoading(false);
    }
    // Only depend on userId, not the whole currentUser object or callback functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);


  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSelectCommodity = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
  };

  const handleAddOrder = async (order: Omit<BuyerOrder, 'id' | 'timestamp' | 'buyerName' | 'user_id'>) => {
    if (!currentUser) return;
    
    // Use profile full_name if available, otherwise use email
    let buyerName = currentUser.email || '';
    if (userProfile?.full_name) {
      buyerName = userProfile.full_name;
    }
    
    // Map fields to match actual database column names (all lowercase, no underscores)
    const insertData: any = {
      commodityname: order.commodityName,
      commodityunit: order.commodityUnit,
      quantity: order.quantity,
      offerprice: order.offerPrice,
      buyername: buyerName,
      user_id: currentUser.id,
    };
    
    // Add optional fields
    if (order.yieldId) {
      insertData.yieldid = order.yieldId;
    }
    if (order.producerName) {
      insertData.producername = order.producerName;
    }
    
    const { error } = await supabase.from('buyer_orders').insert(insertData);
    if (error) {
      console.error("Error adding order:", error);
      setError(`Could not post your order: ${error.message || JSON.stringify(error)}`);
    } else {
      // Refresh orders list immediately to show the new order
      await fetchOrders();
      setOfferModalYield(null); // Close modal on success
      setError(null); // Clear any previous errors
    }
  };

  const handleAddYield = async (yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => {
    if(!currentUser) return;
    
    // Handle image upload to Supabase Storage if image is provided
    let imageUrl = yieldPost.productImage;
    if (yieldPost.productImage && yieldPost.productImage.startsWith('data:image')) {
      try {
        // Convert base64 to blob and upload to storage
        const fileExt = yieldPost.productImage.split(';')[0].split('/')[1];
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        const file = dataURLtoBlob(yieldPost.productImage);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            contentType: `image/${fileExt}`,
            upsert: false
          });
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with base64 if upload fails
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      } catch (err) {
        console.error("Error processing image:", err);
        // Continue with base64 if processing fails
      }
    }
    
    // Use profile full_name if available, otherwise use email
    let producerName = currentUser.email || '';
    if (userProfile?.full_name) {
      producerName = userProfile.full_name;
    }
    
    // Map fields to match actual database column names (all lowercase, no underscores)
    const insertData: any = {
        commodityname: yieldPost.commodityName,
        commodityunit: yieldPost.commodityUnit,
        expectedquantity: yieldPost.expectedQuantity,
        expecteddate: yieldPost.expectedDate,
        producername: producerName,
        user_id: currentUser.id,
    };
    
    // Add productimage only if provided
    if (imageUrl) {
        insertData.productimage = imageUrl;
    }
    
    const { error } = await supabase.from('producer_yields').insert(insertData);
    
    if (error) {
        console.error("Error adding yield:", error);
        setError(`Could not post your yield: ${error.message || JSON.stringify(error)}`);
        return;
    }
    
    // If we get here, the insert was successful
    console.log("Yield posted successfully");
    // Refresh yields list
    await fetchYields();
    // Reset form by clearing error state
    setError(null);
  };
  
  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleUpdateYield = async (id: string, yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => {
    if (!currentUser) return;
    
    // Handle image upload to Supabase Storage if image is provided and it's a new base64 image
    let imageUrl = yieldPost.productImage;
    if (yieldPost.productImage && yieldPost.productImage.startsWith('data:image')) {
      try {
        // Convert base64 to blob and upload to storage
        const fileExt = yieldPost.productImage.split(';')[0].split('/')[1];
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        const file = dataURLtoBlob(yieldPost.productImage);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            contentType: `image/${fileExt}`,
            upsert: false
          });
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      } catch (err: any) {
        console.error("Error processing image:", err);
        throw err;
      }
    }
    
    // Map fields to match actual database column names (all lowercase, no underscores)
    const updateData: any = {
      commodityname: yieldPost.commodityName,
      commodityunit: yieldPost.commodityUnit,
      expectedquantity: yieldPost.expectedQuantity,
      expecteddate: yieldPost.expectedDate,
    };
    
    // Add productimage only if provided
    if (imageUrl) {
      updateData.productimage = imageUrl;
    }
    
    const { error } = await supabase
      .from('producer_yields')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', currentUser.id); // Ensure user can only update their own yields
    
    if (error) {
      console.error("Error updating yield:", error);
      throw new Error(`Could not update your yield: ${error.message || JSON.stringify(error)}`);
    }
    
    // Refresh yields list
    await fetchYields();
  };
  
  const handleAddTransportBid = async (bid: Omit<TransportBid, 'id' | 'timestamp' | 'transporterName' | 'user_id'>) => {
    if (!currentUser) return;
    
    // Use profile full_name if available, otherwise use email
    let transporterName = currentUser.email || '';
    if (userProfile?.full_name) {
      transporterName = userProfile.full_name;
    }
    
    // Map fields to match actual database column names (all lowercase, no underscores)
    const insertData: any = {
      orderid: bid.orderId,
      transportername: transporterName,
      bidamount: bid.bidAmount,
      estimateddeliverydate: bid.estimatedDeliveryDate,
      user_id: currentUser.id,
    };
    
    const { error } = await supabase.from('transport_bids').insert(insertData);
    if (error) {
        console.error("Error adding transport bid:", error);
        setError(`Could not post your bid: ${error.message || JSON.stringify(error)}`);
    } else {
        // Refresh transport bids list immediately to show the new bid
        await fetchTransportBids();
        setBidModalDeal(null); // Close modal
        setError(null); // Clear any previous errors
    }
  }

  const handleOpenOfferModal = (yieldPost: ProducerYield) => {
    setOfferModalYield(yieldPost);
  };

  const handleCloseOfferModal = () => {
    setOfferModalYield(null);
  };
  
  const handleOpenBidModal = (deal: BuyerOrder) => {
    setBidModalDeal(deal);
  }
  
  const handleCloseBidModal = () => {
    setBidModalDeal(null);
  }

  const handleAcceptTransportBid = async (bid: TransportBid) => {
    if (!currentUser) return;

    try {
      // Find the order and yield for this bid
      const order = orders.find(o => o.id === bid.orderId);
      if (!order || !order.yieldId) {
        throw new Error('Order or yield not found');
      }

      const yieldPost = yields.find(y => y.id === order.yieldId);
      if (!yieldPost) {
        throw new Error('Yield post not found');
      }

      // Check if current user is the seller (producer)
      if (yieldPost.user_id !== currentUser.id) {
        throw new Error('Only the seller can accept transport bids');
      }

      // Check if transaction already exists for this order
      // Try both snake_case and camelCase column names
      const { data: existingTransaction } = await supabase
        .from('transaction_history')
        .select('id, transport_bid_id')
        .eq('order_id', order.id)
        .maybeSingle();

      if (existingTransaction) {
        // Update existing transaction with the accepted bid
        const updateData: any = {
          status: 'pending',
        };
        
        // Use the correct column name based on database schema
        if (existingTransaction.transport_bid_id !== undefined) {
          updateData.transport_bid_id = bid.id;
        } else {
          // Try alternative column name
          updateData.transportbidid = bid.id;
        }
        
        const { error: updateError } = await supabase
          .from('transaction_history')
          .update(updateData)
          .eq('id', existingTransaction.id);

        if (updateError) {
          throw new Error(`Failed to accept bid: ${updateError.message}`);
        }
      } else {
        // Create new transaction with accepted bid
        // Use snake_case column names as per database schema
        const insertData: any = {
          order_id: order.id,
          yield_id: yieldPost.id,
          buyer_id: order.user_id,
          seller_id: yieldPost.user_id,
          transport_bid_id: bid.id,
          status: 'pending',
        };

        const { error: insertError } = await supabase
          .from('transaction_history')
          .insert(insertData);

        if (insertError) {
          throw new Error(`Failed to accept bid: ${insertError.message}`);
        }
      }

      // Refresh transactions and transport bids to show updated state
      await Promise.all([
        fetchTransactions(),
        fetchTransportBids()
      ]);
      setError(null);
      // Optionally show a success notification
    } catch (err: any) {
      console.error('Error accepting transport bid:', err);
      setError(err.message || 'Failed to accept transport bid. Please try again.');
    }
  }

  const handleSignIn = async (email: string) => {
    // FIX: Add `emailRedirectTo` to ensure the magic link returns to the correct application URL,
    // not the default localhost:3000.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
        console.error('Error signing in:', error);
        throw error;
    }
  };

  const handleSignOut = async () => {
    // FIX: A type error on this line is likely a symptom of a broader type resolution issue.
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCommodities([]);
    setSelectedCommodity(null);
    setOrders([]);
    setYields([]);
    setTransportBids([]);
  };
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery(''); // Reset search on tab change
    // Reset pagination when switching tabs
    setYieldsPage(1);
    setOrdersPage(1);
    setTransportPage(1);
  };

  // Reset pagination when search query changes
  useEffect(() => {
    setYieldsPage(1);
    setOrdersPage(1);
    setTransportPage(1);
  }, [searchQuery]);

  const handleSortRequest = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handlePreloadData = async () => {
    if (!currentUser) return;
    setIsPreloading(true);
    setError(null);
    try {
        // 1. Load commodity data locally
        setCommodities(dummyCommodities);
        setSelectedCommodity(dummyCommodities[0]);

        // 2. Insert yields
        const yieldsToInsert = dummyYields.map(y => ({ ...y, user_id: currentUser.id, producerName: currentUser.email }));
        const { data: insertedYields, error: yieldError } = await supabase.from('producer_yields').insert(yieldsToInsert).select();
        if (yieldError) throw yieldError;

        // 3. Create a map of temp ID to new DB ID for yields
        const yieldIdMap: { [key: string]: string } = {};
        insertedYields.forEach((yieldRecord: any) => {
            const original = dummyYields.find(dy => dy.commodityName === yieldRecord.commodityName);
            if(original && original._id) {
               yieldIdMap[original._id] = yieldRecord.id;
            }
        });
        
        // 4. Insert orders, linking to yields where applicable
        const ordersToInsert = dummyOrders.map(o => ({
            ...o,
            user_id: currentUser.id,
            buyerName: currentUser.email,
            // Replace temporary yieldId with the new database ID
            yieldId: o.yieldId ? yieldIdMap[o.yieldId] : undefined,
            // Find the producer name from the original dummy yield
            producerName: o.yieldId ? dummyYields.find(y => y._id === o.yieldId)?.producerName : undefined
        }));
        const { data: insertedOrders, error: orderError } = await supabase.from('buyer_orders').insert(ordersToInsert).select();
        if (orderError) throw orderError;
        
        // 5. Create a map for order IDs
        const orderIdMap: { [key: string]: string } = {};
        insertedOrders.forEach((orderRecord: any) => {
            const original = dummyOrders.find(o => o.commodityName === orderRecord.commodityName && o.quantity === orderRecord.quantity);
            if(original && original._id) {
                orderIdMap[original._id] = orderRecord.id;
            }
        });
        
        // 6. Insert transport bids, linking to orders
        const bidsToInsert = dummyTransportBids.map(b => ({
            ...b,
            user_id: currentUser.id,
            transporterName: currentUser.email,
            orderId: b.orderId ? orderIdMap[b.orderId] : ''
        })).filter(b => b.orderId); // Ensure we only insert valid bids
        
        if (bidsToInsert.length > 0) {
            const { error: bidError } = await supabase.from('transport_bids').insert(bidsToInsert);
            if (bidError) throw bidError;
        }

        // 7. Refresh data from DB
        await fetchInitialData();

    } catch (err: any) {
        console.error("Error preloading data:", err);
        setError("Failed to load sample data. Please try again.");
    } finally {
        setIsPreloading(false);
    }
  };

  // Create a map of user_id -> rating stats for quick lookup
  const userRatingStatsMap = useMemo(() => {
    const statsMap: Record<string, UserRatingStats> = {};
    
    ratings.forEach(rating => {
      const userId = rating.rated_user_id;
      if (!statsMap[userId]) {
        statsMap[userId] = {
          user_id: userId,
          total_ratings: 0,
          average_overall: 0,
          average_quality: 0,
          average_communication: 0,
          average_timeliness: 0,
        };
      }
      
      const stats = statsMap[userId];
      stats.total_ratings += 1;
      stats.average_overall = (stats.average_overall * (stats.total_ratings - 1) + rating.overall_rating) / stats.total_ratings;
      stats.average_quality = (stats.average_quality * (stats.total_ratings - 1) + rating.quality_rating) / stats.total_ratings;
      stats.average_communication = (stats.average_communication * (stats.total_ratings - 1) + rating.communication_rating) / stats.total_ratings;
      stats.average_timeliness = (stats.average_timeliness * (stats.total_ratings - 1) + rating.timeliness_rating) / stats.total_ratings;
    });
    
    return statsMap;
  }, [ratings]);

  // Filtering logic
  const filteredCommodities = useMemo(() => {
    if (!searchQuery) return commodities;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return commodities.filter(c => 
      c.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [commodities, searchQuery]);

  // Sorting logic
  const sortedAndFilteredCommodities = useMemo(() => {
    const sortableItems = [...filteredCommodities];
    sortableItems.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sortableItems;
  }, [filteredCommodities, sortConfig]);


  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return orders.filter(o =>
      o.commodityName.toLowerCase().includes(lowerCaseQuery) ||
      o.buyerName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [orders, searchQuery]);

  const filteredYields = useMemo(() => {
    if (!searchQuery) return yields;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return yields.filter(y =>
      y.commodityName.toLowerCase().includes(lowerCaseQuery) ||
      y.producerName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [yields, searchQuery]);

  // Paginated yields
  const paginatedYields = useMemo(() => {
    const startIndex = (yieldsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredYields.slice(startIndex, endIndex);
  }, [filteredYields, yieldsPage, itemsPerPage]);
  
  const completedDeals = useMemo(() => {
    return orders.filter(o => !!o.yieldId);
  }, [orders]);

  const filteredDeals = useMemo(() => {
      if (!searchQuery) return completedDeals;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return completedDeals.filter(d =>
          d.commodityName.toLowerCase().includes(lowerCaseQuery) ||
          d.producerName?.toLowerCase().includes(lowerCaseQuery) ||
          d.buyerName.toLowerCase().includes(lowerCaseQuery)
      );
  }, [completedDeals, searchQuery]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (ordersPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, ordersPage, itemsPerPage]);

  // Paginated transport deals
  const paginatedDeals = useMemo(() => {
    const startIndex = (transportPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDeals.slice(startIndex, endIndex);
  }, [filteredDeals, transportPage, itemsPerPage]);

  const getSearchPlaceholder = (tab: Tab): string => {
    switch (tab) {
        case 'prices':
            return 'Search commodities by name...';
        case 'orders':
            return 'Search orders by commodity or buyer...';
        case 'yields':
            return 'Search yields by commodity or producer...';
        case 'transport':
            return 'Search gigs by commodity, producer, or buyer...';
        case 'listings':
        case 'transactions':
            return 'Search...';
        default:
            return 'Search...';
    }
  };


  const renderContent = () => {
    // Show error if critical and no data available
    if (error && commodities.length === 0 && yields.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-xl font-semibold">An Error Occurred</p>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      );
    }

    // Only show "no data" message if we have no commodities and no other data
    if (commodities.length === 0 && yields.length === 0 && orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Loading market data...</p>
        </div>
      );
    }

    return (
      <>
                  <Tabs activeTab={activeTab} onTabClick={handleTabChange} isAuthenticated={!!currentUser} />
        <div className="mt-6">
          {(activeTab !== 'listings' && activeTab !== 'transactions') && (
            <div className="mb-6">
              <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSearchPlaceholder(activeTab)} 
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">General Buyer Request</h2>
                <OrderForm commodities={commodities} onAddOrder={handleAddOrder} />
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Live Buyer Orders & Offers</h2>
                <OrderList 
                    orders={paginatedOrders} 
                    searchQuery={searchQuery}
                    isPreloading={isPreloading}
                    onPreloadData={handlePreloadData}
                    userRatingStatsMap={userRatingStatsMap}
                />
                {filteredOrders.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={ordersPage}
                      totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
                      onPageChange={setOrdersPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredOrders.length}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'yields' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Expected Yield</h2>
                  <YieldForm commodities={commodities} onAddYield={handleAddYield} />
                </div>
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Producer Yield Postings</h2>
                  <YieldList 
                    yields={paginatedYields} 
                    orders={orders} 
                    onMakeOffer={handleOpenOfferModal} 
                    searchQuery={searchQuery}
                    isPreloading={isPreloading}
                    onPreloadData={handlePreloadData}
                    userRatingStatsMap={userRatingStatsMap}
                  />
                  {filteredYields.length > 0 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={yieldsPage}
                        totalPages={Math.ceil(filteredYields.length / itemsPerPage)}
                        onPageChange={setYieldsPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredYields.length}
                      />
                    </div>
                  )}
                </div>
              </div>
          )}
          
          {activeTab === 'prices' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Select Commodity</h2>
                <CompactCommodityList
                  commodities={sortedAndFilteredCommodities}
                  selectedCommodityId={selectedCommodity?.id}
                  onSelectCommodity={handleSelectCommodity}
                />
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Detailed Market Data</h2>
                <div className="space-y-8">
                  <CommodityList
                    commodities={sortedAndFilteredCommodities}
                    selectedCommodityId={selectedCommodity?.id}
                    onSelectCommodity={handleSelectCommodity}
                    searchQuery={searchQuery}
                    sortConfig={sortConfig}
                    onSort={handleSortRequest}
                  />
                  {selectedCommodity && <PriceChart commodity={selectedCommodity} theme={theme} />}
                </div>
              </div>
           </div>
          )}

          {activeTab === 'transport' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Available Transport Gigs</h2>
               <TransportList
                  deals={paginatedDeals}
                  bids={transportBids}
                  onPlaceBid={handleOpenBidModal}
                  searchQuery={searchQuery}
                  yields={yields}
                  userRatingStatsMap={userRatingStatsMap}
                  onViewTransporter={(bid) => {
                    setSelectedTransportBidForModal(bid);
                    setIsTransporterDetailsModalOpen(true);
                  }}
                  onAcceptBid={handleAcceptTransportBid}
                  currentUserId={currentUser?.id}
                  transactions={transactions}
               />
               {filteredDeals.length > 0 && (
                 <div className="mt-4">
                   <Pagination
                     currentPage={transportPage}
                     totalPages={Math.ceil(filteredDeals.length / itemsPerPage)}
                     onPageChange={setTransportPage}
                     itemsPerPage={itemsPerPage}
                     totalItems={filteredDeals.length}
                   />
                 </div>
               )}
            </div>
          )}

          {activeTab === 'listings' && currentUser && (
            <div>
              <MyListingsPage
                yields={yields}
                orders={orders}
                transportBids={transportBids}
                commodities={commodities}
                currentUserId={currentUser.id}
                userRatingStatsMap={userRatingStatsMap}
                itemsPerPage={itemsPerPage}
                onMakeOffer={handleOpenOfferModal}
                onUpdateYield={handleUpdateYield}
              />
            </div>
          )}

          {activeTab === 'transactions' && currentUser && (
            <div>
              <MyTransactionsPage
                transactions={transactions}
                ratings={ratings}
                currentUserId={currentUser.id}
                onRateTransaction={handleRateTransaction}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  if (isSessionLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <Header 
        currentUser={currentUser} 
        userProfile={userProfile}
        onSignOut={handleSignOut} 
        theme={theme} 
        onThemeToggle={handleThemeToggle}
        onProfileClick={currentUser ? handleProfileClick : undefined}
      />
      {showProfile && currentUser ? (
        <ProfilePage
          currentUserId={currentUser.id}
          profile={userProfile}
          ratingStats={ratingStats}
          onSave={handleSaveProfile}
          onClose={handleCloseProfile}
        />
      ) : (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {!currentUser ? (
              <AuthModal onSignIn={handleSignIn} />
          ) : (
              renderContent()
          )}
        </main>
      )}
      {currentUser && offerModalYield && (
        <OfferModal
          yieldPost={offerModalYield}
          isOpen={!!offerModalYield}
          onClose={handleCloseOfferModal}
          onAddOrder={handleAddOrder}
        />
      )}
      {currentUser && bidModalDeal && (
        <TransportBidModal
          deal={bidModalDeal}
          isOpen={!!bidModalDeal}
          onClose={handleCloseBidModal}
          onAddBid={handleAddTransportBid}
        />
      )}
      {currentUser && ratingModalOpen && ratingModalTransaction && ratingModalType && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setRatingModalTransaction(null);
            setRatingModalType(null);
          }}
          onSave={handleSaveRating}
          ratedUserName={ratingModalType === 'buyer_to_seller' ? 'Buyer' : 'Seller'}
          ratingType={ratingModalType}
          transactionId={ratingModalTransaction.id}
          raterId={currentUser.id}
          ratedUserId={ratingModalType === 'buyer_to_seller' ? ratingModalTransaction.buyer_id : ratingModalTransaction.seller_id}
          existingRating={ratings.find(
            r => r.transaction_id === ratingModalTransaction.id &&
                 r.rater_id === currentUser.id &&
                 r.rating_type === ratingModalType
          ) || null}
        />
      )}
      {selectedTransportBidForModal && (
        <TransporterDetailsModal
          transportBid={selectedTransportBidForModal}
          isOpen={isTransporterDetailsModalOpen}
          onClose={() => {
            setIsTransporterDetailsModalOpen(false);
            setSelectedTransportBidForModal(null);
          }}
          userRatingStats={selectedTransportBidForModal.user_id ? userRatingStatsMap?.[selectedTransportBidForModal.user_id] : undefined}
        />
      )}
    </div>
  );
};

export default App;
