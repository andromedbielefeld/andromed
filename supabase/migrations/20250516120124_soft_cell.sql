/*
  # Update Device Working Hours Schema

  1. Changes
    - Remove day_of_week column from device_working_hours
    - Add date column to device_working_hours
    - Update indexes and constraints
  
  2. Security
    - Maintain existing RLS policies
    - Ensure admin-only access for modifications
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON device_working_hours;
DROP POLICY IF EXISTS "Enable all access for admin users" ON device_working_hours;

-- Modify device_working_hours table
ALTER TABLE device_working_hours
DROP COLUMN day_of_week,
ADD COLUMN work_date date NOT NULL;

-- Update unique constraint
ALTER TABLE device_working_hours
DROP CONSTRAINT IF EXISTS device_working_hours_device_id_day_of_week_key,
ADD CONSTRAINT device_working_hours_device_id_date_key UNIQUE (device_id, work_date);

-- Update index
DROP INDEX IF EXISTS idx_device_working_hours_device;
CREATE INDEX idx_device_working_hours_device_date ON device_working_hours(device_id, work_date);

-- Re-create policies
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

-- Add comment
COMMENT ON TABLE device_working_hours IS 'Stores device working hours for specific dates';