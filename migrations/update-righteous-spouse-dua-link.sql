-- =============================================
-- UPDATE RIGHTEOUS SPOUSE DUA LINK
-- Updates the URL for "Dua for Righteous Spouse" resource
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Update the URL for Dua for Righteous Spouse resource
UPDATE resources
SET url = 'https://preciousgemsfromthequranandsunnah.wordpress.com/2022/11/08/dua-for-those-seeking-marriage-sustenance-and-for-fulfillment-of-needs/'
WHERE title = 'Dua for Righteous Spouse'
AND description = 'Collection of prophetic duas for seeking a good spouse';

-- Verify the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count = 0 THEN
    RAISE NOTICE 'No rows updated. Resource may not exist or URL already updated.';
  ELSE
    RAISE NOTICE 'Successfully updated % row(s) for Dua for Righteous Spouse resource.', updated_count;
  END IF;
END $$;

COMMIT;

