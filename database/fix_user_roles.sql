-- Fix User Roles in Database
-- This script will check and update user roles to ensure only admin@carhub360.com has admin role

-- First, let's check the current state of users and their roles
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role_id,
    r.role_name as current_role
FROM users u
LEFT JOIN user_roles r ON u.role_id = r.id
ORDER BY u.id;

-- Update all users to have 'user' role (role_id = 1) except admin@carhub360.com
UPDATE users 
SET role_id = 1 
WHERE email != 'admin@carhub360.com';

-- Ensure admin@carhub360.com has admin role (role_id = 2)
UPDATE users 
SET role_id = 2 
WHERE email = 'admin@carhub360.com';

-- Verify the changes
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role_id,
    r.role_name as updated_role
FROM users u
LEFT JOIN user_roles r ON u.role_id = r.id
ORDER BY u.id;

-- Show count of users by role
SELECT 
    r.role_name,
    COUNT(u.id) as user_count
FROM user_roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.role_name
ORDER BY r.id;