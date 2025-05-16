/*
  # Update devices table schema for slot management
  
  1. Changes
    - Remove legacy working hours and exceptions tables
    - Ensure available_slots column exists with proper type and index
    - Add documentation
  
  2. Notes
    - Safe migration that handles existing column
    - Preserves existing data
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS device_working_hours;
DROP TABLE IF EXISTS device_exceptions;

-- Add available_slots column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'devices' 
    AND column_name = 'available_slots'
  ) THEN
    ALTER TABLE devices
    ADD COLUMN available_slots JSONB DEFAULT '{}';
    
    -- Add comment
    COMMENT ON COLUMN devices.available_slots IS 'JSON object storing slot availability for each day';
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'idx_devices_available_slots'
  ) THEN
    CREATE INDEX idx_devices_available_slots ON devices USING GIN (available_slots);
  END IF;
END $$;