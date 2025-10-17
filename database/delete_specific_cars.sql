-- Delete Toyota Allion Premio and Isuzu D-Max from the database
-- This script will safely remove these car models and all related data

USE carhub360;

-- First, let's see what we're deleting (for verification)
SELECT 
    c.id,
    c.sku,
    cb.name as brand_name,
    cm.model_name,
    c.variant_name,
    c.year,
    c.rental_price_daily,
    c.selling_price
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
   OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu');

-- Delete related data first (due to foreign key constraints)

-- Delete car images for these models
DELETE ci FROM car_images ci
JOIN cars c ON ci.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
   OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu');

-- Delete car features for these models
DELETE cf FROM car_features cf
JOIN cars c ON cf.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
   OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu');

-- Delete bookings related to these cars (if any)
DELETE b FROM bookings b
JOIN cars c ON b.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
   OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu');

-- Delete reviews related to these cars (if any)
DELETE r FROM reviews r
WHERE r.reviewable_type = 'car' AND r.reviewable_id IN (
    SELECT c.id FROM cars c
    JOIN car_models cm ON c.model_id = cm.id
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
       OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu')
);

-- Delete service bookings related to these cars (if any)
DELETE sb FROM service_bookings sb
WHERE sb.car_id IN (
    SELECT c.id FROM cars c
    JOIN car_models cm ON c.model_id = cm.id
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
       OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu')
);

-- Now delete the actual cars
DELETE FROM cars WHERE model_id IN (
    SELECT cm.id FROM car_models cm
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
       OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu')
);

-- Finally, delete the car models if they're not used by any other cars
DELETE FROM car_models WHERE id IN (
    SELECT cm.id FROM car_models cm
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE (cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota')
       OR (cm.model_name = 'D-Max' AND cb.name = 'Isuzu')
);

-- Verify deletion
SELECT 'Cars remaining for Toyota Allion Premio' as status, COUNT(*) as count
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cm.model_name = 'Allion / Premio' AND cb.name = 'Toyota'

UNION ALL

SELECT 'Cars remaining for Isuzu D-Max' as status, COUNT(*) as count
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cm.model_name = 'D-Max' AND cb.name = 'Isuzu';

SELECT 'Deletion completed successfully' as message;