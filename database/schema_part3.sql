-- Part 3: Booking & Service Systems

-- 9. Car Features Junction (3NF)
CREATE TABLE car_features (
    car_id INT NOT NULL,
    feature_id INT NOT NULL,
    is_standard BOOLEAN DEFAULT TRUE,
    additional_cost DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (car_id, feature_id),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES features_master(id)
);

-- 10. Car Images (3NF)
CREATE TABLE car_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type ENUM('exterior', 'interior', 'engine', 'documents', 'other') DEFAULT 'exterior',
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(200),
    caption TEXT,
    sort_order INT DEFAULT 0,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 11. Payment Methods (1NF)
CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Bookings (3NF)
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    booking_type ENUM('rental', 'purchase', 'test_drive') NOT NULL,
    rental_start_date DATETIME,
    rental_end_date DATETIME,
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    pickup_instructions TEXT,
    dropoff_instructions TEXT,
    driver_required BOOLEAN DEFAULT FALSE,
    driver_id INT NULL,
    total_days INT,
    base_price DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method_id INT,
    payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    booking_status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    cancelled_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (driver_id) REFERENCES users(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

-- 13. Service Categories (1NF)
CREATE TABLE service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Services (2NF)
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    skill_level ENUM('basic', 'intermediate', 'advanced', 'expert') DEFAULT 'basic',
    tools_required TEXT,
    parts_included TEXT,
    warranty_days INT DEFAULT 0,
    is_mobile_service BOOLEAN DEFAULT FALSE,
    requires_appointment BOOLEAN DEFAULT TRUE,
    popularity_score INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id)
);