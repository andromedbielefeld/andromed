/*
  # Slot Status Enum Type

  1. New Types
    - `slot_status` enum type with values:
      - available: Slot is available for booking
      - blocked: Slot is blocked and not yet available
      - booked: Slot has been booked
*/

-- Create slot_status enum type
CREATE TYPE slot_status AS ENUM ('available', 'blocked', 'booked');

-- Add status column to time_slots table
ALTER TABLE time_slots
ADD COLUMN IF NOT EXISTS status slot_status NOT NULL DEFAULT 'available';

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots (status);