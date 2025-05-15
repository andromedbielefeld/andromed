/*
  # Update device categories RLS policies

  1. Changes
    - Update RLS policies for device_categories table to properly handle authenticated users
    - Modify SELECT policy to allow any authenticated user to view categories
    - Keep admin-only restrictions for INSERT, UPDATE, and DELETE operations

  2. Security
    - Maintains admin-only access for modifications
    - Allows read access for all authenticated users
    - Uses proper JWT role checking for admin operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can delete device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can insert device categories" ON device_categories;
DROP POLICY IF EXISTS "Only admins can update device categories" ON device_categories;

-- Create updated policies
CREATE POLICY "Authenticated users can view device categories"
ON device_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert device categories"
ON device_categories
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update device categories"
ON device_categories
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete device categories"
ON device_categories
FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');