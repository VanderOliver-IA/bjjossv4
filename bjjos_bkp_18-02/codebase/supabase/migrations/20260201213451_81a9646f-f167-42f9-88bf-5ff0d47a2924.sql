-- Fix 1: Restrict feature_flags SELECT to authenticated users only
-- Drop the overly permissive policy that exposes feature flags to everyone
DROP POLICY IF EXISTS "Everyone can view enabled feature flags" ON public.feature_flags;

-- Create a new policy that only allows authenticated users to view enabled feature flags
CREATE POLICY "Authenticated users can view enabled feature flags" ON public.feature_flags
  FOR SELECT USING (auth.role() = 'authenticated' AND enabled = true);

-- Fix 2: Add SELECT policies for financial data visibility to CT members
-- Add SELECT policy for financial_transactions so CT members can view transactions
CREATE POLICY "CT members can view transactions" ON public.financial_transactions
  FOR SELECT USING (can_access_ct(ct_id));

-- Add SELECT policy for daily_cash so CT members can view cash register status
CREATE POLICY "CT members can view daily cash" ON public.daily_cash
  FOR SELECT USING (can_access_ct(ct_id));