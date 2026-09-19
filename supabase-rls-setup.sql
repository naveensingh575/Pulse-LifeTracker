-- ============================================================================
-- PULSE LIFE TRACKER - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Execute this script in your Supabase Dashboard -> SQL Editor.
-- This script ensures that every table has Row Level Security (RLS) enabled
-- and creates strict tenant-isolation policies so that authenticated users
-- can ONLY view, insert, update, and delete their own data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: habits
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "habits_select_policy" ON public.habits;
DROP POLICY IF EXISTS "habits_insert_policy" ON public.habits;
DROP POLICY IF EXISTS "habits_update_policy" ON public.habits;
DROP POLICY IF EXISTS "habits_delete_policy" ON public.habits;

CREATE POLICY "habits_select_policy" ON public.habits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habits_insert_policy" ON public.habits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_update_policy" ON public.habits
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_delete_policy" ON public.habits
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 2. Table: habit_completions
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.habit_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "habit_completions_select_policy" ON public.habit_completions;
DROP POLICY IF EXISTS "habit_completions_insert_policy" ON public.habit_completions;
DROP POLICY IF EXISTS "habit_completions_update_policy" ON public.habit_completions;
DROP POLICY IF EXISTS "habit_completions_delete_policy" ON public.habit_completions;

CREATE POLICY "habit_completions_select_policy" ON public.habit_completions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habit_completions_insert_policy" ON public.habit_completions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_completions_update_policy" ON public.habit_completions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_completions_delete_policy" ON public.habit_completions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 3. Table: monthly_allocations
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.monthly_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "monthly_allocations_select_policy" ON public.monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_insert_policy" ON public.monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_update_policy" ON public.monthly_allocations;
DROP POLICY IF EXISTS "monthly_allocations_delete_policy" ON public.monthly_allocations;

CREATE POLICY "monthly_allocations_select_policy" ON public.monthly_allocations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "monthly_allocations_insert_policy" ON public.monthly_allocations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "monthly_allocations_update_policy" ON public.monthly_allocations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "monthly_allocations_delete_policy" ON public.monthly_allocations
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 4. Table: transactions
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_policy" ON public.transactions;

CREATE POLICY "transactions_select_policy" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_policy" ON public.transactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy" ON public.transactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 5. Table: goals
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_select_policy" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON public.goals;
DROP POLICY IF EXISTS "goals_update_policy" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_policy" ON public.goals;

CREATE POLICY "goals_select_policy" ON public.goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_policy" ON public.goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update_policy" ON public.goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_policy" ON public.goals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 6. Table: sub_goals
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.sub_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_goals_select_policy" ON public.sub_goals;
DROP POLICY IF EXISTS "sub_goals_insert_policy" ON public.sub_goals;
DROP POLICY IF EXISTS "sub_goals_update_policy" ON public.sub_goals;
DROP POLICY IF EXISTS "sub_goals_delete_policy" ON public.sub_goals;

CREATE POLICY "sub_goals_select_policy" ON public.sub_goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "sub_goals_insert_policy" ON public.sub_goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sub_goals_update_policy" ON public.sub_goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sub_goals_delete_policy" ON public.sub_goals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 7. Table: tasks
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;

CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 8. Table: deadlines
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deadlines_select_policy" ON public.deadlines;
DROP POLICY IF EXISTS "deadlines_insert_policy" ON public.deadlines;
DROP POLICY IF EXISTS "deadlines_update_policy" ON public.deadlines;
DROP POLICY IF EXISTS "deadlines_delete_policy" ON public.deadlines;

CREATE POLICY "deadlines_select_policy" ON public.deadlines
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "deadlines_insert_policy" ON public.deadlines
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deadlines_update_policy" ON public.deadlines
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deadlines_delete_policy" ON public.deadlines
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 9. Table: activities
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_update_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_policy" ON public.activities;

CREATE POLICY "activities_select_policy" ON public.activities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "activities_insert_policy" ON public.activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_update_policy" ON public.activities
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_delete_policy" ON public.activities
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- 10. Table: journal_entries
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journal_entries_select_policy" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_insert_policy" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_update_policy" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_delete_policy" ON public.journal_entries;

CREATE POLICY "journal_entries_select_policy" ON public.journal_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "journal_entries_insert_policy" ON public.journal_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_entries_update_policy" ON public.journal_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_entries_delete_policy" ON public.journal_entries
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERY
-- Run this query to confirm RLS is active on all 10 tables:
-- ============================================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' 
-- AND tablename IN ('habits', 'habit_completions', 'monthly_allocations', 'transactions', 'goals', 'sub_goals', 'tasks', 'deadlines', 'activities', 'journal_entries');

-- ============================================================================
-- DELETE ACCOUNT RPC FUNCTION
-- ============================================================================
-- This function is called by the client with: supabase.rpc('delete_user_account')
-- SECURITY DEFINER allows it to delete from auth.users without exposing the
-- service_role key on the frontend. It runs as the DB owner, but only
-- deletes the row for the currently authenticated user (auth.uid()).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  -- Guard: only run if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete all user data across all 10 tables
  DELETE FROM public.habit_completions   WHERE user_id = current_user_id;
  DELETE FROM public.habits              WHERE user_id = current_user_id;
  DELETE FROM public.monthly_allocations WHERE user_id = current_user_id;
  DELETE FROM public.transactions        WHERE user_id = current_user_id;
  DELETE FROM public.sub_goals           WHERE user_id = current_user_id;
  DELETE FROM public.goals               WHERE user_id = current_user_id;
  DELETE FROM public.deadlines           WHERE user_id = current_user_id;
  DELETE FROM public.tasks               WHERE user_id = current_user_id;
  DELETE FROM public.activities          WHERE user_id = current_user_id;
  DELETE FROM public.journal_entries     WHERE user_id = current_user_id;

  -- Delete the auth user record itself
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

