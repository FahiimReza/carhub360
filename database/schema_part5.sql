-- Part 5: Messaging System & Sample Data

-- 20. Blog Comments (3NF)
CREATE TABLE blog_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NULL,
    guest_name VARCHAR(100),
    guest_email VARCHAR(100),
    parent_id INT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'spam', 'trash') DEFAULT 'pending',
    ip_address VARCHAR(45),
    user_agent TEXT,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES blog_comments(id)
);

-- 21. Conversations table
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Conversation Participants table
CREATE TABLE conversation_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    user_id INT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 23. Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    sender_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- 24. Reviews (3NF)
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reviewable_type ENUM('car', 'service', 'booking') NOT NULL,
    reviewable_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    pros TEXT,
    cons TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    total_votes INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ====== SAMPLE DATA ======

-- Insert User Roles
INSERT INTO user_roles (role_name, permissions, description) VALUES
('user', '["view_cars", "book_rental", "create_blog_post", "comment"]', 'Regular customer'),
('admin', '["*"]', 'Full system access'),
('dealer', '["manage_cars", "view_bookings", "respond_inquiries"]', 'Car dealer/owner'),
('technician', '["manage_services", "view_service_bookings"]', 'Service technician'),
('moderator', '["moderate_blog", "moderate_comments", "handle_inquiries"]', 'Content moderator');

-- Insert Sample Users
INSERT INTO users (username, email, password, first_name, last_name, phone, role_id, city, country) VALUES
('admin', 'admin@carhub360.com', '$2b$10$example_hash', 'System', 'Administrator', '+8801712345678', 2, 'Dhaka', 'Bangladesh'),
('john_doe', 'john@example.com', '$2b$10$example_hash', 'John', 'Doe', '+8801712345679', 1, 'Dhaka', 'Bangladesh'),
('dealer_ahmed', 'ahmed@dealer.com', '$2b$10$example_hash', 'Ahmed', 'Hassan', '+8801712345680', 3, 'Chittagong', 'Bangladesh');

-- Insert Sample Conversations
INSERT INTO conversations (subject) VALUES
('Inquiry about Toyota Camry'),
('Booking confirmation for Honda Civic'),
('Service appointment request');

-- Insert Sample Conversation Participants (user 2=john_doe, admin=1)
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 2), (1, 1),
(2, 2), (2, 1),
(3, 2), (3, 1);

-- Insert Sample Messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(1, 2, 'Hi, I''m interested in the 2023 Toyota Camry. Can you provide more details about the features and pricing?'),
(1, 1, 'Hello John! The 2023 Toyota Camry starts at $25,000 with advanced safety features including adaptive cruise control and lane departure warning. Would you like to schedule a test drive?'),
(2, 2, 'I would like to confirm my booking for the Honda Civic from June 15-20. Reference #BK12345.'),
(2, 1, 'Booking confirmed! Your Honda Civic will be ready at our Dhaka location. Please bring your ID and license.'),
(3, 2, 'I need to book a service for my car. Oil change and tire rotation please.'),
(3, 1, 'Service booked for next Tuesday at 10 AM. Estimated cost: $50. Any additional requests?');