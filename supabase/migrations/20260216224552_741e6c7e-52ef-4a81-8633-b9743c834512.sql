
-- Allow users to delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Allow cascade delete of messages when conversation is deleted
CREATE POLICY "Users can delete messages of their conversations"
ON public.messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = messages.conversation_id
  AND c.user_id = auth.uid()
));
