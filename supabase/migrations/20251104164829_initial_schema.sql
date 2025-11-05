-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create producer_yields table (if not exists)
CREATE TABLE IF NOT EXISTS public.producer_yields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "commodityName" TEXT NOT NULL,
    "commodityUnit" TEXT NOT NULL,
    "expectedQuantity" NUMERIC NOT NULL CHECK ("expectedQuantity" > 0),
    "expectedDate" DATE NOT NULL,
    "producerName" TEXT NOT NULL,
    "productImage" TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create buyer_orders table (if not exists)
CREATE TABLE IF NOT EXISTS public.buyer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "commodityName" TEXT NOT NULL,
    "commodityUnit" TEXT NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    "offerPrice" NUMERIC NOT NULL CHECK ("offerPrice" > 0),
    "buyerName" TEXT NOT NULL,
    "yieldId" UUID REFERENCES public.producer_yields(id) ON DELETE SET NULL,
    "producerName" TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transport_bids table (if not exists)
CREATE TABLE IF NOT EXISTS public.transport_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "orderId" UUID NOT NULL REFERENCES public.buyer_orders(id) ON DELETE CASCADE,
    "transporterName" TEXT NOT NULL,
    "bidAmount" NUMERIC NOT NULL CHECK ("bidAmount" > 0),
    "estimatedDeliveryDate" DATE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance (using snake_case as Supabase converts camelCase)
-- Try both camelCase and snake_case column names
DO $$ 
BEGIN
    -- Producer yields indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'producer_yields' AND column_name = 'commodityName') THEN
        CREATE INDEX IF NOT EXISTS idx_producer_yields_commodity_name ON public.producer_yields("commodityName");
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'producer_yields' AND column_name = 'commodity_name') THEN
        CREATE INDEX IF NOT EXISTS idx_producer_yields_commodity_name ON public.producer_yields(commodity_name);
    END IF;
    
    -- Buyer orders indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'yieldId') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_yield_id ON public.buyer_orders("yieldId");
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'yield_id') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_yield_id ON public.buyer_orders(yield_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'commodityName') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_commodity_name ON public.buyer_orders("commodityName");
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'commodity_name') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_commodity_name ON public.buyer_orders(commodity_name);
    END IF;
    
    -- Transport bids indexes  
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_bids' AND column_name = 'orderId') THEN
        CREATE INDEX IF NOT EXISTS idx_transport_bids_order_id ON public.transport_bids("orderId");
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_bids' AND column_name = 'order_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transport_bids_order_id ON public.transport_bids(order_id);
    END IF;
END $$;

-- Standard indexes that should always exist (checking column names dynamically)
DO $$ 
BEGIN
    -- Producer yields user_id index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'producer_yields' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_producer_yields_user_id ON public.producer_yields(user_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'producer_yields' AND column_name = 'userId') THEN
        CREATE INDEX IF NOT EXISTS idx_producer_yields_user_id ON public.producer_yields("userId");
    END IF;
    
    -- Buyer orders user_id index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_user_id ON public.buyer_orders(user_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'userId') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_user_id ON public.buyer_orders("userId");
    END IF;
    
    -- Transport bids user_id index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_bids' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transport_bids_user_id ON public.transport_bids(user_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_bids' AND column_name = 'userId') THEN
        CREATE INDEX IF NOT EXISTS idx_transport_bids_user_id ON public.transport_bids("userId");
    END IF;
    
    -- Timestamp indexes (should always exist)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'producer_yields' AND column_name = 'timestamp') THEN
        CREATE INDEX IF NOT EXISTS idx_producer_yields_timestamp ON public.producer_yields(timestamp DESC);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'buyer_orders' AND column_name = 'timestamp') THEN
        CREATE INDEX IF NOT EXISTS idx_buyer_orders_timestamp ON public.buyer_orders(timestamp DESC);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transport_bids' AND column_name = 'timestamp') THEN
        CREATE INDEX IF NOT EXISTS idx_transport_bids_timestamp ON public.transport_bids(timestamp DESC);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.producer_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$ 
DECLARE
    user_id_col_name text;
BEGIN
    -- Determine user_id column name for producer_yields
    SELECT column_name INTO user_id_col_name
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'producer_yields' 
    AND column_name IN ('user_id', 'userId');
    
    -- Drop producer_yields policies
    DROP POLICY IF EXISTS "Users can view all producer yields" ON public.producer_yields;
    DROP POLICY IF EXISTS "Users can insert their own producer yields" ON public.producer_yields;
    DROP POLICY IF EXISTS "Users can update their own producer yields" ON public.producer_yields;
    DROP POLICY IF EXISTS "Users can delete their own producer yields" ON public.producer_yields;
    
    -- Drop buyer_orders policies
    DROP POLICY IF EXISTS "Users can view all buyer orders" ON public.buyer_orders;
    DROP POLICY IF EXISTS "Users can insert their own buyer orders" ON public.buyer_orders;
    DROP POLICY IF EXISTS "Users can update their own buyer orders" ON public.buyer_orders;
    DROP POLICY IF EXISTS "Users can delete their own buyer orders" ON public.buyer_orders;
    
    -- Drop transport_bids policies
    DROP POLICY IF EXISTS "Users can view all transport bids" ON public.transport_bids;
    DROP POLICY IF EXISTS "Users can insert their own transport bids" ON public.transport_bids;
    DROP POLICY IF EXISTS "Users can update their own transport bids" ON public.transport_bids;
    DROP POLICY IF EXISTS "Users can delete their own transport bids" ON public.transport_bids;
END $$;

-- RLS Policies for producer_yields (using dynamic column name)
DO $$
DECLARE
    user_id_col text;
BEGIN
    SELECT column_name INTO user_id_col
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'producer_yields' 
    AND column_name IN ('user_id', 'userId')
    LIMIT 1;
    
    IF user_id_col IS NOT NULL THEN
        EXECUTE format('CREATE POLICY "Users can view all producer yields" ON public.producer_yields FOR SELECT USING (true)');
        EXECUTE format('CREATE POLICY "Users can insert their own producer yields" ON public.producer_yields FOR INSERT WITH CHECK (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can update their own producer yields" ON public.producer_yields FOR UPDATE USING (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can delete their own producer yields" ON public.producer_yields FOR DELETE USING (auth.uid() = %I)', user_id_col);
    END IF;
END $$;

-- RLS Policies for buyer_orders
DO $$
DECLARE
    user_id_col text;
BEGIN
    SELECT column_name INTO user_id_col
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'buyer_orders' 
    AND column_name IN ('user_id', 'userId')
    LIMIT 1;
    
    IF user_id_col IS NOT NULL THEN
        EXECUTE format('CREATE POLICY "Users can view all buyer orders" ON public.buyer_orders FOR SELECT USING (true)');
        EXECUTE format('CREATE POLICY "Users can insert their own buyer orders" ON public.buyer_orders FOR INSERT WITH CHECK (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can update their own buyer orders" ON public.buyer_orders FOR UPDATE USING (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can delete their own buyer orders" ON public.buyer_orders FOR DELETE USING (auth.uid() = %I)', user_id_col);
    END IF;
END $$;

-- RLS Policies for transport_bids
DO $$
DECLARE
    user_id_col text;
BEGIN
    SELECT column_name INTO user_id_col
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'transport_bids' 
    AND column_name IN ('user_id', 'userId')
    LIMIT 1;
    
    IF user_id_col IS NOT NULL THEN
        EXECUTE format('CREATE POLICY "Users can view all transport bids" ON public.transport_bids FOR SELECT USING (true)');
        EXECUTE format('CREATE POLICY "Users can insert their own transport bids" ON public.transport_bids FOR INSERT WITH CHECK (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can update their own transport bids" ON public.transport_bids FOR UPDATE USING (auth.uid() = %I)', user_id_col);
        EXECUTE format('CREATE POLICY "Users can delete their own transport bids" ON public.transport_bids FOR DELETE USING (auth.uid() = %I)', user_id_col);
    END IF;
END $$;
