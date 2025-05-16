-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON specialties;
DROP POLICY IF EXISTS "Enable all access for admin users" ON specialties;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON examination_specialties;
DROP POLICY IF EXISTS "Enable all access for admin users" ON examination_specialties;

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