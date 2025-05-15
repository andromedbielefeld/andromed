/*
  # Fix examination categories RLS policies

  1. Changes
    - Drop existing RLS policies for examination_categories table
    - Create new policies that properly handle admin access:
      - Allow admins to perform all operations
      - Allow authenticated users to view categories
  
  2. Security
    - Maintains RLS protection
    - Ensures proper admin access
    - Restricts modifications to admin users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view examination categories" ON examination_categories;
DROP POLICY IF EXISTS "Only admins can delete examination categories" ON examination_categories;
DROP POLICY IF EXISTS "Only admins can insert examination categories" ON examination_categories;
DROP POLICY IF EXISTS "Only admins can update examination categories" ON examination_categories;

-- Create new policies
CREATE POLICY "Enable read access for all authenticated users"
ON examination_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON examination_categories
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');