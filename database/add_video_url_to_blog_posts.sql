-- Add video_url column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN video_url VARCHAR(500) NULL AFTER featured_image;