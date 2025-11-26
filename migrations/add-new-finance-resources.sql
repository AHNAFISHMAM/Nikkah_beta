-- =============================================
-- ADD NEW FINANCE RESOURCES
-- Adds the new finance resources as specified:
-- 1. Al Awwal Capital — Islamic Finance in Saudi Arabia
-- 2. A Case Study of Al Rajhi Bank in the Kingdom of Saudi Arabia
-- 3. Impact of Islamic Credit on Saudi GDP Study
-- 4. Islamic banking in Saudi Arabia (Wikipedia)
-- 5. Top Islamic financial institutions 2025: Highlights (The Banker)
-- Best Practices: Transaction-safe, idempotent, clear documentation
-- =============================================

BEGIN;

-- Insert new finance resources (only if they don't already exist)
INSERT INTO resources (title, description, url, category, is_featured, order_index)
SELECT * FROM (VALUES
  (
    'Al Awwal Capital — التمويل الإسلامي في السعودية',
    'Overview article describing how Islamic finance works in Saudi, its regulatory and economic role under Vision 2030, and why the sector is central for sustainable growth',
    'https://alawwalcapital.com.sa/%D8%A7%D9%84%D8%AA%D9%85%D9%88%D9%8A%D9%84-%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%D9%8A-%D9%81%D9%89-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9/',
    'Finance',
    true,
    1
  ),
  (
    'A Case Study of Al Rajhi Bank in the Kingdom of Saudi Arabia',
    'Empirical research on how Al Rajhi Bank operated during the global financial crisis, examining profitability, risk, liquidity — shows how Islamic banking performed in stress times',
    'https://www.u-picardie.fr/eastwest/stat_doc.php?doc=165',
    'Finance',
    true,
    2
  ),
  (
    'أثر الائتمان المصرفي بصيغ التمويل الإسلامية على الناتج المحلي الإجمالي السعودي — Impact of Islamic Credit on Saudi GDP',
    'An econometric study (2014–2022) analyzing how different Islamic financing instruments (Murabaha, Tawarruq, Ijarah, etc.) affected Saudi economic output (GDP)',
    'https://journals.iu.edu.sa/ILS/Main/Article/14693',
    'Finance',
    false,
    3
  ),
  (
    'Islamic banking in Saudi Arabia (Wikipedia)',
    'Provides summary of Islamic banking in KSA: list of major Islamic banks, regulatory background, and general context',
    'https://en.wikipedia.org/wiki/Islamic_banking_in_Saudi_Arabia',
    'Finance',
    false,
    4
  ),
  (
    'The Banker — Top Islamic financial institutions 2025: Highlights',
    'Recent international article analyzing performance and growth of top Islamic banks including those in Saudi — useful for understanding trends & global context',
    'https://www.thebanker.com/content/6b074418-b48e-40a4-b88d-ef10dc0764e1',
    'Finance',
    false,
    5
  )
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

