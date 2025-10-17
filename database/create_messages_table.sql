-- Create the missing messages table for the messaging system
-- Run: mysql -u root -p carhub360 < database/create_messages_table.sql

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Optional: Insert sample data if needed
-- INSERT INTO messages (conversation_id, sender_id, content) VALUES
-- (1, 2, 'Sample message content'),
-- (1, 1, 'Admin reply sample');