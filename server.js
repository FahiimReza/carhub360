const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
let db;

async function initDatabase() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'carhub360'
        });
        console.log('✅ Database connected successfully');
        
        // Make db available globally
        global.db = db;

        // Initialize default blog categories if they don't exist
        await initializeDefaultBlogCategories();
        
        // Initialize car data if the cars table is empty
        await initializeCarData();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('Please ensure MySQL is running and database exists');
        throw error;
    }
}

// Function to initialize default blog categories
async function initializeDefaultBlogCategories() {
    try {
        const defaultCategories = [
            { name: 'General Discussion', slug: 'general-discussion', description: 'General automotive discussions' },
            { name: 'Car Reviews', slug: 'car-reviews', description: 'In-depth car reviews and comparisons' },
            { name: 'Maintenance Tips', slug: 'maintenance-tips', description: 'Car maintenance and repair advice' },
            { name: 'Buying Advice', slug: 'buying-advice', description: 'Tips for buying and selling cars' },
            { name: 'Service Questions', slug: 'service-questions', description: 'Questions about car services and repairs' }
        ];

        for (const cat of defaultCategories) {
            const [existing] = await global.db.execute(
                'SELECT id FROM blog_categories WHERE name = ?',
                [cat.name]
            );
            
            if (existing.length === 0) {
                await global.db.execute(
                    'INSERT INTO blog_categories (name, slug, description) VALUES (?, ?, ?)',
                    [cat.name, cat.slug, cat.description]
                );
                console.log(`✅ Created default category: ${cat.name}`);
            } else {
                console.log(`ℹ️ Category already exists: ${cat.name}`);
            }
        }
        
        console.log('✅ Blog categories initialization completed');
    } catch (error) {
        console.error('❌ Error initializing blog categories:', error.message);
    }
}

// Function to initialize car data if the database is empty
async function initializeCarData() {
    try {
        // Check if cars table exists and has data
        const [carsCheck] = await global.db.execute('SELECT COUNT(*) as count FROM cars');
        
        if (carsCheck[0].count === 0) {
            console.log('🚗 Initializing car data...');
            
            // Check if brands exist
            const [brandsCheck] = await global.db.execute('SELECT COUNT(*) as count FROM car_brands');
            
            if (brandsCheck[0].count === 0) {
                // Insert basic car categories first
                await global.db.execute(`
                    INSERT INTO car_categories (name, description, icon, sort_order) VALUES
                    ('Sedan', '4-door passenger cars with trunks', 'car-sedan', 1),
                    ('SUV', 'Sport Utility Vehicles with high ground clearance', 'car-suv', 2),
                    ('MPV', 'Multi-Purpose Vehicles for families', 'car-mpv', 3),
                    ('Pickup', 'Trucks with open cargo beds', 'car-pickup', 4),
                    ('Hatchback', 'Compact cars with rear hatch', 'car-hatchback', 5)
                `);
                
                // Insert basic car brands
                await global.db.execute(`
                    INSERT INTO car_brands (name, country, founded_year, description, status) VALUES
                    ('Toyota', 'Japan', 1937, 'Reliable Japanese automaker', 'active'),
                    ('Honda', 'Japan', 1948, 'Innovative Japanese brand', 'active'),
                    ('Hyundai', 'South Korea', 1967, 'Value-packed modern cars', 'active'),
                    ('Kia', 'South Korea', 1944, 'Stylish and feature-rich vehicles', 'active'),
                    ('Nissan', 'Japan', 1933, 'Diverse range of vehicles', 'active'),
                    ('Tesla', 'United States', 2003, 'Electric vehicle leader', 'active'),
                    ('BMW', 'Germany', 1916, 'Premium German engineering', 'active'),
                    ('Mercedes-Benz', 'Germany', 1926, 'Luxury vehicles with advanced tech', 'active')
                `);
                
                // Insert basic car models
                await global.db.execute(`
                    INSERT INTO car_models (brand_id, model_name, category_id, production_start_year, description) VALUES
                    ((SELECT id FROM car_brands WHERE name='Toyota'), 'Camry', (SELECT id FROM car_categories WHERE name='Sedan'), 2019, 'Comfortable mid-size sedan'),
                    ((SELECT id FROM car_brands WHERE name='Honda'), 'CR-V', (SELECT id FROM car_categories WHERE name='SUV'), 2019, 'Spacious compact SUV'),
                    ((SELECT id FROM car_brands WHERE name='Tesla'), 'Model 3', (SELECT id FROM car_categories WHERE name='Sedan'), 2017, 'Electric compact sedan'),
                    ((SELECT id FROM car_brands WHERE name='BMW'), 'X5', (SELECT id FROM car_categories WHERE name='SUV'), 2019, 'Luxury mid-size SUV'),
                    ((SELECT id FROM car_brands WHERE name='Mercedes-Benz'), 'C-Class', (SELECT id FROM car_categories WHERE name='Sedan'), 2019, 'Compact executive sedan'),
                    ((SELECT id FROM car_brands WHERE name='Hyundai'), 'Creta', (SELECT id FROM car_categories WHERE name='SUV'), 2019, 'Compact crossover SUV'),
                    ((SELECT id FROM car_brands WHERE name='Nissan'), 'Micra', (SELECT id FROM car_categories WHERE name='Hatchback'), 2019, 'Compact city car'),
                    ((SELECT id FROM car_brands WHERE name='Kia'), 'Sonet', (SELECT id FROM car_categories WHERE name='SUV'), 2020, 'Subcompact crossover')
                `);
                
                // Insert sample cars
                await global.db.execute(`
                    INSERT INTO cars (model_id, variant_name, year, fuel_type, transmission, seats, rental_price_daily, selling_price, description, availability_status, listing_status) VALUES
                    ((SELECT id FROM car_models WHERE model_name='Camry'), 'LE', 2023, 'petrol', 'automatic', 5, 3500, 1800000, 'Comfortable sedan with advanced features', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='CR-V'), 'EX', 2023, 'hybrid', 'automatic', 7, 5500, 2500000, 'Spacious SUV with hybrid technology', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='Model 3'), 'Standard', 2023, 'electric', 'automatic', 5, 8000, 4500000, 'Electric sedan with autopilot', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='X5'), 'xDrive40i', 2023, 'petrol', 'automatic', 7, 12000, 6500000, 'Luxury SUV with premium features', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='C-Class'), 'C200', 2023, 'petrol', 'automatic', 5, 6000, 3500000, 'Executive sedan with luxury features', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='Creta'), 'SX', 2023, 'petrol', 'automatic', 5, 4000, 2300000, 'Feature-rich compact SUV', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='Micra'), 'Visia', 2023, 'petrol', 'manual', 5, 2500, 1200000, 'Efficient city car', 'available', 'active'),
                    ((SELECT id FROM car_models WHERE model_name='Sonet'), 'HTX+', 2023, 'petrol', 'automatic', 5, 3500, 2100000, 'Well-equipped subcompact SUV', 'available', 'active')
                `);
                
                // Add placeholder images for the cars
                const [newCars] = await global.db.execute('SELECT id FROM cars ORDER BY id DESC LIMIT 8');
                for (const car of newCars) {
                    await global.db.execute(`
                        INSERT INTO car_images (car_id, image_url, is_primary, image_type, alt_text) VALUES
                        (?, 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', true, 'exterior', 'Car Image')
                    `, [car.id]);
                }
                
                console.log('✅ Basic car data initialized successfully');
            }
        } else {
            console.log(`ℹ️ Cars table already has ${carsCheck[0].count} records`);
        }
    } catch (error) {
        console.error('❌ Error initializing car data:', error.message);
        // Don't throw error here to allow server to start even if car data initialization fails
    }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Enable gzip/Brotli compression for faster responses
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Static assets with long-lived caching (hashed files and images)
app.use(express.static('.', {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath);
        const oneYear = 31536000;
        const oneDay = 86400;
        if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.avif'].includes(ext)) {
            res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`);
        } else if (['.js', '.css', '.woff', '.woff2'].includes(ext)) {
            res.setHeader('Cache-Control', `public, max-age=${oneDay}`);
        }
    }
}));

// Serve all HTML pages
const pages = ['index', 'admin', 'blog', 'login', 'dashboard', 'car-details', 
               'compare', 'booking', 'services', 'about', 'contact', 'search-results'];

pages.forEach(page => {
    app.get(`/${page === 'index' ? '' : page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        if (db) {
            await db.ping();
            dbStatus = 'connected';
        }
    } catch (error) {
        dbStatus = 'error';
    }
    
    res.json({ 
        status: 'OK', 
        message: 'CarHub360 API is running',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// 404 handler

// Start server after database initialization
initDatabase()
    .then(() => {
        // Load API routes after DB is ready
        app.use('/api/cars', require('./routes/cars'));
        app.use('/api/users', require('./routes/users'));
        app.use('/api/bookings', require('./routes/bookings'));
        app.use('/api/messages', require('./routes/messages'));
        app.use('/api/reviews', require('./routes/reviews'));
        app.use('/api/blog', require('./routes/blog'));
        app.use('/api/services', require('./routes/services'));
        app.use('/api/admin', require('./routes/admin'));
        app.use('/api/coupons', require('./routes/coupons'));

        // 404 handler
        app.use((req, res) => {
          // For API paths or file extensions, return JSON 404
          if (req.path.startsWith('/api/') || req.path.includes('.')) {
            return res.status(404).json({ error: 'Not Found' });
          }
          // For other paths, serve index.html (SPA fallback)
          res.status(404).sendFile(path.join(__dirname, 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`🚗 CarHub360 server running on port ${PORT}`);
            console.log(`📱 Frontend: http://localhost:${PORT}`);
            console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
            console.log(`📊 Database: ${process.env.DB_NAME || 'carhub360'}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
