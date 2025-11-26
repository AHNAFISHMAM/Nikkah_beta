-- =============================================
-- PERFORMANCE INDEXES
-- =============================================
-- Run this after supabase-schema.sql
-- These indexes optimize query performance based on common access patterns

-- =============================================
-- PROFILES TABLE INDEXES
-- =============================================
-- Index on partner_email for partner lookups
CREATE INDEX IF NOT EXISTS idx_profiles_partner_email 
ON profiles(partner_email) 
WHERE partner_email IS NOT NULL;

-- Index on marital_status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_marital_status 
ON profiles(marital_status);

-- Index on wedding_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_wedding_date 
ON profiles(wedding_date) 
WHERE wedding_date IS NOT NULL;

-- =============================================
-- CHECKLIST CATEGORIES INDEXES
-- =============================================
-- Index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_checklist_categories_order 
ON checklist_categories(order_index);

-- =============================================
-- CHECKLIST ITEMS INDEXES
-- =============================================
-- Composite index for category + order queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_checklist_items_category_order 
ON checklist_items(category_id, order_index);

-- Index on is_custom for filtering custom items
CREATE INDEX IF NOT EXISTS idx_checklist_items_is_custom 
ON checklist_items(is_custom) 
WHERE is_custom = true;

-- Index on created_by for user's custom items
CREATE INDEX IF NOT EXISTS idx_checklist_items_created_by 
ON checklist_items(created_by) 
WHERE created_by IS NOT NULL;

-- =============================================
-- USER CHECKLIST STATUS INDEXES
-- =============================================
-- Composite index for user + item lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_user_checklist_status_user_item 
ON user_checklist_status(user_id, checklist_item_id);

-- Index on user_id for all user's checklist items
CREATE INDEX IF NOT EXISTS idx_user_checklist_status_user_id 
ON user_checklist_status(user_id);

-- Index on is_completed for filtering completed items
CREATE INDEX IF NOT EXISTS idx_user_checklist_status_completed 
ON user_checklist_status(user_id, is_completed) 
WHERE is_completed = true;

-- Index on completed_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_user_checklist_status_completed_at 
ON user_checklist_status(completed_at) 
WHERE completed_at IS NOT NULL;

-- =============================================
-- BUDGETS TABLE INDEXES
-- =============================================
-- Primary lookup is by user_id (already has UNIQUE constraint which creates index)
-- No additional indexes needed as user_id is unique

-- =============================================
-- MAHR TABLE INDEXES
-- =============================================
-- Primary lookup is by user_id (already has UNIQUE constraint which creates index)
-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_mahr_status 
ON mahr(status);

-- =============================================
-- WEDDING BUDGET TABLE INDEXES
-- =============================================
-- Primary lookup is by user_id (already has UNIQUE constraint which creates index)

-- =============================================
-- SAVINGS GOALS TABLE INDEXES
-- =============================================
-- Primary lookup is by user_id (already has UNIQUE constraint which creates index)

-- =============================================
-- MODULES TABLE INDEXES
-- =============================================
-- Index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_modules_order 
ON modules(order_index);

-- =============================================
-- MODULE NOTES INDEXES
-- =============================================
-- Composite index for user + module lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_module_notes_user_module 
ON module_notes(user_id, module_id);

-- Index on user_id for all user's module notes
CREATE INDEX IF NOT EXISTS idx_module_notes_user_id 
ON module_notes(user_id);

-- Index on is_completed for filtering completed modules
CREATE INDEX IF NOT EXISTS idx_module_notes_completed 
ON module_notes(user_id, is_completed) 
WHERE is_completed = true;

-- =============================================
-- DISCUSSION PROMPTS INDEXES
-- =============================================
-- Index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_order 
ON discussion_prompts(order_index);

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category 
ON discussion_prompts(category) 
WHERE category IS NOT NULL;

-- =============================================
-- USER DISCUSSION ANSWERS INDEXES
-- =============================================
-- Composite index for user + prompt lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_prompt 
ON user_discussion_answers(user_id, prompt_id);

-- Index on user_id for all user's discussion answers
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_id 
ON user_discussion_answers(user_id);

-- Index on is_discussed for filtering discussed prompts
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_discussed 
ON user_discussion_answers(user_id, is_discussed) 
WHERE is_discussed = true;

-- =============================================
-- RESOURCES TABLE INDEXES
-- =============================================
-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_resources_category 
ON resources(category) 
WHERE category IS NOT NULL;

-- Index on is_featured for featured resources
CREATE INDEX IF NOT EXISTS idx_resources_featured 
ON resources(is_featured) 
WHERE is_featured = true;

-- Index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_resources_order 
ON resources(order_index) 
WHERE order_index IS NOT NULL;

-- =============================================
-- FOREIGN KEY INDEXES (if not auto-created)
-- =============================================
-- These are usually auto-created, but explicitly ensure they exist

-- Checklist items -> categories
CREATE INDEX IF NOT EXISTS idx_checklist_items_category_id 
ON checklist_items(category_id);

-- Checklist items -> profiles (created_by)
CREATE INDEX IF NOT EXISTS idx_checklist_items_created_by_fk 
ON checklist_items(created_by) 
WHERE created_by IS NOT NULL;

-- Module notes -> modules
CREATE INDEX IF NOT EXISTS idx_module_notes_module_id 
ON module_notes(module_id);

-- User discussion answers -> prompts
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_prompt_id 
ON user_discussion_answers(prompt_id);

-- =============================================
-- VERIFICATION
-- =============================================
-- Run this query to see all indexes:
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

