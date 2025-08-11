-- Migration script to add daily ticket tracking support
-- Run this script if you have an existing TicketTrack Pro installation

-- Step 1: Add work_date column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS work_date DATE DEFAULT CURRENT_DATE;

-- Step 2: Update existing tickets to have work_date based on created_at
UPDATE tickets 
SET work_date = DATE(created_at) 
WHERE work_date IS NULL;

-- Step 3: Drop the old unique constraint (ticket_id, user_id)
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_ticket_id_user_id_key;

-- Step 4: Add new unique constraint (ticket_id, user_id, work_date)
ALTER TABLE tickets 
ADD CONSTRAINT tickets_ticket_id_user_id_work_date_key 
UNIQUE (ticket_id, user_id, work_date);

-- Step 5: Create index for better performance on work_date queries
CREATE INDEX IF NOT EXISTS idx_tickets_work_date ON tickets(work_date);
CREATE INDEX IF NOT EXISTS idx_tickets_user_work_date ON tickets(user_id, work_date);

-- Verify the migration
SELECT 
  COUNT(*) as total_tickets,
  COUNT(DISTINCT work_date) as unique_work_dates,
  MIN(work_date) as earliest_work_date,
  MAX(work_date) as latest_work_date
FROM tickets;

-- Show sample data to verify
SELECT 
  ticket_id,
  status,
  work_date,
  created_at,
  updated_at
FROM tickets 
ORDER BY work_date DESC, created_at DESC 
LIMIT 10;
