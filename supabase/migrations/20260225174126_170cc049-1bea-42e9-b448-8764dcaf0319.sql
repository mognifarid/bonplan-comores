
-- Add recipient_id to conversations for direct messaging between users
ALTER TABLE public.conversations ADD COLUMN recipient_id uuid;

-- Update RLS: recipients can also view conversations
CREATE POLICY "Recipients can view conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = recipient_id);

-- Recipients can send messages in conversations they're part of
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.recipient_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Recipients can view messages
DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.messages;
CREATE POLICY "Users can view messages of their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.recipient_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Recipients can mark messages as read
DROP POLICY IF EXISTS "Users can mark messages as read in their conversations" ON public.messages;
CREATE POLICY "Users can mark messages as read in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.recipient_id = auth.uid())
  )
  AND sender_id <> auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.recipient_id = auth.uid())
  )
  AND sender_id <> auth.uid()
);

-- Recipients can delete messages
DROP POLICY IF EXISTS "Users can delete messages of their conversations" ON public.messages;
CREATE POLICY "Users can delete messages of their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.user_id = auth.uid() OR c.recipient_id = auth.uid())
  )
);

-- Recipients can delete their conversations
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = recipient_id);
