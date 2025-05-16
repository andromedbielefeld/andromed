/*
  # Add Device Working Hours and Exceptions Tables

  1. New Tables
    - `device_working_hours`
      - `id` (uuid, primary key)
      - `device_id` (uuid, foreign key to devices)
      - `day_of_week` (integer, 0-6)
      - `start_time` (time)
      - `end_time` (time)
    
    - `device_exceptions`
      - `id` (uuid, primary key)
      - `device_id` (uuid, foreign key to devices)
      - `exception_date` (date)
      - `reason` (text)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing data
    - Only admins can modify data
*/

-- Create device working hours table
CREATE TABLE IF NOT EXISTS device_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  UNIQUE (device_id, day_of_week)
);

-- Create device exceptions table
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

-- Create policies for device working hours
CREATE POLICY "Enable read access for all users"
ON device_working_hours
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_working_hours
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for device exceptions
CREATE POLICY "Enable read access for all users"
ON device_exceptions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON device_exceptions
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');