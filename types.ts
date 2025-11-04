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
  id:string;
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


export type Theme = 'light' | 'dark';
