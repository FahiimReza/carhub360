const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /api/cars - Get all cars with filters and search
router.get('/', async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, q: search, limit = 20, offset = 0, sortBy, sortOrder = 'desc' } = req.query;
        
        // Define searchTerm outside the if block to avoid ReferenceError
        const searchTerm = search ? search.trim() : '';
        
        let query = `
            SELECT c.*, cb.name as brand_name, cm.model_name as model_name, cc.name as category_name,
                   c.rating_average, c.rating_count,
                   GROUP_CONCAT(ci.image_url) as images
            FROM cars c
            JOIN car_models cm ON c.model_id = cm.id
            JOIN car_brands cb ON cm.brand_id = cb.id
            JOIN car_categories cc ON cm.category_id = cc.id
            LEFT JOIN car_images ci ON c.id = ci.car_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (search && searchTerm.length > 0) {
            // Case-insensitive search that checks if brand, model, or description starts with or contains the search term
            query += ` AND (
                LOWER(cb.name) LIKE LOWER(?) OR
                LOWER(cm.model_name) LIKE LOWER(?) OR
                LOWER(c.description) LIKE LOWER(?)
            )`;
            // Using contains match for broader results
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        if (category) {
            query += ` AND cc.name = ?`;
            params.push(category);
        }
        if (brand) {
            query += ` AND cb.name = ?`;
            params.push(brand);
        }
        if (minPrice) {
            query += ` AND c.rental_price_daily >= ?`;
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND c.rental_price_daily <= ?`;
            params.push(maxPrice);
        }
        
        // Order by relevance: brand matches first, then model, then description
        query += ` GROUP BY c.id`;
        
        // Add search-specific ordering only if there's a search term
        if (search && searchTerm.length > 0) {
            query += ` ORDER BY
                CASE
                    WHEN LOWER(cb.name) LIKE LOWER(?) THEN 1
                    WHEN LOWER(cm.model_name) LIKE LOWER(?) THEN 2
                    ELSE 3
                END,
                CASE
                    WHEN LOWER(cb.name) LIKE LOWER(?) OR LOWER(cm.model_name) LIKE LOWER(?) THEN 1
                    ELSE 2
                END`;
            
            // Add parameters for the ORDER BY CASE
            params.push(`${searchTerm}%`, `${searchTerm}%`, `${searchTerm}%`, `${searchTerm}%`);
        }
        
        // Add sorting based on user selection
        if (sortBy) {
            const validSortFields = {
                'price': 'c.rental_price_daily',
                'name': 'cb.name',
                'model': 'cm.model_name',
                'year': 'c.year',
                'created': 'c.created_at'
            };
            
            if (validSortFields[sortBy]) {
                query += `, ${validSortFields[sortBy]} ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
            }
        }
        
        // Add default sort if no search relevance and no sortBy
        if (!search && !sortBy) {
            query += ` ORDER BY c.created_at DESC`;
        }
        
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [cars] = await global.db.execute(query, params);
        
        const processedCars = cars.map(car => {
            let images = [];
            const brandSlug = car.brand_name ? car.brand_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') : '';
            const modelSlug = car.model_name ? car.model_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') : '';
            const dirPath = path.join(__dirname, '..', 'assets', 'car-images', `${brandSlug}_${modelSlug}`);

            // Prioritize images from file system
            if (brandSlug && modelSlug && fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath).filter(f =>
                    f.toLowerCase().endsWith('.jpg') ||
                    f.toLowerCase().endsWith('.jpeg') ||
                    f.toLowerCase().endsWith('.png') ||
                    f.toLowerCase().endsWith('.webp')
                ).slice(0, 10); // Limit to 10 images
                images = files.map(f => `/assets/car-images/${brandSlug}_${modelSlug}/${f}`);
            }

            // If no file system images, try database images
            if (images.length === 0 && car.images) {
                images = car.images.split(',');
            }

            // If still no images, use a placeholder
            if (images.length === 0) {
                images = ['/assets/car-images/placeholder.jpg'];
            }
            return {
                ...car,
                images
            };
        });
        
        res.json({
            cars: processedCars,
            total: cars.length
        });
    } catch (error) {
        console.error('Cars fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// GET /api/cars/:id - Get single car with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get car details
        const [carResult] = await global.db.execute(`
            SELECT c.*, cb.name as brand_name, cm.model_name as model_name, cc.name as category_name,
                   c.rating_average, c.rating_count
            FROM cars c
            JOIN car_models cm ON c.model_id = cm.id
            JOIN car_brands cb ON cm.brand_id = cb.id
            JOIN car_categories cc ON cm.category_id = cc.id
            WHERE c.id = ?
        `, [id]);
        
        if (carResult.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        const car = carResult[0];
        
        // Get car images
        let images = [];
        const brandSlug = car.brand_name ? car.brand_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') : '';
        const modelSlug = car.model_name ? car.model_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') : '';
        const dirPath = path.join(__dirname, '..', 'assets', 'car-images', `${brandSlug}_${modelSlug}`);

        // Prioritize images from file system
        if (brandSlug && modelSlug && fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f =>
                f.toLowerCase().endsWith('.jpg') ||
                f.toLowerCase().endsWith('.jpeg') ||
                f.toLowerCase().endsWith('.png') ||
                f.toLowerCase().endsWith('.webp')
            ).slice(0, 10); // Limit to 10 images
            images = files.map(f => `/assets/car-images/${brandSlug}_${modelSlug}/${f}`);
        }

        // If no file system images, try database images
        if (images.length === 0) {
            let dbImages = await global.db.execute(
                'SELECT image_url FROM car_images WHERE car_id = ? ORDER BY sort_order ASC, is_primary DESC',
                [id]
            );
            images = dbImages[0].map(img => img.image_url);
        }

        // If still no images, use a placeholder
        if (images.length === 0) {
            images = ['/assets/car-images/placeholder.jpg'];
        }
        
        // Get car features
        const [features] = await global.db.execute(`
            SELECT f.name, f.icon, f.category, f.description
            FROM car_features cf
            JOIN features_master f ON cf.feature_id = f.id
            WHERE cf.car_id = ?
        `, [id]);
        
        // Get reviews
        const [reviews] = await global.db.execute(`
            SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.reviewable_type = 'car' AND r.reviewable_id = ?
            ORDER BY r.created_at DESC
        `, [id]);
        
        res.json({
            ...car,
            images,
            features,
            reviews
        });
    } catch (error) {
        console.error('Car detail error:', error);
        res.status(500).json({ error: 'Failed to fetch car details' });
    }
});

// POST /api/cars - Create new car
router.post('/', async (req, res) => {
    try {
        const {
            name, brand_id, model, year, type_id, fuel_type,
            transmission, rental_price, buying_price, seats,
            description, color, location, features, images
        } = req.body;
        
        // Insert car
        const [result] = await global.db.execute(`
            INSERT INTO cars (name, brand_id, model, year, type_id, fuel_type,
                            transmission, rental_price, buying_price, seats,
                            description, color, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, brand_id, model, year, type_id, fuel_type,
            transmission, rental_price, buying_price, seats,
            description, color, location]);
        
        const carId = result.insertId;
        
        // Insert images if provided
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await global.db.execute(`
                    INSERT INTO car_images (car_id, image_url, is_primary)
                    VALUES (?, ?, ?)
                `, [carId, images[i], i === 0]);
            }
        }
        
        // Insert features if provided
        if (features && features.length > 0) {
            for (const featureId of features) {
                await global.db.execute(`
                    INSERT INTO car_features (car_id, feature_id) VALUES (?, ?)
                `, [carId, featureId]);
            }
        }
        
        res.json({ message: 'Car created successfully', carId });
    } catch (error) {
        console.error('Car creation error:', error);
        res.status(500).json({ error: 'Failed to create car' });
    }
});

module.exports = router;
