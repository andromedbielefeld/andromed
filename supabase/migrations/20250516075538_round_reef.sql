/*
  # Add signature field to appointments

  1. Changes
    - Add signature column to appointments table
    - Add comment to explain the column
*/

-- Add signature column to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS signature text;

-- Add comment to explain the column
COMMENT ON COLUMN appointments.signature IS 'Base64 encoded signature data';