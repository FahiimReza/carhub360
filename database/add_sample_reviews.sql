-- Add sample reviews for testing the rating system

-- First, let's get some car IDs to add reviews for
-- We'll add reviews for the first 5 cars in the database

-- Review for car ID 28 (Aston Martin DB11)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(1, 'car', 28, 5, 'Excellent Car!', 'This car exceeded all my expectations. Great performance and comfort.', 'Smooth ride, good fuel economy, spacious interior', 'None that I can think of', 1, 'approved', NOW() - INTERVAL 5 DAY),
(2, 'car', 28, 4, 'Very Good Experience', 'Overall a great car to drive. Minor issues with the infotainment system.', 'Comfortable seats, good handling', 'Infotainment could be better', 1, 'approved', NOW() - INTERVAL 3 DAY),
(3, 'car', 28, 5, 'Perfect for Luxury', 'Spacious and safe. My kids love it!', 'Lots of space, great safety features', 'A bit pricey', 1, 'approved', NOW() - INTERVAL 1 DAY);

-- Review for car ID 29 (Aston Martin Vantage)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(4, 'car', 29, 4, 'Good Value', 'Great car for the price. Does everything well.', 'Good fuel economy, reliable', 'Interior could be more premium', 1, 'approved', NOW() - INTERVAL 4 DAY),
(5, 'car', 29, 3, 'Decent but not Great', 'Average car. Nothing special but gets the job done.', 'Affordable, easy to drive', 'Lacks power, basic features', 1, 'approved', NOW() - INTERVAL 2 DAY);

-- Review for car ID 42 (Audi A4)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(1, 'car', 42, 5, 'Luxury at its Best!', 'Absolutely love this car. Premium feel and performance.', 'Luxurious interior, powerful engine, smooth ride', 'Expensive maintenance', 1, 'approved', NOW() - INTERVAL 6 DAY),
(2, 'car', 42, 5, 'Worth Every Penny', 'If you can afford it, get it. Best car I''ve ever owned.', 'Amazing performance, beautiful design', 'High running costs', 1, 'approved', NOW() - INTERVAL 4 DAY),
(3, 'car', 42, 4, 'Premium Experience', 'Great luxury car with minor issues', 'Comfortable, well-equipped', 'Fuel consumption could be better', 1, 'approved', NOW() - INTERVAL 2 DAY);

-- Review for car ID 43 (Audi A6)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(2, 'car', 43, 4, 'Reliable and Practical', 'Great daily driver. No complaints so far.', 'Reliable, practical, good size', 'Not very exciting', 1, 'approved', NOW() - INTERVAL 5 DAY),
(4, 'car', 43, 3, 'Just Okay', 'It''s a car. Does what a car should do.', 'Gets from A to B', 'Boring design, mediocre performance', 1, 'approved', NOW() - INTERVAL 3 DAY);

-- Review for car ID 44 (Audi RS7)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(3, 'car', 44, 5, 'Outstanding Performance!', 'This car is a beast on the road. Thrilling to drive!', 'Powerful engine, great handling, looks amazing', 'Not very practical for daily use', 1, 'approved', NOW() - INTERVAL 7 DAY),
(4, 'car', 44, 4, 'Sports Car Dream', 'Always wanted a sports car and this delivers!', 'Exciting to drive, turns heads', 'Cramped interior, stiff suspension', 1, 'approved', NOW() - INTERVAL 5 DAY),
(5, 'car', 44, 5, 'Pure Adrenaline', 'Driving this car is an experience. Absolutely love it!', 'Incredible performance, beautiful sound', 'Poor fuel economy', 1, 'approved', NOW() - INTERVAL 1 DAY);

-- Add some pending reviews (not yet approved)
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status, created_at)
VALUES
(1, 'car', 28, 4, 'Waiting for Approval', 'This review is pending approval', 'Good car', 'Some issues', 1, 'pending', NOW() - INTERVAL 1 HOUR),
(2, 'car', 42, 3, 'Another Pending Review', 'This should not affect the rating yet', 'Decent', 'Not great', 1, 'pending', NOW() - INTERVAL 30 MINUTE);