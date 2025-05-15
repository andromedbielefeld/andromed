/*
  # Doctors Schema

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key, references auth.users)
      - `title` (text, e.g. "Dr. med.", "Prof. Dr. med.")
      - `first_name` (text)
      - `last_name` (text)
      - `specialty` (text)
      - `practice_name` (text)
      - `street` (text)
      - `zip_code` (text)
      - `city` (text)
      - `phone` (text)
      - `fax` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean)
      - `needs_password_change` (boolean)
  
  2. Security
    - Enable RLS
    - Add policies for viewing and managing doctors
    - Only admins can create/update/delete
    - Doctors can view all doctors
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialty text NOT NULL,
  practice_name text NOT NULL,
  street text NOT NULL,
  zip_code text NOT NULL,
  city text NOT NULL,
  phone text NOT NULL,
  fax text,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  needs_password_change boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable all access for admin users"
  ON doctors
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS doctors_email_idx ON doctors(email);
CREATE INDEX IF NOT EXISTS doctors_name_idx ON doctors(last_name, first_name);

-- Create trigger for updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();