-- =============================================
-- CHECKLIST SEED DATA
-- =============================================
-- This file contains the seed data for checklist categories and items
-- Run this after the main schema is set up
-- 
-- Total Items: 27
-- Categories: 5
-- 
-- Distribution:
--   - Spiritual Preparation: 5 items
--   - Financial Preparation: 6 items
--   - Family & Social: 5 items
--   - Personal Development: 6 items
--   - Future Planning: 5 items
-- =============================================

-- Clear existing checklist data (optional - uncomment if you want to reset)
-- WARNING: This will delete all existing checklist items and categories
-- DELETE FROM user_checklist_status;
-- DELETE FROM checklist_items;
-- DELETE FROM checklist_categories;

-- Insert Checklist Categories
-- Note: If categories already exist, you may need to delete them first or update manually
INSERT INTO checklist_categories (name, description, order_index) VALUES
('Spiritual Preparation', 'Build your Islamic foundation for marriage', 1),
('Financial Preparation', 'Ensure financial readiness and planning', 2),
('Family & Social', 'Navigate family relationships and expectations', 3),
('Personal Development', 'Develop skills for a healthy marriage', 4),
('Future Planning', 'Plan your life together', 5);

-- Insert Checklist Items (Spiritual Preparation - 5 items)
INSERT INTO checklist_items (category_id, title, description, order_index) VALUES
((SELECT id FROM checklist_categories WHERE name = 'Spiritual Preparation' ORDER BY id LIMIT 1), 'Learn Islamic marriage rights and responsibilities', 'Understand the rights and duties of spouses in Islam', 1),
((SELECT id FROM checklist_categories WHERE name = 'Spiritual Preparation' ORDER BY id LIMIT 1), 'Study basic intimacy rulings in Islam', 'Learn about halal intimacy, family planning from Islamic perspective', 2),
((SELECT id FROM checklist_categories WHERE name = 'Spiritual Preparation' ORDER BY id LIMIT 1), 'Discuss prayer and worship habits', 'Share and align on daily prayers, Quran reading, and dhikr routines', 3),
((SELECT id FROM checklist_categories WHERE name = 'Spiritual Preparation' ORDER BY id LIMIT 1), 'Study Quranic guidance about marriage', 'Read and reflect on verses about love, mercy, and partnership', 4),
((SELECT id FROM checklist_categories WHERE name = 'Spiritual Preparation' ORDER BY id LIMIT 1), 'Understand spouse rights in Islam', 'Learn about mutual respect, kindness, and Islamic boundaries', 5);

-- Insert Checklist Items (Financial Preparation - 6 items)
INSERT INTO checklist_items (category_id, title, description, order_index) VALUES
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Agree on Mahr amount and payment', 'Discuss and finalize the mahr (dowry) according to Islamic principles', 1),
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Create housing plan and budget', 'Decide where to live and calculate housing costs', 2),
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Plan monthly expenses together', 'Create a realistic monthly budget covering all expenses', 3),
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Disclose and plan for existing debts', 'Be transparent about any debts and create repayment plan', 4),
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Set emergency fund goals', 'Plan to save 3-6 months of expenses for emergencies', 5),
((SELECT id FROM checklist_categories WHERE name = 'Financial Preparation' ORDER BY id LIMIT 1), 'Assess career stability and income', 'Discuss job security, career goals, and income expectations', 6);

-- Insert Checklist Items (Family & Social - 5 items)
INSERT INTO checklist_items (category_id, title, description, order_index) VALUES
((SELECT id FROM checklist_categories WHERE name = 'Family & Social' ORDER BY id LIMIT 1), 'Obtain Wali approval and involvement', 'Ensure proper Islamic process with guardian involvement', 1),
((SELECT id FROM checklist_categories WHERE name = 'Family & Social' ORDER BY id LIMIT 1), 'Complete family introductions', 'Both families should meet and get to know each other', 2),
((SELECT id FROM checklist_categories WHERE name = 'Family & Social' ORDER BY id LIMIT 1), 'Discuss cultural expectations', 'Talk about cultural practices, traditions, and boundaries', 3),
((SELECT id FROM checklist_categories WHERE name = 'Family & Social' ORDER BY id LIMIT 1), 'Decide on living arrangements', 'Clarify if living independently, with family, or other arrangement', 4),
((SELECT id FROM checklist_categories WHERE name = 'Family & Social' ORDER BY id LIMIT 1), 'Set in-laws relationship boundaries', 'Discuss healthy relationships with extended family', 5);

-- Insert Checklist Items (Personal Development - 6 items)
INSERT INTO checklist_items (category_id, title, description, order_index) VALUES
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Develop anger management skills', 'Learn to control anger and communicate calmly', 1),
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Practice communication and conflict resolution', 'Learn healthy ways to disagree and resolve issues', 2),
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Discuss household responsibilities division', 'Talk about cooking, cleaning, and home management', 3),
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Share daily habits and routines', 'Understand each other''s schedules, sleep patterns, and preferences', 4),
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Set health and fitness goals', 'Discuss healthy lifestyle, exercise, and wellness plans', 5),
((SELECT id FROM checklist_categories WHERE name = 'Personal Development' ORDER BY id LIMIT 1), 'Mental health check and awareness', 'Be open about mental health history and support needs', 6);

-- Insert Checklist Items (Future Planning - 5 items)
INSERT INTO checklist_items (category_id, title, description, order_index) VALUES
((SELECT id FROM checklist_categories WHERE name = 'Future Planning' ORDER BY id LIMIT 1), 'Discuss children and family planning', 'Talk about when/if to have children and family size preferences', 1),
((SELECT id FROM checklist_categories WHERE name = 'Future Planning' ORDER BY id LIMIT 1), 'Align on education and career goals', 'Share individual goals and how to support each other', 2),
((SELECT id FROM checklist_categories WHERE name = 'Future Planning' ORDER BY id LIMIT 1), 'Create long-term living plan', 'Discuss where you want to live in 5-10 years', 3),
((SELECT id FROM checklist_categories WHERE name = 'Future Planning' ORDER BY id LIMIT 1), 'Set 5-year financial goals', 'Plan for major purchases, savings, investments', 4),
((SELECT id FROM checklist_categories WHERE name = 'Future Planning' ORDER BY id LIMIT 1), 'Plan for children''s Islamic education', 'Discuss Islamic school, homeschooling, or weekend programs', 5);

-- Verification Query (uncomment to verify after running)
-- SELECT 
--   cc.name as category,
--   COUNT(ci.id) as item_count
-- FROM checklist_categories cc
-- LEFT JOIN checklist_items ci ON ci.category_id = cc.id
-- GROUP BY cc.id, cc.name, cc.order_index
-- ORDER BY cc.order_index;

