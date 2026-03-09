
-- Step 1: Drop the view first since it depends on ads table
DROP VIEW IF EXISTS public.ads_public;

-- Step 2: Add is_sold column
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_sold boolean NOT NULL DEFAULT false;

-- Step 3: Recreate the view with is_sold
CREATE VIEW public.ads_public AS
SELECT id, price, user_id, boost_expires_at, is_premium, views, created_at, updated_at, status, boost, room_count, vehicle_brand, title, description, vehicle_year, category, subcategory, island, city, images, vehicle_mileage, is_sold
FROM public.ads
WHERE status = 'approved';

-- Step 4: Update trigger to allow is_sold changes by owners
CREATE OR REPLACE FUNCTION public.validate_ad_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      NEW.reviewed_at := NOW();
      NEW.reviewed_by := auth.uid();
    END IF;
    RETURN NEW;
  END IF;
  
  IF (OLD.status IS DISTINCT FROM NEW.status) OR
     (OLD.reviewed_at IS DISTINCT FROM NEW.reviewed_at) OR
     (OLD.reviewed_by IS DISTINCT FROM NEW.reviewed_by) OR
     (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) OR
     (OLD.boost IS DISTINCT FROM NEW.boost) OR
     (OLD.boost_expires_at IS DISTINCT FROM NEW.boost_expires_at) OR
     (OLD.is_premium IS DISTINCT FROM NEW.is_premium) THEN
    RAISE EXCEPTION 'Vous ne pouvez pas modifier ces champs.';
  END IF;
  
  RETURN NEW;
END;
$function$;
