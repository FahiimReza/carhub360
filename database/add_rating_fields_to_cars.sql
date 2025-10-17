-- Add rating fields to cars table
ALTER TABLE cars 
ADD COLUMN rating_average DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating from 1.00 to 5.00',
ADD COLUMN rating_count INT DEFAULT 0 COMMENT 'Total number of ratings/reviews',
ADD COLUMN rating_sum DECIMAL(6,2) DEFAULT 0.00 COMMENT 'Sum of all ratings for quick calculation';

-- Add index for faster queries on ratings
ALTER TABLE cars ADD INDEX idx_cars_rating (rating_average);

-- Create a trigger to automatically update car ratings when reviews are added/updated
DELIMITER $$

CREATE TRIGGER after_review_insert 
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.reviewable_type = 'car' AND NEW.status = 'approved' THEN
        UPDATE cars 
        SET 
            rating_count = rating_count + 1,
            rating_sum = rating_sum + NEW.rating,
            rating_average = ROUND((rating_sum + NEW.rating) / (rating_count + 1), 2)
        WHERE id = NEW.reviewable_id;
    END IF;
END$$

CREATE TRIGGER after_review_update 
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    -- Only update if the status changes to/from 'approved' or rating changes
    IF NEW.reviewable_type = 'car' AND (NEW.status != OLD.status OR NEW.rating != OLD.rating) THEN
        -- If status changed from not approved to approved
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE cars 
            SET 
                rating_count = rating_count + 1,
                rating_sum = rating_sum + NEW.rating,
                rating_average = CASE 
                    WHEN (rating_count + 1) > 0 THEN ROUND((rating_sum + NEW.rating) / (rating_count + 1), 2)
                    ELSE 0.00
                END
            WHERE id = NEW.reviewable_id;
        
        -- If status changed from approved to not approved
        ELSEIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE cars 
            SET 
                rating_count = GREATEST(rating_count - 1, 0),
                rating_sum = GREATEST(rating_sum - OLD.rating, 0),
                rating_average = CASE 
                    WHEN rating_count > 1 THEN ROUND(GREATEST(rating_sum - OLD.rating, 0) / GREATEST(rating_count - 1, 1), 2)
                    ELSE 0.00
                END
            WHERE id = NEW.reviewable_id;
        
        -- If both are approved but rating changed
        ELSEIF OLD.status = 'approved' AND NEW.status = 'approved' AND NEW.rating != OLD.rating THEN
            UPDATE cars 
            SET 
                rating_sum = rating_sum + NEW.rating - OLD.rating,
                rating_average = CASE 
                    WHEN rating_count > 0 THEN ROUND((rating_sum + NEW.rating - OLD.rating) / rating_count, 2)
                    ELSE 0.00
                END
            WHERE id = NEW.reviewable_id;
        END IF;
    END IF;
END$$

CREATE TRIGGER after_review_delete 
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    IF OLD.reviewable_type = 'car' AND OLD.status = 'approved' THEN
        UPDATE cars 
        SET 
            rating_count = GREATEST(rating_count - 1, 0),
            rating_sum = GREATEST(rating_sum - OLD.rating, 0),
            rating_average = CASE 
                WHEN rating_count > 1 THEN ROUND(GREATEST(rating_sum - OLD.rating, 0) / GREATEST(rating_count - 1, 1), 2)
                ELSE 0.00
            END
        WHERE id = OLD.reviewable_id;
    END IF;
END$$

DELIMITER ;

-- Populate existing cars with current ratings from reviews
UPDATE cars c 
SET 
    rating_count = (
        SELECT COUNT(*) 
        FROM reviews r 
        WHERE r.reviewable_type = 'car' 
        AND r.reviewable_id = c.id 
        AND r.status = 'approved'
    ),
    rating_sum = (
        SELECT COALESCE(SUM(rating), 0) 
        FROM reviews r 
        WHERE r.reviewable_type = 'car' 
        AND r.reviewable_id = c.id 
        AND r.status = 'approved'
    );

-- Calculate average rating based on the sum and count
UPDATE cars 
SET rating_average = CASE 
    WHEN rating_count > 0 THEN ROUND(rating_sum / rating_count, 2)
    ELSE 0.00
END
WHERE rating_count > 0;