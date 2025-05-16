/*
  # Update device working hours schema

  1. Changes
    - Replace day_of_week with work_date column
    - Update constraints and indexes
    - Maintain RLS policies
    
  2. Security
    - Maintain existing RLS protection
    - Update policies for the new structure
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON device_working_hours;
DROP POLICY IF EXISTS "Enable all access for admin users" ON device_working_hours;

-- Create temporary table with new structure
CREATE TABLE device_working_hours_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  CONSTRAINT device_working_hours_device_id_date_key UNIQUE (device_id, work_date)
);

-- Copy existing data with a default date for existing records
INSERT INTO device_working_hours_new (device_id, work_date, start_time, end_time)
SELECT 
  device_id,
  CURRENT_DATE + (day_of_week || ' days')::interval,
  start_time,
  end_time
FROM device_working_hours;

-- Drop old table
DROP TABLE device_working_hours;

-- Rename new table to original name
ALTER TABLE device_working_hours_new RENAME TO device_working_hours;

-- Create index
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