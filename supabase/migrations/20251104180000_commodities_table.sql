-- Create commodities table for market prices
CREATE TABLE IF NOT EXISTS public.commodities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    pricechange NUMERIC NOT NULL DEFAULT 0,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_commodities_name ON public.commodities(name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read commodities (public data)
CREATE POLICY "Anyone can view commodities"
ON public.commodities FOR SELECT
USING (true);

-- Only authenticated users can insert/update (for admin purposes)
CREATE POLICY "Authenticated users can insert commodities"
ON public.commodities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update commodities"
ON public.commodities FOR UPDATE
TO authenticated
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commodities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_commodities_updated_at
    BEFORE UPDATE ON public.commodities
    FOR EACH ROW
    EXECUTE FUNCTION update_commodities_updated_at();
