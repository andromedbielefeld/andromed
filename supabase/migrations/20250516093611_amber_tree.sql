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