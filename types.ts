export interface PriceHistory {
  date: string;
  price: number;
}

export interface Commodity {
  id: string;
  name: string;
  unit: string;
  price: number;
  priceChange: number;
  history: PriceHistory[];
}

export interface BuyerOrder {
  id: string;
  user_id: string;
  commodityName: string;
  commodityUnit: string;
  quantity: number;
  offerPrice: number;
  buyerName: string;
  timestamp: string;
  yieldId?: string; // Link to the specific yield
  producerName?: string; // For display purposes
}

export interface ProducerYield {
  id: string;
  user_id: string;
  commodityName: string;
  commodityUnit: string;
  expectedQuantity: number;
  expectedDate: string;
  producerName: string;
  timestamp: string;
  productImage?: string;
}

export interface TransportBid {
  id: string;
  user_id: string;
  orderId: string;
  transporterName: string;
  bidAmount: number;
  estimatedDeliveryDate: string;
  timestamp: string;
}

// FIX: Define the User type locally to work around potential export issues in @supabase/supabase-js.
// The app primarily uses `id` and `email`.
export interface User {
  id: string;
  email?: string;
  app_metadata: { [key: string]: any };
  user_metadata: { [key: string]: any };
  aud: string;
  created_at: string;
  // Add other properties as needed by your application
}

export interface UserProfile {
  user_id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  business_name?: string;
  business_type?: string;
  registration_number?: string;
  business_address?: string;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Rating {
  id: string;
  transaction_id: string;
  rater_id: string;
  rated_user_id: string;
  rating_type: 'buyer_to_seller' | 'seller_to_buyer';
  quality_rating: number;
  communication_rating: number;
  timeliness_rating: number;
  overall_rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionHistory {
  id: string;
  order_id: string;
  yield_id: string;
  buyer_id: string;
  seller_id: string;
  transport_bid_id?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRatingStats {
  user_id: string;
  total_ratings: number;
  average_overall: number;
  average_quality: number;
  average_communication: number;
  average_timeliness: number;
}


export type Theme = 'light' | 'dark';
