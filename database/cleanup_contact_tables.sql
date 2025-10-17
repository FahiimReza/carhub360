-- Cleanup script: Drop conflicting contact tables to use conversations schema exclusively
-- ⚠️ WARNING: This will DELETE all data in contact tables. Backup first!
-- Run: mysql -u root -p carhub360 < database/cleanup_contact_tables.sql

-- Drop in reverse dependency order
DROP TABLE IF EXISTS contact_responses;
DROP TABLE IF EXISTS contact_inquiries;
DROP TABLE IF EXISTS contact_categories;

-- Verify conversations tables remain
-- SHOW TABLES LIKE 'conversations%';
-- SHOW TABLES LIKE 'messages';

-- Note: After running this, ensure your application uses /api/messages/conversations endpoints
-- and run database/add_is_read_to_messages.sql if needed for read tracking