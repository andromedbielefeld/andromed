/*
  # Remove old slots storage from devices table

  1. Changes
    - Remove available_slots column from devices table
    - Drop related index
*/

-- Remove available_slots column and index
DROP INDEX IF EXISTS idx_devices_available_slots;
ALTER TABLE devices DROP COLUMN IF EXISTS available_slots;