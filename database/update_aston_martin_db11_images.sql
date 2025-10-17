-- Update images for Aston Martin DB11
-- Assumes the car exists from add_cars.sql (model_name = 'DB11')

-- Delete existing placeholder images for this car if any
DELETE FROM car_images WHERE car_id = (SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11');

-- Insert the new uploaded images
INSERT INTO car_images (car_id, image_url, is_primary, image_type, alt_text, sort_order) VALUES
((SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11'), '/assets/car-images/aston_martin_db11/pexels-josh-kobayashi-498858-4083523.jpg', true, 'exterior', 'Aston Martin DB11 exterior view 1', 0),
((SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11'), '/assets/car-images/aston_martin_db11/pexels-kristof-sass-kovan-64832383-8190663.jpg', false, 'exterior', 'Aston Martin DB11 exterior view 2', 1),
((SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11'), '/assets/car-images/aston_martin_db11/pexels-mohit-hambiria-92377455-20435114.jpg', false, 'exterior', 'Aston Martin DB11 exterior view 3', 2),
((SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11'), '/assets/car-images/aston_martin_db11/pexels-raimundo-campbell-2149207419-30479148.jpg', false, 'exterior', 'Aston Martin DB11 exterior view 4', 3),
((SELECT c.id FROM cars c JOIN car_models cm ON c.model_id = cm.id WHERE cm.model_name = 'DB11'), '/assets/car-images/aston_martin_db11/pexels-shantumsingh-6476897.jpg', false, 'exterior', 'Aston Martin DB11 exterior view 5', 4);

-- Verify the update
SELECT ci.*, c.model_id, cm.model_name FROM car_images ci
JOIN cars c ON ci.car_id = c.id
JOIN car_models cm ON c.model_id = cm.id
WHERE cm.model_name = 'DB11'
ORDER BY ci.sort_order;