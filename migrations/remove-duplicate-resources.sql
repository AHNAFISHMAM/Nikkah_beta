-- =============================================
-- REMOVE DUPLICATE AND SPECIFIED RESOURCES
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- Follows PostgreSQL best practices for data cleanup
-- =============================================

BEGIN;

-- Step 1: Remove specified resources from Scholarly category
-- These resources are being removed per user request
-- Using case-insensitive matching for safety
DELETE FROM resources 
WHERE category = 'Scholarly' 
AND LOWER(TRIM(title)) IN (
  LOWER('The Family in Islam - Nouman Ali Khan'),
  LOWER('Marriage and Morals in Islam - Sayyid Rizvi'),
  LOWER('Mariage in Islam - Mufti Menk'),
  LOWER('Fiqh of Love - Shaykh Omar Suleiman')
);

-- Step 1b: Remove specified books from Books category
-- These books are being removed per user request
DELETE FROM resources 
WHERE category = 'Books' 
AND LOWER(TRIM(title)) IN (
  LOWER('Before You Tie The Knot by Nour Hawa'),
  LOWER('40 Hadith on Women'),
  LOWER('Blissful Marriage by Ekram & Mohamed Rida Beshir'),
  LOWER('First Year of Marriage by Dr. Ekram Beshir'),
  LOWER('The Proper Care & Feeding of Marriage by Dr. Laura')
);

-- Step 2: Remove duplicate "Bulugh Al-Maram" - keep in Books, remove from Courses
-- Best practice: Keep the one in the more appropriate category (Books > Courses)
DELETE FROM resources
WHERE title = 'Bulugh Al-Maram: Book of Marriage'
AND category = 'Courses';

-- Step 3: Remove duplicate "TROID - Islamic Marriage" - keep in Scholarly, remove from Courses
-- Best practice: Keep the one in Scholarly category as it's more appropriate
DELETE FROM resources
WHERE title = 'Marriage in Islam - TROID'
AND category = 'Courses';

-- Step 4: Remove any other exact duplicates (same title AND URL)
-- Keep the one with: 1) is_featured = true, 2) lower order_index, 3) lower id
WITH duplicates AS (
  SELECT 
    id,
    title,
    url,
    category,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(title)), LOWER(TRIM(url))
      ORDER BY 
        is_featured DESC,  -- Keep featured ones first
        order_index ASC,   -- Keep lower order_index
        id ASC             -- Keep first created (lowest id)
    ) as rn
  FROM resources
)
DELETE FROM resources
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 5: Remove title-only duplicates (same title, different URL/category)
-- Keep the one in the most appropriate category with priority:
-- Scholarly > Books > Courses > Other categories
WITH title_duplicates AS (
  SELECT 
    id,
    title,
    category,
    url,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(title))
      ORDER BY 
        CASE category 
          WHEN 'Scholarly' THEN 1
          WHEN 'Books' THEN 2
          WHEN 'Courses' THEN 3
          ELSE 4
        END,
        is_featured DESC,
        order_index ASC,
        id ASC
    ) as rn
  FROM resources
  WHERE LOWER(TRIM(title)) IN (
    -- Find titles that appear multiple times
    SELECT LOWER(TRIM(title))
    FROM resources
    GROUP BY LOWER(TRIM(title))
    HAVING COUNT(*) > 1
  )
)
DELETE FROM resources
WHERE id IN (
  SELECT id FROM title_duplicates WHERE rn > 1
);

-- Step 6: Reorder resources to fill gaps in both Scholarly and Books categories
-- Update order_index to be sequential after removing resources
UPDATE resources
SET order_index = subquery.new_order
FROM (
  SELECT 
    id,
    category,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY order_index, id) as new_order
  FROM resources
  WHERE category IN ('Scholarly', 'Books')
) AS subquery
WHERE resources.id = subquery.id
AND resources.category = subquery.category;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES (Run separately if needed)
-- =============================================
-- Check remaining resources in Scholarly category:
-- SELECT id, title, category, is_featured, order_index 
-- FROM resources 
-- WHERE category = 'Scholarly' 
-- ORDER BY order_index, title;

-- Check for any remaining duplicates:
-- SELECT LOWER(TRIM(title)) as title, COUNT(*) as count
-- FROM resources
-- GROUP BY LOWER(TRIM(title))
-- HAVING COUNT(*) > 1;

