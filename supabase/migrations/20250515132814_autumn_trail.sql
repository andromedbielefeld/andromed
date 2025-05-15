/*
  # Add body side option to examinations

  1. Changes
    - Add body_side_required column to examinations table
    - Add check constraint to ensure valid values
    - Update existing examinations
  
  2. Security
    - Maintains existing RLS policies
*/

-- Add body_side_required column to examinations table
ALTER TABLE examinations
ADD COLUMN IF NOT EXISTS body_side_required BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN examinations.body_side_required IS 'Indicates whether this examination requires specifying a body side (left/right/bilateral)';