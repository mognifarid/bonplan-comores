-- Recreate profiles_public view to include all profiles (not just those with approved ads)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  created_at
FROM profiles;