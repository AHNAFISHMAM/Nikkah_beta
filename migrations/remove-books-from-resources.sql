-- =============================================
-- REMOVE SPECIFIED BOOKS FROM RESOURCES
-- Removes 5 books from Books category per user request
-- Best Practices: Transaction-safe, idempotent, case-insensitive matching
-- =============================================

BEGIN;

-- Remove the 5 specified books from Books category
-- Using case-insensitive matching for safety
DELETE FROM resources 
WHERE category = 'Books' 
AND LOWER(TRIM(title)) IN (
  LOWER('Before You Tie The Knot by Nour Hawa'),
  LOWER('40 Hadith on Women'),
  LOWER('Blissful Marriage by Ekram & Mohamed Rida Beshir'),
  LOWER('First Year of Marriage by Dr. Ekram Beshir'),
  LOWER('The Proper Care & Feeding of Marriage by Dr. Laura')
);

-- Reorder Books category to fill gaps after removal
-- Update order_index to be sequential
UPDATE resources
SET order_index = subquery.new_order
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY order_index, id) as new_order
  FROM resources
  WHERE category = 'Books'
) AS subquery
WHERE resources.id = subquery.id
AND resources.category = 'Books';

COMMIT;

