-- =============================================
-- UPDATE FORTRESS OF THE MUSLIM LINK
-- Updates the URL for "Fortress of the Muslim (Hisnul Muslim)" resource
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Update the URL for Fortress of the Muslim resource
UPDATE resources
SET url = 'https://abdurrahman.org/hisn-al-muslim/'
WHERE title = 'Fortress of the Muslim (Hisnul Muslim)'
AND url = 'https://www.islamicbulletin.org/hisnulmuslim/';

-- Verify the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count = 0 THEN
    RAISE NOTICE 'No rows updated. Resource may not exist or URL already updated.';
  ELSE
    RAISE NOTICE 'Successfully updated % row(s) for Fortress of the Muslim resource.', updated_count;
  END IF;
END $$;

COMMIT;

