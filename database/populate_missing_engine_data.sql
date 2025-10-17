-- Update missing engine data based on car descriptions
USE carhub360;

-- Update Toyota Corolla Altis (CVT suggests around 1800cc)
UPDATE cars
SET engine_displacement = '1800cc', engine_power = '140hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Corolla Altis')
AND engine_displacement IS NULL;

-- Update Honda City (typically 1200cc)
UPDATE cars
SET engine_displacement = '1200cc', engine_power = '90hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'City')
AND engine_displacement IS NULL;

-- Update Honda Civic (typically 1500cc turbo)
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '180hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Civic')
AND engine_displacement IS NULL;

-- Update Hyundai Creta (typically 1500cc)
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '115hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Creta')
AND engine_displacement IS NULL;

-- Update Kia Sonet (typically 1200cc)
UPDATE cars
SET engine_displacement = '1200cc', engine_power = '120hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Sonet')
AND engine_displacement IS NULL;

-- Update Mitsubishi Xpander (typically 1500cc)
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '105hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Xpander')
AND engine_displacement IS NULL;

-- Update Nissan Sylphy (typically 1800cc)
UPDATE cars
SET engine_displacement = '1800cc', engine_power = '130hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Sylphy')
AND engine_displacement IS NULL;

-- Update Toyota Fortuner (typically 2700cc)
UPDATE cars
SET engine_displacement = '2700cc', engine_power = '150hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Fortuner')
AND engine_displacement IS NULL;

-- Update Proton X70 (typically 1500cc)
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '177hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'X70')
AND engine_displacement IS NULL;

-- Update MG Hector (typically 1500cc)
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '143hp'
WHERE model_id IN (SELECT id FROM car_models WHERE model_name = 'Hector')
AND engine_displacement IS NULL;

-- Update electric vehicles with appropriate motor specifications
UPDATE cars
SET engine_displacement = 'Electric Motor', engine_power = '450hp'
WHERE fuel_type = 'electric' AND engine_displacement IS NULL AND engine_power IS NULL;

-- Update luxury sports cars (based on high prices suggesting premium models)
UPDATE cars
SET engine_displacement = '5000cc', engine_power = '600hp'
WHERE fuel_type = 'petrol' AND selling_price > 100000000 AND engine_displacement IS NULL;

-- Update luxury SUVs
UPDATE cars
SET engine_displacement = '4000cc', engine_power = '450hp'
WHERE fuel_type = 'petrol' AND selling_price BETWEEN 50000000 AND 100000000 AND seats = 5 AND engine_displacement IS NULL;

-- Update hybrid vehicles
UPDATE cars
SET engine_displacement = '2000cc', engine_power = '210hp'
WHERE fuel_type = 'hybrid' AND engine_displacement IS NULL;

-- Update remaining diesel vehicles
UPDATE cars
SET engine_displacement = '2000cc', engine_power = '170hp'
WHERE fuel_type = 'diesel' AND engine_displacement IS NULL;

-- Update any remaining vehicles with generic specs
UPDATE cars
SET engine_displacement = '1500cc', engine_power = '150hp'
WHERE engine_displacement IS NULL OR engine_power IS NULL;