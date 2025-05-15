/*
  # Devices and Examinations Schema

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category_id` (uuid, foreign key to device_categories)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
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
    
    - `examination_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `examinations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category_id` (uuid, foreign key to examination_categories)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `examination_devices`
      - `examination_id` (uuid, foreign key to examinations)
      - `device_id` (uuid, foreign key to devices)
      - Primary key (examination_id, device_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and managing data
    - Only admins can insert, update, and delete
    - Anyone authenticated can view
*/

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES device_categories(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Create examination categories table
CREATE TABLE IF NOT EXISTS examination_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create examinations table
CREATE TABLE IF NOT EXISTS examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES examination_categories(id) ON DELETE RESTRICT,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create examination devices junction table
CREATE TABLE IF NOT EXISTS examination_devices (
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  PRIMARY KEY (examination_id, device_id)
);

-- Enable RLS on all tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_devices ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_examination_categories_updated_at
  BEFORE UPDATE ON examination_categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_examinations_updated_at
  BEFORE UPDATE ON examinations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Policies for devices
CREATE POLICY "Anyone can view devices"
  ON devices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert devices"
  ON devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update devices"
  ON devices
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete devices"
  ON devices
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for device working hours
CREATE POLICY "Anyone can view device working hours"
  ON device_working_hours
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert device working hours"
  ON device_working_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update device working hours"
  ON device_working_hours
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete device working hours"
  ON device_working_hours
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for device exceptions
CREATE POLICY "Anyone can view device exceptions"
  ON device_exceptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert device exceptions"
  ON device_exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update device exceptions"
  ON device_exceptions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete device exceptions"
  ON device_exceptions
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for examination categories
CREATE POLICY "Anyone can view examination categories"
  ON examination_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert examination categories"
  ON examination_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update examination categories"
  ON examination_categories
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete examination categories"
  ON examination_categories
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for examinations
CREATE POLICY "Anyone can view examinations"
  ON examinations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert examinations"
  ON examinations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update examinations"
  ON examinations
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete examinations"
  ON examinations
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for examination devices
CREATE POLICY "Anyone can view examination devices"
  ON examination_devices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert examination devices"
  ON examination_devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update examination devices"
  ON examination_devices
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete examination devices"
  ON examination_devices
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial examination categories
INSERT INTO examination_categories (name) VALUES
  ('CT-Untersuchungen'),
  ('MRT-Untersuchungen')
ON CONFLICT (name) DO NOTHING;