-- Add is_read column to messages table for read tracking
-- Run: mysql -u root -p carhub360 < database/add_is_read_to_messages.sql

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read TINYINT(1) DEFAULT 0 AFTER content;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Update existing messages to unread (0) for demo
UPDATE messages SET is_read = 0 WHERE is_read IS NULL;