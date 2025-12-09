/*
  # Update Orders Table Product Type Constraint

  ## Overview
  This migration updates the product_type check constraint on the orders table
  to allow 'multi_item_cart' for shopping cart checkouts with multiple items.

  ## Changes
  - Drop existing product_type check constraint
  - Add new constraint allowing: 'single_letter', 'bundle', 'teacher_license', 'multi_item_cart', 'christmas_note', 'coloring_page'

  ## Reason
  The christmas-multi-checkout edge function was failing because it tries to insert
  'multi_item_cart' as the product_type, but the constraint only allowed
  'single_letter', 'bundle', and 'teacher_license'.
*/

-- Drop the existing product_type check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_type_check;

-- Add updated constraint with all valid product types
ALTER TABLE orders ADD CONSTRAINT orders_product_type_check 
  CHECK (product_type = ANY (ARRAY[
    'single_letter'::text,
    'bundle'::text,
    'teacher_license'::text,
    'multi_item_cart'::text,
    'christmas_note'::text,
    'coloring_page'::text
  ]));