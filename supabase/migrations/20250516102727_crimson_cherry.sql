/*
  # Slot Pool and Time Slots Schema

  1. New Tables
    - `slot_pool`: Stores only available slots for quick access
    - `time_slots`: Stores all slots with their status
  
  2. Changes
    - Add slot_status enum if it doesn't exist
    - Create tables with appropriate constraints and indexes
    - Enable RLS with policies for both tables
    
  3. Security
    - Read access for all authenticated users
    - Full access for admin users only
*/

-- Create slot status enum if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slot_status') THEN
    CREATE TYPE slot_status AS ENUM ('available', 'blocked', 'booked');
  END IF;
END $$;

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
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_time_slots_updated_at'
  ) THEN
    CREATE TRIGGER trigger_time_slots_updated_at
      BEFORE UPDATE ON time_slots
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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