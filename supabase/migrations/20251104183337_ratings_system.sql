-- Create transaction_history table
CREATE TABLE IF NOT EXISTS public.transaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.buyer_orders(id) ON DELETE CASCADE,
    yield_id UUID NOT NULL REFERENCES public.producer_yields(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transport_bid_id UUID REFERENCES public.transport_bids(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transaction_history(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_type TEXT NOT NULL CHECK (rating_type IN ('buyer_to_seller', 'seller_to_buyer')),
    quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
    timeliness_rating INTEGER NOT NULL CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    overall_rating DECIMAL(3,2) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transaction_id, rater_id, rating_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transaction_history_buyer_id ON public.transaction_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_seller_id ON public.transaction_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_order_id ON public.transaction_history(order_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON public.ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_transaction_id ON public.ratings(transaction_id);

-- Enable RLS
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view all transactions" ON public.transaction_history;
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transaction_history;
    DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transaction_history;
    DROP POLICY IF EXISTS "Users can view all ratings" ON public.ratings;
    DROP POLICY IF EXISTS "Users can insert ratings for their transactions" ON public.ratings;
    DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
END $$;

-- RLS Policies for transaction_history
CREATE POLICY "Users can view all transactions"
ON public.transaction_history FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own transactions"
ON public.transaction_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their own transactions"
ON public.transaction_history FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for ratings
CREATE POLICY "Users can view all ratings"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Users can insert ratings for their transactions"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
        SELECT 1 FROM public.transaction_history th
        WHERE th.id = transaction_id
        AND (th.buyer_id = auth.uid() OR th.seller_id = auth.uid())
    )
);

CREATE POLICY "Users can update their own ratings"
ON public.ratings FOR UPDATE
TO authenticated
USING (auth.uid() = rater_id)
WITH CHECK (auth.uid() = rater_id);

-- Function to calculate overall_rating
CREATE OR REPLACE FUNCTION calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_rating = ROUND((NEW.quality_rating + NEW.communication_rating + NEW.timeliness_rating) / 3.0, 2);
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate overall_rating
CREATE TRIGGER calculate_overall_rating_trigger
    BEFORE INSERT OR UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_overall_rating();

-- Function to update transaction_history updated_at
CREATE OR REPLACE FUNCTION update_transaction_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update transaction_history updated_at
CREATE TRIGGER update_transaction_history_updated_at
    BEFORE UPDATE ON public.transaction_history
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_history_updated_at();

-- Function to get user rating stats
CREATE OR REPLACE FUNCTION get_user_rating_stats(user_uuid UUID)
RETURNS TABLE (
    total_ratings BIGINT,
    average_overall DECIMAL,
    average_quality DECIMAL,
    average_communication DECIMAL,
    average_timeliness DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COALESCE(ROUND(AVG(overall_rating)::numeric, 2), 0)::DECIMAL,
        COALESCE(ROUND(AVG(quality_rating)::numeric, 2), 0)::DECIMAL,
        COALESCE(ROUND(AVG(communication_rating)::numeric, 2), 0)::DECIMAL,
        COALESCE(ROUND(AVG(timeliness_rating)::numeric, 2), 0)::DECIMAL
    FROM public.ratings
    WHERE rated_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
