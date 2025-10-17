# CarHub360 Database Schema

This document contains the complete database schema for the CarHub360 application.

## Database: carhub360

### 1. User Management Tables

#### user_roles
```sql
CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### users
```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `role_id` int(11) DEFAULT 1,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT 'Bangladesh',
  `driving_license` varchar(100) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `preferred_language` varchar(10) DEFAULT 'en',
  `timezone` varchar(50) DEFAULT 'Asia/Dhaka',
  `email_verified` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) DEFAULT 0,
  `account_status` enum('active','suspended','pending','deactivated') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `referral_code` varchar(20) DEFAULT NULL,
  `referred_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  KEY `referred_by` (`referred_by`),
  KEY `idx_users_email` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### user_preferences
```sql
CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `preference_key` varchar(50) NOT NULL,
  `preference_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 2. Car Management Tables

#### car_brands
```sql
CREATE TABLE `car_brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `founded_year` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### car_categories
```sql
CREATE TABLE `car_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### car_models
```sql
CREATE TABLE `car_models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `brand_id` int(11) NOT NULL,
  `model_name` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  `production_start_year` int(11) DEFAULT NULL,
  `production_end_year` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `car_models_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `car_brands` (`id`),
  CONSTRAINT `car_models_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `car_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### cars
```sql
CREATE TABLE `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) DEFAULT NULL,
  `model_id` int(11) NOT NULL,
  `variant_name` varchar(100) DEFAULT NULL,
  `year` int(11) NOT NULL,
  `fuel_type` enum('petrol','diesel','hybrid','electric','cng') DEFAULT 'petrol',
  `transmission` enum('manual','automatic','cvt') NOT NULL,
  `engine_displacement` varchar(20) DEFAULT NULL,
  `engine_power` varchar(20) DEFAULT NULL,
  `engine_torque` varchar(20) DEFAULT NULL,
  `drivetrain` enum('fwd','rwd','awd','4wd') DEFAULT 'fwd',
  `seats` int(11) DEFAULT 5,
  `doors` int(11) DEFAULT 4,
  `fuel_capacity` varchar(20) DEFAULT NULL,
  `mileage_city` varchar(20) DEFAULT NULL,
  `mileage_highway` varchar(20) DEFAULT NULL,
  `top_speed` varchar(20) DEFAULT NULL,
  `acceleration_0_100` varchar(20) DEFAULT NULL,
  `ground_clearance` varchar(20) DEFAULT NULL,
  `boot_space` varchar(20) DEFAULT NULL,
  `curb_weight` varchar(20) DEFAULT NULL,
  `dimensions_length` varchar(20) DEFAULT NULL,
  `dimensions_width` varchar(20) DEFAULT NULL,
  `dimensions_height` varchar(20) DEFAULT NULL,
  `wheelbase` varchar(20) DEFAULT NULL,
  `exterior_color` varchar(50) DEFAULT NULL,
  `interior_color` varchar(50) DEFAULT NULL,
  `odometer_reading` int(11) DEFAULT 0,
  `condition_rating` enum('excellent','very_good','good','fair','poor') DEFAULT 'excellent',
  `rental_price_daily` decimal(10,2) DEFAULT NULL,
  `rental_price_weekly` decimal(10,2) DEFAULT NULL,
  `rental_price_monthly` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(12,2) DEFAULT NULL,
  `original_price` decimal(12,2) DEFAULT NULL,
  `depreciation_rate` decimal(5,2) DEFAULT NULL,
  `insurance_value` decimal(12,2) DEFAULT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `registration_expiry` date DEFAULT NULL,
  `insurance_policy` varchar(100) DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `last_service_date` date DEFAULT NULL,
  `next_service_due` date DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `dealer_id` int(11) DEFAULT NULL,
  `current_location` varchar(255) DEFAULT NULL,
  `parking_location` varchar(255) DEFAULT NULL,
  `availability_status` enum('available','rented','sold','maintenance','reserved') DEFAULT 'available',
  `listing_status` enum('active','inactive','pending','sold') DEFAULT 'active',
  `featured` tinyint(1) DEFAULT 0,
  `views_count` int(11) DEFAULT 0,
  `inquiries_count` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `additional_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `model_id` (`model_id`),
  KEY `owner_id` (`owner_id`),
  KEY `dealer_id` (`dealer_id`),
  KEY `idx_cars_status` (`availability_status`),
  CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `car_models` (`id`),
  CONSTRAINT `cars_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cars_ibfk_3` FOREIGN KEY (`dealer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### car_images
```sql
CREATE TABLE `car_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `car_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_type` enum('exterior','interior','engine','documents','other') DEFAULT 'exterior',
  `is_primary` tinyint(1) DEFAULT 0,
  `alt_text` varchar(200) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `car_id` (`car_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `car_images_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE,
  CONSTRAINT `car_images_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1238 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 3. Booking System Tables

#### bookings
```sql
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `booking_type` enum('rental','purchase','test_drive') NOT NULL,
  `rental_start_date` datetime DEFAULT NULL,
  `rental_end_date` datetime DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `dropoff_location` varchar(255) DEFAULT NULL,
  `pickup_instructions` text DEFAULT NULL,
  `dropoff_instructions` text DEFAULT NULL,
  `driver_required` tinyint(1) DEFAULT 0,
  `driver_id` int(11) DEFAULT NULL,
  `total_days` int(11) DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `additional_charges` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `security_deposit` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method_id` int(11) DEFAULT NULL,
  `payment_status` enum('pending','partial','paid','refunded','failed') DEFAULT 'pending',
  `booking_status` enum('pending','confirmed','active','completed','cancelled') DEFAULT 'pending',
  `special_requests` text DEFAULT NULL,
  `terms_accepted` tinyint(1) DEFAULT 0,
  `cancellation_reason` text DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `driver_id` (`driver_id`),
  KEY `payment_method_id` (`payment_method_id`),
  KEY `cancelled_by` (`cancelled_by`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_car` (`car_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 4. Service Management Tables

#### service_categories
```sql
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### services
```sql
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `detailed_description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `skill_level` enum('basic','intermediate','advanced','expert') DEFAULT 'basic',
  `tools_required` text DEFAULT NULL,
  `parts_included` text DEFAULT NULL,
  `warranty_days` int(11) DEFAULT 0,
  `is_mobile_service` tinyint(1) DEFAULT 0,
  `requires_appointment` tinyint(1) DEFAULT 1,
  `popularity_score` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### service_bookings
```sql
CREATE TABLE `service_bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) DEFAULT NULL,
  `service_id` int(11) NOT NULL,
  `technician_id` int(11) DEFAULT NULL,
  `scheduled_date` datetime NOT NULL,
  `estimated_duration` int(11) DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `service_location` varchar(255) DEFAULT NULL,
  `is_mobile_service` tinyint(1) DEFAULT 0,
  `base_price` decimal(10,2) NOT NULL,
  `additional_charges` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `service_status` enum('scheduled','in_progress','completed','cancelled','no_show') DEFAULT 'scheduled',
  `customer_notes` text DEFAULT NULL,
  `technician_notes` text DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `parts_used` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parts_used`)),
  `before_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_images`)),
  `after_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_images`)),
  `warranty_expiry` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `user_id` (`user_id`),
  KEY `car_id` (`car_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `service_bookings_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`),
  CONSTRAINT `service_bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 5. Blog System Tables

#### blog_categories
```sql
CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `blog_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `blog_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### blog_tags
```sql
CREATE TABLE `blog_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `description` text DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### blog_posts
```sql
CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `status` enum('draft','published','scheduled','archived','trash') DEFAULT 'draft',
  `visibility` enum('public','private','password_protected') DEFAULT 'public',
  `password` varchar(100) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `scheduled_for` timestamp NULL DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `reading_time` int(11) DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `likes_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `shares_count` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `allow_comments` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `category_id` (`category_id`),
  KEY `idx_blog_posts_status` (`status`),
  KEY `idx_blog_posts_published` (`published_at`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### blog_post_tags
```sql
CREATE TABLE `blog_post_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `blog_post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### blog_comments
```sql
CREATE TABLE `blog_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('pending','approved','spam','trash') DEFAULT 'pending',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `blog_comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### blog_post_likes
```sql
CREATE TABLE `blog_post_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`user_id`,`post_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_post` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 6. Review System Tables

#### reviews
```sql
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reviewable_type` enum('car','service','booking') NOT NULL,
  `reviewable_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `pros` text DEFAULT NULL,
  `cons` text DEFAULT NULL,
  `verified_purchase` tinyint(1) DEFAULT 0,
  `helpful_votes` int(11) DEFAULT 0,
  `total_votes` int(11) DEFAULT 0,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 7. Contact System Tables

#### contact_categories
```sql
CREATE TABLE `contact_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### contact_inquiries
```sql
CREATE TABLE `contact_inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inquiry_reference` varchar(20) NOT NULL,
  `category_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('new','assigned','in_progress','resolved','closed') DEFAULT 'new',
  `assigned_to` int(11) DEFAULT NULL,
  `source` enum('website','email','phone','chat','mobile_app') DEFAULT 'website',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `satisfaction_rating` int(11) DEFAULT NULL,
  `satisfaction_feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inquiry_reference` (`inquiry_reference`),
  KEY `category_id` (`category_id`),
  KEY `user_id` (`user_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_contact_inquiries_status` (`status`),
  CONSTRAINT `contact_inquiries_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `contact_categories` (`id`),
  CONSTRAINT `contact_inquiries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `contact_inquiries_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### contact_responses
```sql
CREATE TABLE `contact_responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inquiry_id` int(11) NOT NULL,
  `responder_id` int(11) NOT NULL,
  `response` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `inquiry_id` (`inquiry_id`),
  KEY `responder_id` (`responder_id`),
  CONSTRAINT `contact_responses_ibfk_1` FOREIGN KEY (`inquiry_id`) REFERENCES `contact_inquiries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contact_responses_ibfk_2` FOREIGN KEY (`responder_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 8. Messaging System Tables

#### conversations
```sql
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### conversation_participants
```sql
CREATE TABLE `conversation_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### messages
```sql
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_messages_is_read` (`is_read`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 9. Payment System Tables

#### payment_methods
```sql
CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `method_type` enum('credit_card','debit_card','bank_transfer','digital_wallet','cash') NOT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### coupons_list
```sql
CREATE TABLE `coupons_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discount_type` varchar(50) NOT NULL,
  `discount_value` double NOT NULL,
  `expiry_date` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `generated_at` datetime NOT NULL DEFAULT current_timestamp(),
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `coupons_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 10. Additional Tables

#### features_master
```sql
CREATE TABLE `features_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `feature_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_name` (`feature_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### car_features
```sql
CREATE TABLE `car_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `car_id` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `car_id` (`car_id`),
  KEY `feature_id` (`feature_id`),
  CONSTRAINT `car_features_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE,
  CONSTRAINT `car_features_ibfk_2` FOREIGN KEY (`feature_id`) REFERENCES `features_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

## Database Relationships (ERD)

### Entity Relationship Diagram (ERD) with Cardinality

```
┌─────────────────┐
│   user_roles    │
├─────────────────┤
│ id (PK)         │
│ role_name       │
│ permissions     │
│ description     │
│ created_at      │
└─────────┬───────┘
          │ 1
          │
          │ *
┌─────────▼───────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
│ first_name      │
│ last_name       │
│ role_id (FK)    │
│ referred_by (FK)│
└─────┬─────┬─────┘
      │     │
      │ 1   │ *     │ 1
      │     │       │
      │ *   │ *     │ *
┌─────▼─────▼─┐ ┌───▼───────┐
│ blog_posts  │ │ bookings  │
├─────────────┤ ├───────────┤
│ id (PK)     │ │ id (PK)   │
│ title       │ │ booking_  │
│ slug        │ │ reference │
│ content     │ │ user_id   │
│ featured_   │ │ car_id    │
│ image       │ │ total_    │
│ video_url   │ │ amount    │
│ author_id   │ │ booking_  │
│ category_id │ │ status    │
│ status      │ └─────┬─────┘
└─────┬───────┘       │
      │ 1             │ 1
      │               │
      │ *             │ *
┌─────▼───────┐ ┌─────▼───────┐
│blog_comments│ │ car_images  │
├─────────────┤ ├─────────────┤
│ id (PK)     │ │ id (PK)     │
│ post_id     │ │ car_id      │
│ user_id     │ │ image_url   │
│ parent_id   │ │ image_type  │
│ content     │ │ is_primary  │
│ status      │ └─────────────┘
└─────────────┘
      │
      │ 1
      │
      │ *
┌─────▼───────┐
│blog_post_   │
│likes        │
├─────────────┤
│ id (PK)     │
│ user_id     │
│ post_id     │
│ created_at  │
└─────────────┘

┌─────────────────┐
│  car_brands     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ logo_url        │
│ country         │
│ founded_year    │
│ description     │
│ website         │
│ status          │
└─────────┬───────┘
          │ 1
          │
          │ *
┌─────────▼───────┐
│  car_models     │
├─────────────────┤
│ id (PK)         │
│ brand_id (FK)   │
│ model_name      │
│ category_id(FK) │
│ description     │
└─────┬─────┬─────┘
      │     │
      │ 1   │ 1
      │     │
      │ *   │ *
┌─────▼─────┐ ┌─▼─────────────┐
│   cars    │ │car_categories │
├───────────┤ ├───────────────┤
│ id (PK)   │ │ id (PK)       │
│ model_id  │ │ name          │
│ year      │ │ description   │
│ fuel_type │ └───────────────┘
│ transmiss │
│ rental_   │
│ price     │
│ owner_id  │
│ dealer_id │
│ availabil │
│ ity       │
└─────┬─────┘
      │
      │ 1
      │
      │ *
┌─────▼───────┐
│service_     │
│bookings     │
├─────────────┤
│ id (PK)     │
│ service_id  │
│ user_id     │
│ car_id      │
│ scheduled_  │
│ date        │
│ total_amount│
│ service_    │
│ status      │
└─────────────┘

┌─────────────────┐
│blog_categories  │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ parent_id (FK)  │
│ description     │
└─────┬───────────┘
      │ 1
      │
      │ *
┌─────▼───────┐
│ blog_posts  │
└─────────────┘

┌─────────────────┐
│   blog_tags     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ description     │
│ usage_count     │
└─────────────────┘
      │
      │ *
      │
┌─────▼───────┐
│blog_post_   │
│tags         │
├─────────────┤
│ post_id (FK)│
│ tag_id (FK) │
└─────────────┘
      │
      │ *
      │
┌─────▼───────┐
│ blog_posts  │
└─────────────┘

┌─────────────────┐
│service_        │
│categories      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ description     │
└─────────┬───────┘
          │ 1
          │
          │ *
┌─────────▼───────┐
│    services     │
├─────────────────┤
│ id (PK)         │
│ category_id(FK) │
│ service_name    │
│ base_price      │
│ duration        │
│ is_active       │
└─────────────────┘
```

### Relationship Types and Cardinality

#### One-to-One Relationships (1:1)
- None in this schema (all relationships are one-to-many or many-to-many)

#### One-to-Many Relationships (1:*)
1. **user_roles → users**
   - One role can be assigned to many users
   - Each user has exactly one role

2. **users → users (self-reference)**
   - One user can refer many other users
   - Each user can be referred by at most one user

3. **car_brands → car_models**
   - One brand can have many models
   - Each model belongs to exactly one brand

4. **car_categories → car_models**
   - One category can have many models
   - Each model belongs to exactly one category

5. **car_models → cars**
   - One model can have many cars
   - Each car belongs to exactly one model

6. **users → cars (owner)**
   - One user can own many cars
   - Each car has at most one owner

7. **users → cars (dealer)**
   - One user (dealer) can list many cars
   - Each car has at most one dealer

8. **cars → car_images**
   - One car can have many images
   - Each image belongs to exactly one car

9. **users → blog_posts**
   - One user can write many blog posts
   - Each blog post is written by exactly one user

10. **blog_categories → blog_posts**
    - One category can contain many blog posts
    - Each blog post belongs to exactly one category

11. **blog_posts → blog_comments**
    - One blog post can have many comments
    - Each comment belongs to exactly one blog post

12. **blog_comments → blog_comments (self-reference)**
    - One comment can have many replies
    - Each reply has at most one parent comment

13. **users → blog_comments**
    - One user can write many comments
    - Each comment is written by at most one user (or guest)

14. **users → bookings**
    - One user can make many bookings
    - Each booking belongs to exactly one user

15. **cars → bookings**
    - One car can have many bookings
    - Each booking is for exactly one car

16. **users → bookings (driver)**
    - One user (driver) can be assigned to many bookings
    - Each booking has at most one driver

17. **service_categories → services**
    - One category can contain many services
    - Each service belongs to exactly one category

18. **services → service_bookings**
    - One service can have many bookings
    - Each service booking is for exactly one service

19. **users → service_bookings**
    - One user can make many service bookings
    - Each service booking belongs to exactly one user

20. **cars → service_bookings**
    - One car can have many service bookings
    - Each service booking is for at most one car

21. **contact_categories → contact_inquiries**
    - One category can have many inquiries
    - Each inquiry belongs to exactly one category

22. **users → contact_inquiries**
    - One user can submit many inquiries
    - Each inquiry is submitted by at most one user

23. **users → contact_inquiries (assigned)**
    - One user can be assigned many inquiries
    - Each inquiry is assigned to at most one user

24. **conversations → conversation_participants**
    - One conversation can have many participants
    - Each participant belongs to exactly one conversation

25. **users → conversation_participants**
    - One user can participate in many conversations
    - Each participation record belongs to exactly one user

26. **conversations → messages**
    - One conversation can have many messages
    - Each message belongs to exactly one conversation

27. **users → messages**
    - One user can send many messages
    - Each message is sent by exactly one user

28. **users → reviews**
    - One user can write many reviews
    - Each review is written by exactly one user

29. **users → payment_methods**
    - One user can have many payment methods
    - Each payment method belongs to exactly one user

30. **users → coupons_list**
    - One user can have many coupons
    - Each coupon belongs to at most one user

#### Many-to-Many Relationships (*:*)
1. **blog_posts ↔ blog_tags** (via blog_post_tags)
   - One blog post can have many tags
   - One tag can be applied to many posts

2. **users ↔ blog_posts** (via blog_post_likes)
   - One user can like many blog posts
   - One blog post can be liked by many users

### Visual Representation

```
┌─────────────────┐       ┌─────────────────┐
│   user_roles    │       │   users         │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)         │
│ role_name       │       │ username        │
│ permissions     │       │ email           │
│ description     │       │ password        │
│ created_at      │       │ first_name      │
└─────────────────┘       │ last_name       │
                          │ role_id (FK)    │
                          │ referred_by (FK)│
                          └─────────────────┘
                                   │
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    │              │              │
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │   blog_posts   │ │     bookings    │ │contact_inquiries│
          ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
          │ id (PK)        │ │ id (PK)        │ │ id (PK)        │
          │ title          │ │ booking_ref    │ │ inquiry_ref    │
          │ slug           │ │ user_id (FK)    │ │ user_id (FK)    │
          │ content        │ │ car_id (FK)     │ │ category_id(FK) │
          │ featured_image │ │ total_amount   │ │ assigned_to(FK) │
          │ video_url      │ │ booking_status │ │ status         │
          │ author_id (FK) │ └─────────────────┘ └─────────────────┘
          │ category_id(FK)│                                │
          │ status         │                                │
          └─────────────────┘                                │
                    │                                         │
                    │                                         │
          ┌─────────────────┐                                │
          │ blog_comments   │                                │
          ├─────────────────┤                                │
          │ id (PK)        │                                │
          │ post_id (FK)   │                                │
          │ user_id (FK)   │                                │
          │ parent_id (FK) │                                │
          │ content        │                                │
          │ status         │                                │
          └─────────────────┘                                │
                    │                                         │
                    └─────────────────────────────────────────┘
                                   │
                                   │
                    ┌─────────────────┐
                    │     messages    │
                    ├─────────────────┤
                    │ id (PK)        │
                    │ conversation_id│
                    │ sender_id (FK) │
                    │ content        │
                    │ is_read        │
                    └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  car_brands     │       │  car_models     │       │      cars       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)         │◄──────┤ id (PK)         │
│ name            │       │ brand_id (FK)   │       │ model_id (FK)   │
│ logo_url        │       │ model_name      │       │ year            │
│ country         │       │ category_id(FK) │       │ fuel_type       │
│ founded_year    │       │ description     │       │ transmission    │
│ description     │       └─────────────────┘       │ rental_price    │
│ website         │                               │ selling_price   │
│ status          │                               │ owner_id (FK)   │
└─────────────────┘                               │ dealer_id (FK)   │
                                                  │ availability   │
                                                  └─────────────────┘
                                                          │
                                                          │
                                            ┌─────────────┼─────────────┐
                                            │             │             │
                                            │             │             │
                                  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                                  │   car_images    │ │   bookings      │ │service_bookings │
                                  ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
                                  │ id (PK)        │ │ id (PK)        │ │ id (PK)        │
                                  │ car_id (FK)    │ │ car_id (FK)    │ │ car_id (FK)    │
                                  │ image_url      │ │ user_id (FK)   │ │ user_id (FK)   │
                                  │ image_type     │ │ booking_type   │ │ service_id(FK) │
                                  │ is_primary     │ │ total_amount   │ │ scheduled_date │
                                  └─────────────────┘ │ booking_status │ │ service_status │
                                  └─────────────────┘ └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│blog_categories  │       │   blog_tags     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ slug            │       │ slug            │
│ parent_id (FK)  │       │ description     │
│ description     │       │ usage_count     │
└─────────────────┘       └─────────────────┘
          │                           │
          │                           │
          └──────────────┬────────────┘
                         │
                         │
          ┌─────────────────┐
          │ blog_post_tags  │
          ├─────────────────┤
          │ post_id (FK)    │
          │ tag_id (FK)     │
          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│ service_categories│     │    services     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)         │
│ name            │       │ category_id(FK) │
│ description     │       │ service_name    │
└─────────────────┘       │ base_price      │
                          │ duration        │
                          │ is_active       │
                          └─────────────────┘
                                   │
                                   │
                         ┌─────────────────┐
                         │service_bookings │
                         ├─────────────────┤
                         │ id (PK)        │
                         │ service_id(FK) │
                         │ user_id (FK)   │
                         │ car_id (FK)    │
                         │ total_amount   │
                         └─────────────────┘
```

### Key Relationships

1. **User System**:
   - `users.role_id` → `user_roles.id`
   - `users.referred_by` → `users.id` (self-reference)

2. **Car System**:
   - `car_models.brand_id` → `car_brands.id`
   - `car_models.category_id` → `car_categories.id`
   - `cars.model_id` → `car_models.id`
   - `cars.owner_id` → `users.id`
   - `cars.dealer_id` → `users.id`
   - `car_images.car_id` → `cars.id`

3. **Blog System**:
   - `blog_posts.author_id` → `users.id`
   - `blog_posts.category_id` → `blog_categories.id`
   - `blog_categories.parent_id` → `blog_categories.id` (self-reference)
   - `blog_post_tags.post_id` → `blog_posts.id`
   - `blog_post_tags.tag_id` → `blog_tags.id`
   - `blog_comments.post_id` → `blog_posts.id`
   - `blog_comments.user_id` → `users.id`
   - `blog_comments.parent_id` → `blog_comments.id` (self-reference)

4. **Booking System**:
   - `bookings.user_id` → `users.id`
   - `bookings.car_id` → `cars.id`
   - `bookings.driver_id` → `users.id`
   - `bookings.payment_method_id` → `payment_methods.id`

5. **Service System**:
   - `services.category_id` → `service_categories.id`
   - `service_bookings.service_id` → `services.id`
   - `service_bookings.user_id` → `users.id`
   - `service_bookings.car_id` → `cars.id`

6. **Contact System**:
   - `contact_inquiries.category_id` → `contact_categories.id`
   - `contact_inquiries.user_id` → `users.id`
   - `contact_inquiries.assigned_to` → `users.id`

7. **Messaging System**:
   - `conversation_participants.conversation_id` → `conversations.id`
   - `conversation_participants.user_id` → `users.id`
   - `messages.conversation_id` → `conversations.id`
   - `messages.sender_id` → `users.id`

8. **Review System**:
   - `reviews.user_id` → `users.id`

9. **Payment System**:
   - `payment_methods.user_id` → `users.id`
   - `coupons_list.user_id` → `users.id`

## Recent Updates

### Video URL Field Added
- Added `video_url` varchar(500) DEFAULT NULL to `blog_posts` table
- Allows blog posts to include YouTube videos that can be played directly in the post
- Video thumbnails are displayed in the blog post list
- Videos are embedded using YouTube's iframe player with related videos disabled

## Database Connection
- Host: localhost
- Database: carhub360
- Port: 3306
- No password required for local development

## Notes
- All tables use InnoDB engine with UTF-8 support
- Foreign key constraints ensure data integrity
- Indexes are optimized for common queries
- JSON fields are validated using CHECK constraints
- Timestamp fields automatically track creation and updates