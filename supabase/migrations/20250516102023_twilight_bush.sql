/*
  # Slot Pool Implementation

  1. New Tables
    - `slot_pool`
      - `id` (uuid, primary key)
      - `examination_id` (uuid, foreign key to examinations)
      - `slot_date` (date)
      - `slot_id` (uuid, foreign key to time_slots)
      - `device_id` (uuid, foreign key to devices)
      - `device_name` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `is_earliest` (boolean)

  2. Changes
    - Add slot_status enum type for time_slots table
    - Add status column to time_slots table
    - Add indexes for efficient querying

  3. Security
    - Enable RLS on slot_pool table
    - Add policies for viewing and managing slots
*/

-- Create slot status enum
CREATE TYPE slot_status AS ENUM ('available', 'blocked', 'booked');

-- Create slot pool table
CREATE TABLE IF NOT EXISTS slot_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_earliest boolean NOT NULL DEFAULT false,
  UNIQUE (examination_id, slot_date, slot_id)
);

-- Create time slots table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  examination_id uuid NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status slot_status NOT NULL DEFAULT 'blocked',
  booked_by_appointment_id uuid UNIQUE REFERENCES appointments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slot_pool_examination_date ON slot_pool (examination_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slot_pool_earliest ON slot_pool (examination_id, slot_date, is_earliest) WHERE is_earliest = true;

CREATE INDEX IF NOT EXISTS idx_time_slots_device_start_status ON time_slots (device_id, start_time, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_examination_start_status ON time_slots (examination_id, start_time, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_next_available ON time_slots (examination_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_same_day_device ON time_slots (device_id, examination_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots (start_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_device_start_time ON time_slots (device_id, start_time);

-- Add trigger for updated_at
CREATE TRIGGER trigger_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE slot_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for slot_pool
CREATE POLICY "Enable read access for all users"
ON slot_pool
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON slot_pool
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for time_slots
CREATE POLICY "Enable read access for all users"
ON time_slots
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all access for admin users"
ON time_slots
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');