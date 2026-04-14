-- ============================================================
-- FILORA LUXE — REVIEWS & ADMIN HELPERS
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- helper to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    admin_reply TEXT,
    admin_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Public reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- 2. Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Admins can update any review (for replies), users can update their own
DROP POLICY IF EXISTS "Admins or owners can update reviews" ON public.reviews;
CREATE POLICY "Admins or owners can update reviews" 
ON public.reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

-- 4. Admins can delete any review, users can delete their own
DROP POLICY IF EXISTS "Admins or owners can delete reviews" ON public.reviews;
CREATE POLICY "Admins or owners can delete reviews" 
ON public.reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());
