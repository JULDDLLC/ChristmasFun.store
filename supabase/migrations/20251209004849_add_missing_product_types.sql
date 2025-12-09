/*
  # Add Missing Product Types to Orders Constraint

  ## Changes
  - Updates the product_type check constraint to include:
    - notes_bundle
    - complete_bundle
    - coloring_bundle
  - These types are used by the checkout functions but were missing from the constraint
*/

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_type_check;

ALTER TABLE orders ADD CONSTRAINT orders_product_type_check 
  CHECK (product_type = ANY (ARRAY[
    'single_letter'::text,
    'bundle'::text,
    'teacher_license'::text,
    'multi_item_cart'::text,
    'christmas_note'::text,
    'coloring_page'::text,
    'notes_bundle'::text,
    'complete_bundle'::text,
    'coloring_bundle'::text
  ]));