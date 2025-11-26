-- =============================================
-- UPDATE MARRIAGE DUAS LINK
-- Updates the URL for "Marriage Duas from Quran & Sunnah" resource
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Update the URL for Marriage Duas from Quran & Sunnah resource
UPDATE resources
SET url = 'https://mishkahacademy.com/duas-for-happy-marriage/'
WHERE title = 'Marriage Duas from Quran & Sunnah'
AND description = 'Specific supplications for marriage and family';

-- Verify the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count = 0 THEN
    RAISE NOTICE 'No rows updated. Resource may not exist or URL already updated.';
  ELSE
    RAISE NOTICE 'Successfully updated % row(s) for Marriage Duas from Quran & Sunnah resource.', updated_count;
  END IF;
END $$;

COMMIT;

