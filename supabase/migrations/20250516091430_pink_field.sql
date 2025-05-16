/*
  # Fix examination_specialties RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Enable RLS on examination_specialties table
    - Create policies for admin and authenticated users
  
  2. Security
    - Maintains admin-only access for modifications
    - Allows read access for all authenticated users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all access for admin users" ON examination_specialties;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON examination_specialties;

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