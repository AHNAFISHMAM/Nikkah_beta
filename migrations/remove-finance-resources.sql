-- =============================================
-- REMOVE ALL FINANCE RESOURCES
-- Removes all resources from the Finance category:
-- 1. IslamicFinance.com
-- 2. Guidance Residential - Islamic Home Financing
-- 3. Amanah Financial
-- 4. Muslim Financial Planning Guide
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Remove all resources from Finance category
DELETE FROM resources 
WHERE category = 'Finance';

-- Verify the deletion
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count = 0 THEN
    RAISE NOTICE 'No rows deleted. Finance resources may not exist or have already been removed.';
  ELSE
    RAISE NOTICE 'Successfully deleted % finance resource(s).', deleted_count;
  END IF;
END $$;

COMMIT;

