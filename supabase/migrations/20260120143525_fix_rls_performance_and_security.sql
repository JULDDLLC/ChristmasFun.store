/*
  # Fix RLS Performance and Security Issues

  This migration addresses critical security and performance issues:

  ## 1. RLS Performance Optimization
  Wraps auth function calls in SELECT to prevent re-evaluation per row:
  - stripe_customers: Updates user_id check
  - stripe_subscriptions: Updates customer_id check
  - stripe_orders: Updates customer_id check
  - orders: Updates customer_email check
  - customer_purchases: Updates customer_email check
  - email_signups: Updates service_role check

  ## 2. Remove Unused Indexes
  Drops indexes that are not being used to improve write performance:
  - idx_purchases_email
  - idx_purchases_created_at
  - idx_freebie_subscribers_email
  - idx_freebie_subscribers_created_at
  - idx_orders_customer_email
  - idx_orders_stripe_session
  - idx_orders_status
  - idx_purchases_customer_email
  - idx_purchases_order_id
  - idx_email_signups_email
  - idx_email_signups_created_at

  ## 3. Fix Security Issues
  - Restricts purchases INSERT policy from always-true to service role only

  ## Security Impact
  - Maintains same access controls but with better performance
  - Removes security bypass on purchases table
  - All tables remain protected by RLS
*/

-- ============================================================================
-- 1. FIX RLS POLICIES FOR PERFORMANCE
-- ============================================================================

-- Fix stripe_customers policy
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING ((user_id = (select auth.uid())) AND (deleted_at IS NULL));

-- Fix stripe_subscriptions policy
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING ((customer_id IN (
    SELECT customer_id
    FROM stripe_customers
    WHERE (user_id = (select auth.uid())) AND (deleted_at IS NULL)
  )) AND (deleted_at IS NULL));

-- Fix stripe_orders policy
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING ((customer_id IN (
    SELECT customer_id
    FROM stripe_customers
    WHERE (user_id = (select auth.uid())) AND (deleted_at IS NULL)
  )) AND (deleted_at IS NULL));

-- Fix orders policy
DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;
CREATE POLICY "Customers can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_email = (
    SELECT email
    FROM auth.users
    WHERE id = (select auth.uid())
  )::text);

-- Fix customer_purchases policy
DROP POLICY IF EXISTS "Customers can view their own purchases" ON customer_purchases;
CREATE POLICY "Customers can view their own purchases"
  ON customer_purchases
  FOR SELECT
  TO authenticated
  USING (customer_email = (
    SELECT email
    FROM auth.users
    WHERE id = (select auth.uid())
  )::text);

-- Fix email_signups policy
DROP POLICY IF EXISTS "Service role can manage email signups" ON email_signups;
CREATE POLICY "Service role can manage email signups"
  ON email_signups
  FOR ALL
  TO service_role
  USING ((select auth.role()) = 'service_role');

-- ============================================================================
-- 2. FIX SECURITY ISSUES
-- ============================================================================

-- Fix purchases table - restrict INSERT to service role only
DROP POLICY IF EXISTS "Allow insert of new purchases" ON purchases;
CREATE POLICY "Service role can insert purchases"
  ON purchases
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Fix the overly permissive SELECT policy on purchases
DROP POLICY IF EXISTS "Customers can view their own purchases" ON purchases;
CREATE POLICY "Customers can view their own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (customer_email = (
    SELECT email
    FROM auth.users
    WHERE id = (select auth.uid())
  )::text);

-- ============================================================================
-- 3. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_purchases_email;
DROP INDEX IF EXISTS idx_purchases_created_at;
DROP INDEX IF EXISTS idx_freebie_subscribers_email;
DROP INDEX IF EXISTS idx_freebie_subscribers_created_at;
DROP INDEX IF EXISTS idx_orders_customer_email;
DROP INDEX IF EXISTS idx_orders_stripe_session;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_purchases_customer_email;
DROP INDEX IF EXISTS idx_purchases_order_id;
DROP INDEX IF EXISTS idx_email_signups_email;
DROP INDEX IF EXISTS idx_email_signups_created_at;
