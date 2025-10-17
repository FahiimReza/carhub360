-- Create coupon_lists table for storing game-generated coupons
CREATE TABLE IF NOT EXISTS coupon_lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    serial_number VARCHAR(50) NOT NULL UNIQUE,
    coupon_code VARCHAR(100) NOT NULL,
    game_type VARCHAR(50) NOT NULL DEFAULT 'memory_game',
    user_id INT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    discount_value DECIMAL(10, 2) DEFAULT 10.00,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_serial_number (serial_number),
    INDEX idx_coupon_code (coupon_code),
    INDEX idx_game_type (game_type),
    INDEX idx_used (used),
    INDEX idx_created_at (created_at)
);

-- Insert sample coupon data for testing
INSERT INTO coupon_lists (serial_number, coupon_code, game_type, discount_value, description) VALUES
('MEM-2025-0001', 'MEMORY10', 'memory_game', 10.00, '10% discount from Memory Game - Complete in under 1 minute'),
('MEM-2025-0002', 'MEMORY15', 'memory_game', 15.00, '15% discount from Memory Game - Complete in under 45 seconds'),
('MEM-2025-0003', 'MEMORY20', 'memory_game', 20.00, '20% discount from Memory Game - Perfect game with no mistakes');