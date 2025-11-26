-- =============================================
-- ADD FINANCE RESOURCES
-- Adds the finance resources as specified:
-- 1. Amanah Financial
-- 2. Guidance Residential - Islamic Home Financing
-- 3. IslamicFinance.com
-- 4. Muslim Financial Planning Guide
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Insert finance resources (only if they don't already exist)
INSERT INTO resources (title, description, url, category, is_featured, order_index)
SELECT * FROM (VALUES
  ('IslamicFinance.com', 'Complete resource on halal finance and Islamic banking', 'https://www.islamicfinance.com', 'Finance', true, 1),
  ('Guidance Residential - Islamic Home Financing', 'Sharia-compliant home financing solutions', 'https://www.guidanceresidential.com', 'Finance', true, 2),
  ('Amanah Financial', 'Islamic personal finance planning', 'https://amanahfin.com', 'Finance', false, 3),
  ('Muslim Financial Planning Guide', 'Comprehensive guide to Islamic financial planning', 'https://www.azzadnet.com', 'Finance', false, 4)
) AS v(title, description, url, category, is_featured, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM resources r 
  WHERE LOWER(TRIM(r.title)) = LOWER(TRIM(v.title))
  AND r.category = v.category
);

-- Verify the insertion
DO $$
DECLARE
  inserted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inserted_count
  FROM resources
  WHERE category = 'Finance';
  
  RAISE NOTICE 'Total finance resources after insertion: %', inserted_count;
END $$;

COMMIT;

