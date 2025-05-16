-- Remove available_slots column from devices
ALTER TABLE devices DROP COLUMN IF EXISTS available_slots;

-- Ensure device_working_hours table exists with proper structure
CREATE TABLE IF NOT EXISTS device_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  UNIQUE (device_id, day_of_week)
);

-- Ensure device_exceptions table exists with proper structure
CREATE TABLE IF NOT EXISTS device_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  reason text NOT NULL,
  UNIQUE (device_id, exception_date)
);

-- Enable RLS
ALTER TABLE device_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_exceptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON device_working_hours;
DROP POLICY IF EXISTS "Enable all access for admin users" ON device_working_hours;
DROP POLICY IF EXISTS "Enable read access for all users" ON device_exceptions;
DROP POLICY IF EXISTS "Enable all access for admin users" ON device_exceptions;

-- Create policies for device_working_hours
CREATE POLICY "Enable read access for all users"
ON device_working_hours
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_working_hours
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for device_exceptions
CREATE POLICY "Enable read access for all users"
ON device_exceptions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_exceptions
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_device_working_hours_device ON device_working_hours(device_id);
CREATE INDEX IF NOT EXISTS idx_device_exceptions_device_date ON device_exceptions(device_id, exception_date);