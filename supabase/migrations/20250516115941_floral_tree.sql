/*
  # Fix RLS policies for device_working_hours

  1. Changes
    - Drop existing policies
    - Create new policies that properly handle admin access
    - Ensure proper policy naming to avoid conflicts
  
  2. Security
    - Maintains RLS protection
    - Ensures proper admin access
    - Allows read access for all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for device working hours" ON device_working_hours;
DROP POLICY IF EXISTS "Enable admin access for device working hours" ON device_working_hours;
DROP POLICY IF EXISTS "Enable read access for all users" ON device_working_hours;
DROP POLICY IF EXISTS "Enable all access for admin users" ON device_working_hours;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON device_working_hours
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_working_hours
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);