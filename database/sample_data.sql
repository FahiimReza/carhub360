-- CarHub360 Sample Data
-- Run after schema.sql

USE carhub360;

-- Features Master
INSERT INTO features_master (name, category, icon, description) VALUES
('Air Conditioning', 'comfort', 'snowflake', 'Climate control system'),
('GPS Navigation', 'technology', 'map-pin', 'Built-in navigation system'),
('Bluetooth Connectivity', 'technology', 'bluetooth', 'Wireless connectivity'),
('Backup Camera', 'safety', 'camera', 'Rear view camera'),
('Leather Seats', 'comfort', 'armchair', 'Premium leather seating'),
('Sunroof', 'comfort', 'sun', 'Panoramic sunroof'),
('ABS Brakes', 'safety', 'disc', 'Anti-lock braking system'),
('Airbags', 'safety', 'shield', 'Multiple safety airbags'),
('Cruise Control', 'technology', 'navigation', 'Automatic speed control'),
('Power Steering', 'comfort', 'steering-wheel', 'Electric power steering');

-- Payment Methods
INSERT INTO payment_methods (method_name, provider, processing_fee_percentage, is_active) VALUES
('Credit Card', 'Visa/Mastercard', 2.5, TRUE),
('Mobile Banking', 'bKash', 1.5, TRUE),
('Bank Transfer', 'Direct Transfer', 0.0, TRUE),
('Cash', 'Cash Payment', 0.0, TRUE),
('Digital Wallet', 'Nagad', 1.0, TRUE);

-- Service Categories
INSERT INTO service_categories (name, description, icon, sort_order) VALUES
('Maintenance', 'Regular vehicle maintenance services', 'wrench', 1),
('Repair', 'Vehicle repair and troubleshooting', 'tool', 2),
('Cleaning', 'Car washing and detailing services', 'droplets', 3),
('Inspection', 'Vehicle safety and performance checks', 'search', 4),
('Emergency', '24/7 emergency roadside assistance', 'phone', 5);

-- Services
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, warranty_days) VALUES
(1, 'Oil Change', 'Complete engine oil and filter replacement', 2500.00, 60, 30),
(1, 'Tire Rotation', 'Professional tire rotation and alignment', 1500.00, 45, 15),
(2, 'Brake Repair', 'Brake pad and disc replacement', 8000.00, 120, 90),
(2, 'AC Service', 'Air conditioning system repair and servicing', 4500.00, 90, 60),
(2, 'Engine Diagnostics', 'Complete engine health checkup', 3000.00, 60, 0),
(3, 'Premium Car Wash', 'Interior and exterior deep cleaning', 1200.00, 90, 0),
(3, 'Car Detailing', 'Professional car detailing service', 5000.00, 180, 0),
(4, 'Safety Inspection', 'Complete vehicle safety inspection', 2000.00, 45, 0);

-- Blog Categories
INSERT INTO blog_categories (name, slug, description, icon, color_code) VALUES
('Car Reviews', 'car-reviews', 'Detailed reviews of various car models', 'star', '#00d4ff'),
('Maintenance Tips', 'maintenance-tips', 'Tips for keeping your car in top condition', 'wrench', '#ff4081'),
('Industry News', 'industry-news', 'Latest news from automotive industry', 'newspaper', '#ffab40'),
('Buying Guide', 'buying-guide', 'Guides for purchasing the right vehicle', 'shopping-cart', '#4caf50'),
('Travel Stories', 'travel-stories', 'Road trip experiences and travel stories', 'map', '#9c27b0');

-- Blog Tags
INSERT INTO blog_tags (name, slug, description, color_code) VALUES
('sedan', 'sedan', 'Posts about sedan cars', '#2196f3'),
('suv', 'suv', 'Posts about SUV vehicles', '#ff9800'),
('electric', 'electric', 'Electric vehicle related content', '#4caf50'),
('maintenance', 'maintenance', 'Car maintenance related posts', '#607d8b'),
('review', 'review', 'Car review posts', '#e91e63'),
('tips', 'tips', 'Helpful tips and tricks', '#673ab7'),
('news', 'news', 'Industry news and updates', '#ff5722');

-- Contact Categories
INSERT INTO contact_categories (name, description, department, expected_response_hours, priority_level) VALUES
('General Inquiry', 'General questions about our services', 'Customer Service', 24, 'medium'),
('Car Rental', 'Questions related to car rental services', 'Rental Department', 12, 'high'),
('Car Purchase', 'Inquiries about buying vehicles', 'Sales Department', 8, 'high'),
('Service Support', 'Vehicle service and maintenance support', 'Service Department', 24, 'medium'),
('Technical Issue', 'Website or app technical problems', 'IT Support', 4, 'urgent'),
('Complaint', 'Customer complaints and feedback', 'Management', 12, 'high'),
('Partnership', 'Business partnership opportunities', 'Business Development', 48, 'low');

-- Sample Service Bookings
INSERT INTO service_bookings (booking_reference, user_id, service_id, scheduled_date, 
                            service_location, base_price, total_amount, service_status) VALUES
('SV2025001', 2, 1, '2025-01-20 14:00:00', 'Customer Location', 2500.00, 2500.00, 'scheduled'),
('SV2025002', 3, 3, '2025-01-22 10:00:00', 'Service Center Dhaka', 8000.00, 8000.00, 'confirmed');

-- Sample Blog Posts
INSERT INTO blog_posts (title, slug, excerpt, content, author_id, category_id, status, 
                       published_at, views_count, allow_comments) VALUES
('Best Family Cars in Bangladesh 2025', 'best-family-cars-bangladesh-2025', 
 'Discover the top family-friendly vehicles available in Bangladesh this year.',
 'When choosing a family car in Bangladesh, safety, comfort, and fuel efficiency are key factors...', 
 1, 4, 'published', '2025-01-10 08:00:00', 145, TRUE),
('Essential Car Maintenance Tips for Monsoon Season', 'car-maintenance-monsoon-tips',
 'Keep your vehicle in perfect condition during Bangladesh monsoon season.',
 'The monsoon season in Bangladesh can be challenging for vehicles. Here are essential tips...', 
 1, 2, 'published', '2025-01-12 10:30:00', 89, TRUE);

-- Blog Post Tags (Junction)
INSERT INTO blog_post_tags (post_id, tag_id) VALUES
(1, 1), (1, 5), (1, 6),
(2, 4), (2, 6);

-- Sample Blog Comments
INSERT INTO blog_comments (post_id, user_id, content, status) VALUES
(1, 2, 'Great article! Very helpful for families looking for new cars.', 'approved'),
(2, 3, 'These tips saved me during last monsoon. Thank you!', 'approved');

-- Sample Conversations (focus on conversations schema)
-- Ensure conversations, conversation_participants, messages tables are used
INSERT INTO conversations (subject) VALUES
('Car Rental Inquiry for Wedding'),
('Service Appointment Request'),
('General Car Question');

-- Add participants (user_id 2 = john_doe, admin = 1)
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 2), (1, 1),
(2, 2), (2, 1),
(3, 2), (3, 1);

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
-- Conversation 1
(1, 2, 'Hi, I need to rent a luxury car for my wedding ceremony next month. Please provide details about available options and pricing.'),
(1, 1, 'Hello Rahman! We have several luxury vehicles available for wedding rentals including Mercedes C-Class and BMW X5. Prices start from ৳15,000/day. Would you like me to send you the full package details?'),
(1, 2, 'Yes please, and what about availability for mid-December?'),
(1, 1, 'We have availability from December 15-20. I\'ll email you the detailed proposal shortly.'),

-- Conversation 2
(2, 2, 'My Toyota Camry needs brake service. When is the earliest appointment available at your Dhaka branch?'),
(2, 1, 'Hello Fatima! We can schedule your brake service for this Friday at 10 AM. The estimated cost is ৳8,000 including parts and labor. Does that work for you?'),
(2, 2, 'Perfect, please book it for me.'),
(2, 1, 'Appointment confirmed! Reference #SV2025003. Please arrive 15 minutes early with your vehicle documents.'),

-- Conversation 3
(3, 2, 'I\'m looking to buy a family car under ৳30 lakhs. What would you recommend?'),
(3, 1, 'For family use under ৳30 lakhs, I recommend the Toyota Corolla Altis or Honda Civic. Both offer excellent safety features and fuel efficiency. Would you like to schedule a test drive?'),
(3, 2, 'Yes, the Corolla sounds good. When can I test drive?'),
(3, 1, 'We have availability tomorrow at 2 PM at our Gulshan showroom. I\'ll reserve a vehicle for you.');

-- Sample Reviews
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, 
                    verified_purchase, status) VALUES
(3, 'service', 1, 4, 'Quick Oil Change Service', 
 'Professional service, completed on time. Staff was courteous and explained everything clearly.', 
 TRUE, 'approved');

-- Additional User Preferences
INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES
(2, 'preferred_language', 'en'),
(2, 'notification_email', 'true'),
(2, 'notification_sms', 'false'),
(3, 'preferred_language', 'bn'),
(3, 'notification_email', 'true'),
(3, 'preferred_currency', 'BDT');

-- Mark some messages as read for demo (after adding is_read column)
-- Run add_is_read_to_messages.sql first if needed
UPDATE messages SET is_read = 1 WHERE id IN (2, 4, 6, 8, 10, 12);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cars_status ON cars(availability_status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_car ON bookings(car_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
