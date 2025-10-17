-- Populate car_features table with sample data
-- This script assigns features to cars based on their category and brand

USE carhub360;

-- First, let's see what cars we have
-- SELECT c.id, cb.name as brand, cm.model_name, cc.name as category 
-- FROM cars c 
-- JOIN car_models cm ON c.model_id = cm.id 
-- JOIN car_brands cb ON cm.brand_id = cb.id 
-- JOIN car_categories cc ON cm.category_id = cc.id;

-- Assign features to cars based on their category
-- SUVs get more space and safety features
-- Sedans get comfort and technology features
-- Luxury cars get premium features

-- Get all SUV cars and assign them SUV-appropriate features
INSERT INTO car_features (car_id, feature_id)
SELECT c.id, fm.id
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_categories cc ON cm.category_id = cc.id
CROSS JOIN features_master fm
WHERE cc.name IN ('SUV', 'suv', 'Sport Utility Vehicle') 
AND fm.category IN ('safety', 'comfort')
AND fm.id IN (1, 4, 7, 8, 9, 10) -- AC, Backup Camera, ABS, Airbags, Cruise Control, Power Steering
ON DUPLICATE KEY UPDATE car_id = car_id;

-- Get all Sedan cars and assign them sedan-appropriate features
INSERT INTO car_features (car_id, feature_id)
SELECT c.id, fm.id
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_categories cc ON cm.category_id = cc.id
CROSS JOIN features_master fm
WHERE cc.name IN ('Sedan', 'sedan') 
AND fm.category IN ('comfort', 'technology')
AND fm.id IN (1, 2, 3, 5, 9, 10) -- AC, GPS, Bluetooth, Leather Seats, Cruise Control, Power Steering
ON DUPLICATE KEY UPDATE car_id = car_id;

-- Get all Luxury cars (based on price or brand) and assign them premium features
INSERT INTO car_features (car_id, feature_id)
SELECT c.id, fm.id
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
CROSS JOIN features_master fm
WHERE (cb.name IN ('Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Rolls-Royce', 'Lamborghini') 
       OR c.selling_price > 5000000)
AND fm.id IN (2, 3, 5, 6, 9) -- GPS, Bluetooth, Leather Seats, Sunroof, Cruise Control
ON DUPLICATE KEY UPDATE car_id = car_id;

-- For all other cars, assign basic features
INSERT INTO car_features (car_id, feature_id)
SELECT c.id, fm.id
FROM cars c
CROSS JOIN features_master fm
WHERE fm.id IN (1, 7, 9, 10) -- AC, ABS, Cruise Control, Power Steering
AND c.id NOT IN (
    SELECT DISTINCT cf.car_id 
    FROM car_features cf
)
ON DUPLICATE KEY UPDATE car_id = car_id;

-- Add some technology features to newer cars (year >= 2020)
INSERT INTO car_features (car_id, feature_id)
SELECT c.id, fm.id
FROM cars c
CROSS JOIN features_master fm
WHERE c.year >= 2020 
AND fm.id IN (2, 3, 4) -- GPS, Bluetooth, Backup Camera
AND c.id NOT IN (
    SELECT cf.car_id 
    FROM car_features cf 
    WHERE cf.feature_id IN (2, 3, 4)
)
ON DUPLICATE KEY UPDATE car_id = car_id;

-- Verify the data was inserted
SELECT 
    c.id,
    cb.name as brand,
    cm.model_name,
    cc.name as category,
    COUNT(cf.feature_id) as feature_count
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
JOIN car_categories cc ON cm.category_id = cc.id
LEFT JOIN car_features cf ON c.id = cf.car_id
GROUP BY c.id, cb.name, cm.model_name, cc.name
ORDER BY feature_count DESC;