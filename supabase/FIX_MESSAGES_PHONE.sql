-- Add phone column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
