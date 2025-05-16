/*
  # Slot Pool Schema

  1. New Tables
    - `slot_pool`
      - `id` (uuid, primary key)
      - `examination_id` (uuid, foreign key to examinations)
      - `slot_date` (date)
      - `slot_id` (uuid, foreign key to time_slots)
      - `device_id` (uuid, foreign key to devices)
      - `device_name` (text)
      - `start_time` (timestamp with time zone)
      - `end_time` (timestamp with time zone)
      - `is_earliest` (boolean)

  2. Indexes
    - Index on (examination_id, slot_date) for fast lookups
    - Index on (examination_id, slot_date, is_earliest) for finding earliest slots
    - Unique index on (examination_id, slot_date, slot_id) to prevent duplicates

  3. Foreign Keys
    - References to examinations, time_slots, and devices tables
    - ON DELETE CASCADE to automatically clean up when referenced records are deleted
*/

-- Create slot_pool table
CREATE TABLE IF NOT EXISTS slot_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid NOT NULL,
  slot_date date NOT NULL,
  slot_id uuid NOT NULL,
  device_id uuid NOT NULL,
  device_name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_earliest boolean NOT NULL DEFAULT false,

  -- Foreign key constraints
  FOREIGN KEY (examination_id) REFERENCES examinations(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,

  -- Unique constraint to prevent duplicates
  CONSTRAINT unique_slot_pool_entry UNIQUE (examination_id, slot_date, slot_id)
);

-- Create indexes for performance
CREATE INDEX idx_slot_pool_examination_date ON slot_pool (examination_id, slot_date);
CREATE INDEX idx_slot_pool_earliest ON slot_pool (examination_id, slot_date, is_earliest) WHERE is_earliest = true;