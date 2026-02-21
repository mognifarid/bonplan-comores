-- Allow admins to create conversations for any user
CREATE POLICY "Admins can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));