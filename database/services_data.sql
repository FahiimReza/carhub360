-- Insert service categories
INSERT INTO service_categories (name, description, icon, is_active) VALUES
('Brake Services', 'Professional brake inspection, repair and replacement services', 'disc', TRUE),
('AC Services', 'Complete air conditioning maintenance and repair solutions', 'wind', TRUE),
('Engine Services', 'Expert engine maintenance, repair and diagnostic services', 'settings', TRUE),
('General Maintenance', 'Routine checkups and preventive maintenance services', 'wrench', TRUE),
('Inspection Services', 'Comprehensive vehicle inspection and diagnostic services', 'search', TRUE),
('Emergency Services', '24/7 roadside assistance and emergency repair services', 'phone', TRUE);

-- Insert services for Brake Services (category_id = 1)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(1, 'Brake Noise Repair', 'Professional brake noise diagnosis and repair', 8000, 180, TRUE),
(1, 'Brake Pad Repair', 'Brake pad inspection, repair, and replacement', 8000, 240, TRUE),
(1, 'Brake Disc Replacement', 'Complete brake disc replacement service', 8000, 300, TRUE),
(1, 'Complete Brake System Check', 'Full brake system inspection and diagnostic', 8000, 120, TRUE);

-- Insert services for AC Services (category_id = 2)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(2, 'AC Basic Servicing', 'Routine AC system cleaning and maintenance', 4500, 180, TRUE),
(2, 'AC Troubleshooting', 'AC system diagnostic and fault resolution', 4500, 240, TRUE),
(2, 'AC Gas Refill', 'AC refrigerant gas recharge and leak check', 4500, 120, TRUE),
(2, 'AC Compressor Repair', 'AC compressor diagnosis and repair/replacement', 4500, 1440, TRUE);

-- Insert services for Engine Services (category_id = 3)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(3, 'Engine Oil Change', 'Engine oil replacement and filter change', 2500, 60, TRUE),
(3, 'Engine Scanning & Check', 'OBD scanning and engine performance check', 3000, 180, TRUE),
(3, 'Engine Overhauling', 'Complete engine rebuild and overhaul', 4990, 2880, TRUE),
(3, 'Engine Replacement', 'Engine swap with new or refurbished unit', 5990, 4320, TRUE);

-- Insert services for General Maintenance (category_id = 4)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(4, 'Car Checkup & Maintenance', 'Comprehensive vehicle health check', 2500, 180, TRUE),
(4, 'Belt Checkup & Replacement', 'Timing and accessory belt inspection/replacement', 1500, 120, TRUE),
(4, 'Filter Replacement', 'Air, fuel, and cabin filter replacement', 2500, 30, TRUE),
(4, 'Battery Check & Service', 'Battery testing and maintenance', 2500, 30, TRUE);

-- Insert services for Inspection Services (category_id = 5)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(5, 'AC Inspection', 'Detailed air conditioning system inspection', 2000, 60, TRUE),
(5, 'Cooling System Check', 'Radiator, hoses, and coolant system inspection', 2000, 60, TRUE),
(5, 'Electrical System Check', 'Wiring, battery, and electrical components check', 2000, 120, TRUE),
(5, 'Pre-Purchase Inspection', 'Full vehicle inspection before purchase', 2000, 180, TRUE);

-- Insert services for Emergency Services (category_id = 6)
INSERT INTO services (category_id, service_name, description, base_price, duration_minutes, is_active) VALUES
(6, 'Roadside Assistance', 'On-site emergency support and diagnostics', 2500, 45, TRUE),
(6, 'Jump Start Service', 'Battery jump start for stranded vehicles', 2500, 23, TRUE),
(6, 'Flat Tire Change', 'Emergency tire replacement service', 2500, 25, TRUE),
(6, 'Emergency Towing', 'Vehicle towing to nearest service center', 2500, 45, TRUE);