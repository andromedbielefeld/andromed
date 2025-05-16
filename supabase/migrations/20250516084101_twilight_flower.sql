/*
  # Specialties Schema Update

  1. Changes
    - Create specialties table for medical specialties
    - Create junction table for examinations and specialties
    - Add RLS policies for both tables
    - Insert initial specialty data
  
  2. Security
    - Enable RLS on all tables
    - Allow read access for all authenticated users
    - Restrict modifications to admin users only
*/

-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Create policies for specialties
CREATE POLICY "Enable read access for authenticated users"
ON specialties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON specialties
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS specialties_name_idx ON specialties (name);

-- Create trigger for automatic updated_at
CREATE OR REPLACE TRIGGER update_specialties_updated_at
  BEFORE UPDATE ON specialties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create junction table for examinations and specialties
CREATE TABLE IF NOT EXISTS examination_specialties (
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (examination_id, specialty_id)
);

-- Enable RLS on junction table
ALTER TABLE examination_specialties ENABLE ROW LEVEL SECURITY;

-- Create policies for junction table
CREATE POLICY "Enable read access for authenticated users"
ON examination_specialties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON examination_specialties
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert initial specialties
INSERT INTO specialties (name) VALUES
  ('Allgemeinmedizin'),
  ('Anästhesiologie'),
  ('Augenheilkunde'),
  ('Chirurgie'),
  ('Dermatologie'),
  ('Gynäkologie'),
  ('Innere Medizin'),
  ('Kardiologie'),
  ('Neurologie'),
  ('Orthopädie'),
  ('Pädiatrie'),
  ('Psychiatrie'),
  ('Radiologie'),
  ('Urologie')
ON CONFLICT (name) DO NOTHING;