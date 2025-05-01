
-- Function to get conversation participant IDs without recursion
CREATE OR REPLACE FUNCTION public.get_conversation_participant_ids(conversation_uuid UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT user_id
  FROM public.conversation_participants
  WHERE conversation_id = conversation_uuid;
END;
$$;

-- Function to get conversations shared between two users
CREATE OR REPLACE FUNCTION public.get_shared_conversations(user_id_one UUID, user_id_two UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT cp1.conversation_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2 
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = user_id_one
    AND cp2.user_id = user_id_two;
END;
$$;

-- Function to get all conversation IDs for a user
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(user_id_param UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT conversation_id
  FROM public.conversation_participants
  WHERE user_id = user_id_param;
END;
$$;

-- Function to get other participants in a conversation (excluding current user)
CREATE OR REPLACE FUNCTION public.get_conversation_other_participants(conversation_uuid UUID, current_user_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT user_id
  FROM public.conversation_participants
  WHERE conversation_id = conversation_uuid
    AND user_id != current_user_id;
END;
$$;
