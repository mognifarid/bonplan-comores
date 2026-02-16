
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Authenticated users can create reviews (not on their own ads)
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != seller_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Admins can delete any review
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to increment ad views
CREATE OR REPLACE FUNCTION public.increment_ad_views(p_ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE ads SET views = views + 1 WHERE id = p_ad_id;
END;
$$;
