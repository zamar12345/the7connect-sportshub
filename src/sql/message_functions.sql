
-- Function to add participants to a conversation
CREATE OR REPLACE FUNCTION public.add_conversation_participants(
  conversation_id_param UUID,
  current_user_id_param UUID,
  other_user_id_param UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Add current user as participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conversation_id_param, current_user_id_param);
  
  -- Add other user as participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conversation_id_param, other_user_id_param);
END;
$$;

-- Function to find conversation between two users
CREATE OR REPLACE FUNCTION public.find_conversation_between_users(
  user_one UUID,
  user_two UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  found_conversation_id UUID;
BEGIN
  -- Find conversations that both users participate in
  SELECT c1.conversation_id INTO found_conversation_id
  FROM public.conversation_participants c1
  JOIN public.conversation_participants c2 ON c1.conversation_id = c2.conversation_id
  WHERE c1.user_id = user_one AND c2.user_id = user_two
  LIMIT 1;
  
  RETURN found_conversation_id;
END;
$$;
