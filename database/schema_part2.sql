-- Part 2: Vehicle Management System

-- 4. Car Brands (1NF)
CREATE TABLE car_brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    country VARCHAR(50),
    founded_year INT,
    description TEXT,
    website VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Car Categories (1NF)
CREATE TABLE car_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Car Models (2NF)
CREATE TABLE car_models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    production_start_year INT,
    production_end_year INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES car_brands(id),
    FOREIGN KEY (category_id) REFERENCES car_categories(id)
);

-- 7. Features Master (1NF)
CREATE TABLE features_master (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('safety', 'comfort', 'technology', 'performance', 'exterior', 'interior') NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Cars Inventory (3NF)
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE,
    model_id INT NOT NULL,
    variant_name VARCHAR(100),
    year INT NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'hybrid', 'electric', 'cng') DEFAULT 'petrol',
    transmission ENUM('manual', 'automatic', 'cvt') NOT NULL,
    engine_displacement VARCHAR(20),
    engine_power VARCHAR(20),
    engine_torque VARCHAR(20),
    drivetrain ENUM('fwd', 'rwd', 'awd', '4wd') DEFAULT 'fwd',
    seats INT DEFAULT 5,
    doors INT DEFAULT 4,
    fuel_capacity VARCHAR(20),
    mileage_city VARCHAR(20),
    mileage_highway VARCHAR(20),
    top_speed VARCHAR(20),
    acceleration_0_100 VARCHAR(20),
    ground_clearance VARCHAR(20),
    boot_space VARCHAR(20),
    curb_weight VARCHAR(20),
    dimensions_length VARCHAR(20),
    dimensions_width VARCHAR(20),
    dimensions_height VARCHAR(20),
    wheelbase VARCHAR(20),
    exterior_color VARCHAR(50),
    interior_color VARCHAR(50),
    odometer_reading INT DEFAULT 0,
    condition_rating ENUM('excellent', 'very_good', 'good', 'fair', 'poor') DEFAULT 'excellent',
    rental_price_daily DECIMAL(10,2),
    rental_price_weekly DECIMAL(10,2),
    rental_price_monthly DECIMAL(10,2),
    selling_price DECIMAL(12,2),
    original_price DECIMAL(12,2),
    depreciation_rate DECIMAL(5,2),
    insurance_value DECIMAL(12,2),
    registration_number VARCHAR(50),
    registration_expiry DATE,
    insurance_policy VARCHAR(100),
    insurance_expiry DATE,
    last_service_date DATE,
    next_service_due DATE,
    owner_id INT,
    dealer_id INT,
    current_location VARCHAR(255),
    parking_location VARCHAR(255),
    availability_status ENUM('available', 'rented', 'sold', 'maintenance', 'reserved') DEFAULT 'available',
    listing_status ENUM('active', 'inactive', 'pending', 'sold') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    inquiries_count INT DEFAULT 0,
    description TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES car_models(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (dealer_id) REFERENCES users(id)
);