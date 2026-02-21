
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  phone text,
  avatar_url text,
  email text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name,
    p.phone,
    p.avatar_url,
    u.email::text,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;
