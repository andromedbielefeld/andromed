/*
  # Update Device Slots Schema

  1. Changes
    - Remove device_working_hours and device_exceptions tables
    - Add available_slots column to devices table to store slot availability
    - Update triggers and policies
  
  2. Data Structure
    - available_slots is a JSONB column storing:
      {
        "2025-05-17": [true, false, true, ...], // 24 boolean values for each half hour
        "2025-05-18": [true, false, true, ...]
      }
*/

-- Drop old tables
DROP TABLE IF EXISTS device_working_hours;
DROP TABLE IF EXISTS device_exceptions;

-- Add available_slots column to devices
ALTER TABLE devices
ADD COLUMN available_slots JSONB DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN devices.available_slots IS 'JSON object storing slot availability for each day';

-- Create index for faster JSON queries
CREATE INDEX idx_devices_available_slots ON devices USING GIN (available_slots);