-- Delete remaining Isuzu D Max (with space) from the database

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
WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max';

-- Delete related data first (due to foreign key constraints)

-- Delete car images for this model
DELETE ci FROM car_images ci
JOIN cars c ON ci.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max';

-- Delete car features for this model
DELETE cf FROM car_features cf
JOIN cars c ON cf.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max';

-- Delete bookings related to this car (if any)
DELETE b FROM bookings b
JOIN cars c ON b.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max';

-- Delete reviews related to this car (if any)
DELETE r FROM reviews r
WHERE r.reviewable_type = 'car' AND r.reviewable_id IN (
    SELECT c.id FROM cars c
    JOIN car_models cm ON c.model_id = cm.id
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max'
);

-- Delete service bookings related to this car (if any)
DELETE sb FROM service_bookings sb
WHERE sb.car_id IN (
    SELECT c.id FROM cars c
    JOIN car_models cm ON c.model_id = cm.id
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max'
);

-- Now delete the actual car
DELETE FROM cars WHERE model_id IN (
    SELECT cm.id FROM car_models cm
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max'
);

-- Finally, delete the car model if it's not used by any other cars
DELETE FROM car_models WHERE id IN (
    SELECT cm.id FROM car_models cm
    JOIN car_brands cb ON cm.brand_id = cb.id
    WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max'
);

-- Verify deletion
SELECT 'Cars remaining for Isuzu D Max' as status, COUNT(*) as count
FROM cars c
JOIN car_models cm ON c.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE cb.name = 'Isuzu' AND cm.model_name = 'D Max';

SELECT 'Deletion completed successfully' as message;