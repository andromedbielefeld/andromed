/*
  # Device Categories Schema

  1. New Tables
    - `device_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `device_categories` table
    - Add policies for viewing and managing device categories
    - Only admins can insert, update, and delete categories
    
  3. Triggers
    - Add trigger to automatically update `updated_at`
    
  4. Initial Data
    - Insert CT and MRT categories
*/

-- Create device categories table
CREATE TABLE IF NOT EXISTS device_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE device_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view device categories"
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_device_categories_updated_at
  BEFORE UPDATE ON device_categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial categories
INSERT INTO device_categories (name) VALUES
  ('CT'),
  ('MRT')
ON CONFLICT (name) DO NOTHING;