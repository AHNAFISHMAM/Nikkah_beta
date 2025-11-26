-- =============================================
-- DATABASE VIEWS
-- =============================================
-- Run this after supabase-schema.sql
-- Views for complex queries and reporting

-- =============================================
-- USER DASHBOARD SUMMARY VIEW
-- =============================================
CREATE OR REPLACE VIEW v_user_dashboard_summary AS
SELECT 
  p.id as user_id,
  p.first_name,
  p.marital_status,
  p.wedding_date,
  -- Checklist stats
  (SELECT COUNT(*) FROM checklist_items ci 
   WHERE ci.is_custom = false OR ci.created_by = p.id) as total_checklist_items,
  (SELECT COUNT(*) FROM user_checklist_status ucs
   JOIN checklist_items ci ON ci.id = ucs.checklist_item_id
   WHERE ucs.user_id = p.id 
     AND ucs.is_completed = true
     AND (ci.is_custom = false OR ci.created_by = p.id)) as completed_checklist_items,
  -- Module stats
  (SELECT COUNT(*) FROM modules) as total_modules,
  (SELECT COUNT(*) FROM module_notes 
   WHERE user_id = p.id AND is_completed = true) as completed_modules,
  -- Discussion stats
  (SELECT COUNT(*) FROM discussion_prompts) as total_discussion_prompts,
  (SELECT COUNT(*) FROM user_discussion_answers 
   WHERE user_id = p.id AND is_discussed = true) as discussed_prompts,
  -- Financial stats
  (SELECT COALESCE(SUM(income_his + income_hers), 0) FROM budgets WHERE user_id = p.id) as total_income,
  (SELECT COALESCE(SUM(
    expense_housing + expense_utilities + expense_transportation + 
    expense_food + expense_insurance + expense_debt + 
    expense_entertainment + expense_dining + expense_clothing + 
    expense_gifts + expense_charity
  ), 0) FROM budgets WHERE user_id = p.id) as total_expenses,
  (SELECT amount FROM mahr WHERE user_id = p.id LIMIT 1) as mahr_amount,
  (SELECT status FROM mahr WHERE user_id = p.id LIMIT 1) as mahr_status,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM profiles p;

-- Grant access to authenticated users
GRANT SELECT ON v_user_dashboard_summary TO authenticated;

-- =============================================
-- CHECKLIST PROGRESS VIEW
-- =============================================
CREATE OR REPLACE VIEW v_user_checklist_progress AS
SELECT 
  ucs.user_id,
  cc.id as category_id,
  cc.name as category_name,
  cc.order_index as category_order,
  COUNT(ci.id) as total_items_in_category,
  COUNT(CASE WHEN ucs.is_completed = true THEN 1 END) as completed_items_in_category,
  ROUND(
    CASE 
      WHEN COUNT(ci.id) > 0 
      THEN (COUNT(CASE WHEN ucs.is_completed = true THEN 1 END)::NUMERIC / COUNT(ci.id)::NUMERIC) * 100
      ELSE 0
    END, 
    2
  ) as category_completion_percentage
FROM checklist_categories cc
LEFT JOIN checklist_items ci ON ci.category_id = cc.id
LEFT JOIN user_checklist_status ucs ON ucs.checklist_item_id = ci.id
WHERE ci.is_custom = false OR ci.created_by = ucs.user_id
GROUP BY ucs.user_id, cc.id, cc.name, cc.order_index
ORDER BY ucs.user_id, cc.order_index;

-- Grant access to authenticated users
GRANT SELECT ON v_user_checklist_progress TO authenticated;

-- =============================================
-- FINANCIAL SUMMARY VIEW
-- =============================================
CREATE OR REPLACE VIEW v_user_financial_summary AS
SELECT 
  p.id as user_id,
  p.first_name,
  -- Budget summary
  b.income_his,
  b.income_hers,
  (COALESCE(b.income_his, 0) + COALESCE(b.income_hers, 0)) as total_income,
  COALESCE(b.expense_housing, 0) as expense_housing,
  COALESCE(b.expense_utilities, 0) as expense_utilities,
  COALESCE(b.expense_transportation, 0) as expense_transportation,
  COALESCE(b.expense_food, 0) as expense_food,
  COALESCE(b.expense_insurance, 0) as expense_insurance,
  COALESCE(b.expense_debt, 0) as expense_debt,
  COALESCE(b.expense_entertainment, 0) as expense_entertainment,
  COALESCE(b.expense_dining, 0) as expense_dining,
  COALESCE(b.expense_clothing, 0) as expense_clothing,
  COALESCE(b.expense_gifts, 0) as expense_gifts,
  COALESCE(b.expense_charity, 0) as expense_charity,
  (
    COALESCE(b.expense_housing, 0) + COALESCE(b.expense_utilities, 0) + 
    COALESCE(b.expense_transportation, 0) + COALESCE(b.expense_food, 0) + 
    COALESCE(b.expense_insurance, 0) + COALESCE(b.expense_debt, 0) + 
    COALESCE(b.expense_entertainment, 0) + COALESCE(b.expense_dining, 0) + 
    COALESCE(b.expense_clothing, 0) + COALESCE(b.expense_gifts, 0) + 
    COALESCE(b.expense_charity, 0)
  ) as total_expenses,
  (
    (COALESCE(b.income_his, 0) + COALESCE(b.income_hers, 0)) - 
    (
      COALESCE(b.expense_housing, 0) + COALESCE(b.expense_utilities, 0) + 
      COALESCE(b.expense_transportation, 0) + COALESCE(b.expense_food, 0) + 
      COALESCE(b.expense_insurance, 0) + COALESCE(b.expense_debt, 0) + 
      COALESCE(b.expense_entertainment, 0) + COALESCE(b.expense_dining, 0) + 
      COALESCE(b.expense_clothing, 0) + COALESCE(b.expense_gifts, 0) + 
      COALESCE(b.expense_charity, 0)
    )
  ) as net_income,
  -- Mahr info
  m.amount as mahr_amount,
  m.status as mahr_status,
  m.amount_paid as mahr_amount_paid,
  (COALESCE(m.amount, 0) - COALESCE(m.amount_paid, 0)) as mahr_remaining,
  -- Wedding budget summary
  (
    COALESCE(wb.venue_planned, 0) + COALESCE(wb.catering_planned, 0) + 
    COALESCE(wb.photography_planned, 0) + COALESCE(wb.clothing_planned, 0) + 
    COALESCE(wb.decor_planned, 0) + COALESCE(wb.invitations_planned, 0) + 
    COALESCE(wb.other_planned, 0)
  ) as wedding_budget_planned,
  (
    COALESCE(wb.venue_spent, 0) + COALESCE(wb.catering_spent, 0) + 
    COALESCE(wb.photography_spent, 0) + COALESCE(wb.clothing_spent, 0) + 
    COALESCE(wb.decor_spent, 0) + COALESCE(wb.invitations_spent, 0) + 
    COALESCE(wb.other_spent, 0)
  ) as wedding_budget_spent,
  -- Savings goals summary
  sg.emergency_fund_goal,
  sg.emergency_fund_current,
  (COALESCE(sg.emergency_fund_goal, 0) - COALESCE(sg.emergency_fund_current, 0)) as emergency_fund_remaining,
  sg.house_goal,
  sg.house_current,
  (COALESCE(sg.house_goal, 0) - COALESCE(sg.house_current, 0)) as house_goal_remaining,
  sg.other_goal_name,
  sg.other_goal_amount,
  sg.other_goal_current,
  (COALESCE(sg.other_goal_amount, 0) - COALESCE(sg.other_goal_current, 0)) as other_goal_remaining
FROM profiles p
LEFT JOIN budgets b ON b.user_id = p.id
LEFT JOIN mahr m ON m.user_id = p.id
LEFT JOIN wedding_budget wb ON wb.user_id = p.id
LEFT JOIN savings_goals sg ON sg.user_id = p.id;

-- Grant access to authenticated users
GRANT SELECT ON v_user_financial_summary TO authenticated;

-- =============================================
-- MODULE PROGRESS VIEW
-- =============================================
CREATE OR REPLACE VIEW v_user_module_progress AS
SELECT 
  m.id as module_id,
  m.title as module_title,
  m.description as module_description,
  m.order_index as module_order,
  mn.user_id,
  COALESCE(mn.is_completed, false) as is_completed,
  mn.notes as user_notes,
  mn.completed_at,
  mn.created_at as started_at,
  mn.updated_at as last_updated
FROM modules m
LEFT JOIN module_notes mn ON mn.module_id = m.id
ORDER BY m.order_index, mn.user_id;

-- Grant access to authenticated users
GRANT SELECT ON v_user_module_progress TO authenticated;

-- =============================================
-- DISCUSSION PROGRESS VIEW
-- =============================================
CREATE OR REPLACE VIEW v_user_discussion_progress AS
SELECT 
  dp.id as prompt_id,
  dp.title as prompt_title,
  dp.description as prompt_description,
  dp.category,
  dp.order_index as prompt_order,
  uda.user_id,
  uda.answer,
  COALESCE(uda.is_discussed, false) as is_discussed,
  uda.follow_up_notes,
  uda.discussed_at,
  uda.created_at as answered_at,
  uda.updated_at as last_updated
FROM discussion_prompts dp
LEFT JOIN user_discussion_answers uda ON uda.prompt_id = dp.id
ORDER BY dp.order_index, uda.user_id;

-- Grant access to authenticated users
GRANT SELECT ON v_user_discussion_progress TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================
-- View all views:
-- SELECT table_name, view_definition 
-- FROM information_schema.views 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

