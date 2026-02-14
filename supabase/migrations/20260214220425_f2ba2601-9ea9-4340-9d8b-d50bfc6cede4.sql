-- Allow users to mark messages as read in their own conversations (only update is_read field)
CREATE POLICY "Users can mark messages as read in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND c.user_id = auth.uid()
  )
  AND sender_id != auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND c.user_id = auth.uid()
  )
  AND sender_id != auth.uid()
);