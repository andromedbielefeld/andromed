/*
  # Update Appointments Schema

  1. New Columns
    - `body_side` (text, nullable): For left/right/bilateral selection
    - `visit_reason` (text): Reason for the visit
    - `suspected_diagnosis` (text): Doctor's diagnosis
    - `needs_contrast_medium` (boolean): Whether contrast medium is needed
    - `creatinine_value` (text, nullable): Creatinine value if contrast medium is used
    - `has_claustrophobia` (boolean): Whether patient has claustrophobia
    - `street` (text): Patient's street address
    - `zip_code` (text): Patient's ZIP code
    - `city` (text): Patient's city
    - `insurance_type_id` (uuid): Reference to insurance_types table

  2. Constraints
    - Foreign key to insurance_types table
    - Check constraint for body_side values
    - NOT NULL constraints for required fields

  3. Indexes
    - Index on insurance_type_id for faster lookups
*/

-- Add new columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS body_side text,
ADD COLUMN IF NOT EXISTS visit_reason text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS suspected_diagnosis text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS needs_contrast_medium boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS creatinine_value text,
ADD COLUMN IF NOT EXISTS has_claustrophobia boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS street text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS zip_code text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS insurance_type_id uuid REFERENCES insurance_types(id);

-- Add check constraint for body_side values
ALTER TABLE appointments
ADD CONSTRAINT appointments_body_side_check 
CHECK (body_side IS NULL OR body_side IN ('left', 'right', 'bilateral'));

-- Create index for insurance type lookups
CREATE INDEX IF NOT EXISTS idx_appointments_insurance_type 
ON appointments(insurance_type_id);

-- Remove default values that were only needed for the migration
ALTER TABLE appointments
ALTER COLUMN visit_reason DROP DEFAULT,
ALTER COLUMN suspected_diagnosis DROP DEFAULT,
ALTER COLUMN street DROP DEFAULT,
ALTER COLUMN zip_code DROP DEFAULT,
ALTER COLUMN city DROP DEFAULT;

-- Add comments to explain columns
COMMENT ON COLUMN appointments.body_side IS 'The side of the body to be examined (left/right/bilateral)';
COMMENT ON COLUMN appointments.visit_reason IS 'The reason for the patient''s visit';
COMMENT ON COLUMN appointments.suspected_diagnosis IS 'The doctor''s suspected diagnosis';
COMMENT ON COLUMN appointments.needs_contrast_medium IS 'Whether contrast medium is needed for the examination';
COMMENT ON COLUMN appointments.creatinine_value IS 'Patient''s creatinine value if contrast medium is used';
COMMENT ON COLUMN appointments.has_claustrophobia IS 'Whether the patient has claustrophobia';
COMMENT ON COLUMN appointments.street IS 'Patient''s street address';
COMMENT ON COLUMN appointments.zip_code IS 'Patient''s ZIP code';
COMMENT ON COLUMN appointments.city IS 'Patient''s city';
COMMENT ON COLUMN appointments.insurance_type_id IS 'Reference to the patient''s insurance type';