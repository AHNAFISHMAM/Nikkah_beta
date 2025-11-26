-- =============================================
-- REMOVE SPECIFIED COUNSELING RESOURCES
-- Removes the following counseling resources from the resources table:
-- 1. Islamic Counseling & Support Network
-- 2. Khalil Center
-- 3. Marriage Matters
-- 4. Muslim Marriage & Family Counseling - Dr. Hatem Al Haj
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Remove specified counseling resources
-- Using case-insensitive matching for safety
DELETE FROM resources 
WHERE category = 'Counseling' 
AND LOWER(TRIM(title)) IN (
  LOWER('Islamic Counseling & Support Network'),
  LOWER('Khalil Center'),
  LOWER('Marriage Matters'),
  LOWER('Muslim Marriage & Family Counseling - Dr. Hatem Al Haj')
);

-- Verify the deletion
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count = 0 THEN
    RAISE NOTICE 'No rows deleted. Resources may not exist or have already been removed.';
  ELSE
    RAISE NOTICE 'Successfully deleted % counseling resource(s).', deleted_count;
  END IF;
END $$;

COMMIT;

