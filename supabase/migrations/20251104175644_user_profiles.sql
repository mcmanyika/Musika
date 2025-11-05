-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Basic Information
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    -- Business Information
    business_name TEXT,
    business_type TEXT,
    registration_number TEXT,
    business_address TEXT,
    -- Profile Photo
    profile_photo_url TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id (already primary key, but useful for joins)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
END $$;

-- RLS Policies: Users can view all profiles (for display purposes), but only edit their own
CREATE POLICY "Users can view all profiles"
ON public.user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();
