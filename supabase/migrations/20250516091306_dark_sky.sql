/*
  # Fix examination_specialties RLS policies

  1. Changes
    - Enable RLS on examination_specialties table
    - Add policy for admin users to perform all operations
    - Add policy for authenticated users to read data

  2. Security
    - Enable RLS on examination_specialties table
    - Add policies to control access based on user role
*/

-- Enable RLS on the table
ALTER TABLE examination_specialties ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to perform all operations
CREATE POLICY "Enable all access for admin users" 
ON examination_specialties
FOR ALL 
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create policy for authenticated users to read data
CREATE POLICY "Enable read access for all authenticated users"
ON examination_specialties
FOR SELECT
TO authenticated
USING (true);