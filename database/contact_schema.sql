-- Contact/Messaging System Schema for CarHub360
-- This replaces/updates the previous messaging system with contact inquiries and responses
-- Run: mysql -u root -p carhub360 < database/contact_schema.sql

-- 1. Contact Categories
CREATE TABLE IF NOT EXISTS contact_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255),
    auto_response_template TEXT,
    priority_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    expected_response_hours INT DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_priority (priority_level),
    INDEX idx_active (is_active)
);

-- 2. Contact Inquiries (replaces conversations)
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inquiry_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., INQ2025001
    category_id INT,
    user_id INT,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status ENUM('new', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    assigned_to INT,  -- admin/dealer user_id
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES contact_categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category_id),
    INDEX idx_created_at (created_at)
);

-- 3. Contact Responses (replaces messages)
CREATE TABLE IF NOT EXISTS contact_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inquiry_id INT NOT NULL,
    responder_id INT NOT NULL,  -- sender_id, e.g., user or admin
    response_type ENUM('email', 'sms', 'in_app') DEFAULT 'email',
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES contact_inquiries(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id),
    INDEX idx_inquiry (inquiry_id),
    INDEX idx_responder (responder_id),
    INDEX idx_created_at (created_at)
);

-- Sample Data Insertion (based on provided data)
-- Insert Contact Categories
INSERT IGNORE INTO contact_categories (id, name, description, department, priority_level, expected_response_hours, is_active, created_at) VALUES
(1, 'General Inquiry', 'General questions about our services', 'Customer Service', 'medium', 24, 1, '2025-09-30 11:33:41'),
(2, 'Car Rental', 'Questions related to car rental services', 'Rental Department', 'high', 12, 1, '2025-09-30 11:33:41'),
(3, 'Car Purchase', 'Inquiries about buying vehicles', 'Sales Department', 'high', 8, 1, '2025-09-30 11:33:41'),
(4, 'Service Support', 'Vehicle service and maintenance support', 'Service Department', 'medium', 24, 1, '2025-09-30 11:33:41'),
(5, 'Technical Issue', 'Website or app technical problems', 'IT Support', 'urgent', 4, 1, '2025-09-30 11:33:41'),
(6, 'Complaint', 'Customer complaints and feedback', 'Management', 'high', 12, 1, '2025-09-30 11:33:41'),
(7, 'Partnership', 'Business partnership opportunities', 'Business Development', 'low', 48, 1, '2025-09-30 11:33:41');

-- Insert Sample Contact Inquiries (assuming user_id 27 for example)
INSERT IGNORE INTO contact_inquiries (id, inquiry_id, category_id, user_id, name, email, subject, message, priority, status, source, created_at, updated_at) VALUES
(1, 'INQ2025001', 2, 27, 'Rahman Ahmed', 'rahman@email.com', 'Car Rental Inquiry for Wedding', 'I need to rent a luxury car for my wedding ceremony...', 'high', 'new', 'website', '2025-09-30 11:33:41', '2025-09-30 11:33:41'),
(2, 'INQ2025002', 4, 27, 'Fatima Khan', 'fatima@email.com', 'Service Appointment Request', 'My car needs brake service. When is the earliest available slot?', 'medium', 'assigned', 'website', '2025-09-30 11:33:41', '2025-09-30 11:33:41');

-- Insert Sample Contact Responses (assuming admin_id 1)
INSERT IGNORE INTO contact_responses (id, inquiry_id, responder_id, response_type, content, created_at) VALUES
(1, 1, 1, 'email', 'Thank you for your inquiry. We have luxury cars available for rental. Please provide more details about your dates and preferences.',  '2025-09-30 11:33:41'),
(2, 2, 1, 'email', 'We have assigned your service request to our Dhaka branch. The earliest slot is next Tuesday at 10 AM.', '2025-09-30 11:33:41'),
(3, 1, 1, 'email', 'Thank you for your inquiry. We have luxury cars available for rental. Please provide more details about your dates and preferences.', '2025-09-30 11:37:10'),
(4, 2, 1, 'email', 'We have assigned your service request to our Dhaka branch. The earliest slot is next Tuesday at 10 AM.', '2025-09-30 11:37:10');

-- Note: If old tables (conversations, conversation_participants, messages) exist and need to be dropped/migrated, run:
-- DROP TABLE IF EXISTS messages, conversation_participants, conversations;
-- But backup data first if needed.