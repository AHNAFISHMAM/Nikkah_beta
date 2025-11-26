-- =============================================
-- SAFE SETUP SCRIPT - Handles Existing Tables
-- =============================================
-- Run this if you already have tables created
-- This script safely adds missing components without recreating tables

-- =============================================
-- STEP 1: Ensure Extensions Exist
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 2: Add Missing Columns (if any)
-- =============================================
-- Add any missing columns to existing tables
-- (Currently all columns should exist, but add here if needed in future)

-- =============================================
-- STEP 3: Create Missing Indexes
-- =============================================
-- Run all indexes from supabase-indexes.sql
-- (They use IF NOT EXISTS, so safe to run)

-- =============================================
-- STEP 4: Update RLS Policies
-- =============================================
-- Run supabase-rls-policies.sql
-- (Uses DROP POLICY IF EXISTS, so safe to run)

-- =============================================
-- STEP 5: Create Functions and Triggers
-- =============================================
-- Run supabase-functions.sql
-- (Uses CREATE OR REPLACE, so safe to run)

-- =============================================
-- STEP 6: Create Views
-- =============================================
-- Run supabase-views.sql
-- (Uses CREATE OR REPLACE VIEW, so safe to run)

-- =============================================
-- VERIFICATION
-- =============================================
-- Check if all tables exist:
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

