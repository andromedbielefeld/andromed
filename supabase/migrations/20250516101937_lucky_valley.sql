/*
  # Time Slots Indexes

  1. New Indexes
    - Index on start_time for chronological queries
    - Index on (device_id, start_time) for device availability
    - Index on (examination_id, start_time, status) for finding next available slot
    - Index on (device_id, examination_id, status, start_time) for finding slots on same day
*/

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots (start_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_device_start_time ON time_slots (device_id, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_next_available ON time_slots (examination_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_same_day_device ON time_slots (device_id, examination_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_device_start_status ON time_slots (device_id, start_time, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_examination_start_status ON time_slots (examination_id, start_time, status);