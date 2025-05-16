/*
  # Add available_slots column to devices table

  1. Changes
    - Add JSONB column `available_slots` to devices table
    - Set default value to empty JSON object
    - Add comment explaining the column's purpose
  
  2. Security
    - Maintains existing RLS policies
*/

-- Add available_slots column
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS available_slots JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN devices.available_slots IS 'Stores device availability slots as a JSON object with dates as keys and arrays of boolean values as values';