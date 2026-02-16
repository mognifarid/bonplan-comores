
-- Add status column to reviews
ALTER TABLE public.reviews ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Update existing reviews to approved
UPDATE public.reviews SET status = 'approved';

-- Drop old SELECT policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Only show approved reviews publicly
CREATE POLICY "Anyone can view approved reviews"
ON public.reviews
FOR SELECT
USING (status = 'approved' OR auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to update reviews (for approval/rejection)
CREATE POLICY "Admins can update reviews"
ON public.reviews
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
