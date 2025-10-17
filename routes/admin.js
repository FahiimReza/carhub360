const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Import authentication middleware from users (assuming it's exported or duplicate)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Admin check middleware
const requireAdmin = async (req, res, next) => {
    try {
        const [users] = await global.db.execute(
            'SELECT role_id FROM users WHERE id = ?',
            [req.user.userId]
        );
        
        if (users.length === 0 || users[0].role_id !== 2) { // Assuming role_id 2 is admin from schema
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify admin role' });
    }
};

// GET /api/admin/metrics - Admin dashboard metrics
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD (UTC date part)
        const currentMonth = now.getUTCMonth() + 1; // Use UTC month
        const currentYear = now.getUTCFullYear();   // Use UTC year
        
        // Total users (active)
        const [totalUsers] = await global.db.execute(
            'SELECT COUNT(*) as count FROM users WHERE account_status = "active"'
        );
        
        // Active cars
        const [activeCars] = await global.db.execute(
            'SELECT COUNT(*) as count FROM cars WHERE availability_status = "available"'
        );
        
        // Today's bookings (car + service, non-cancelled)
        const [todayBookings] = await global.db.execute(`
            SELECT COUNT(*) as count 
            FROM (
                SELECT id FROM bookings WHERE DATE(created_at) = ? AND booking_status != "cancelled"
                UNION ALL
                SELECT id FROM service_bookings WHERE DATE(created_at) = ? AND service_status != "cancelled"
            ) as combined
        `, [today, today]);
        
        // Pending bookings count
        const [pendingBookings] = await global.db.execute(`
            SELECT COUNT(*) as count 
            FROM (
                SELECT id FROM bookings WHERE booking_status = 'pending'
                UNION ALL
                SELECT id FROM service_bookings WHERE service_status = 'pending'
            ) as combined
        `);
        
        // Pending revenue (sum total_amount where payment_status = 'pending')
        const [pendingRevenue] = await global.db.execute(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM (
                SELECT total_amount FROM bookings WHERE payment_status = "pending"
                UNION ALL
                SELECT total_amount FROM service_bookings WHERE payment_status = "pending"
            ) as combined
        `);
        
        // Today's revenue (paid today)
        const [todayRevenue] = await global.db.execute(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM (
                SELECT total_amount FROM bookings WHERE DATE(updated_at) = ? AND payment_status = "paid"
                UNION ALL
                SELECT total_amount FROM service_bookings WHERE DATE(updated_at) = ? AND payment_status = "paid"
            ) as combined
        `, [today, today]);
        
        // Monthly revenue (paid this month)
        const [monthlyRevenue] = await global.db.execute(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM (
                SELECT total_amount FROM bookings
                WHERE MONTH(updated_at) = ? AND YEAR(updated_at) = ? AND payment_status = "paid"
                UNION ALL
                SELECT total_amount FROM service_bookings
                WHERE MONTH(updated_at) = ? AND YEAR(updated_at) = ? AND payment_status = "paid"
            ) as combined
        `, [currentMonth, currentYear, currentMonth, currentYear]);
        
        res.json({
            totalUsers: totalUsers[0].count,
            activeCars: activeCars[0].count,
            todayBookings: todayBookings[0].count,
            pendingBookings: pendingBookings[0].count,
            pendingRevenue: parseFloat(pendingRevenue[0].total),
            todayRevenue: parseFloat(todayRevenue[0].total),
            monthlyRevenue: parseFloat(monthlyRevenue[0].total)
        });
    } catch (error) {
        console.error('Metrics query error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// GET /api/admin/users - List all users for admin
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const offset = (page - 1) * limit;
        
        const [users] = await global.db.execute(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at,
                   r.role_name as role, u.account_status as status
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.id
            WHERE (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `, [`%${search}%`, `%${search}%`, `%${search}%`, parseInt(limit), parseInt(offset)]);
        
        const [total] = await global.db.execute(
            'SELECT COUNT(*) as total FROM users WHERE account_status = "active"'
        );
        
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total[0].total,
                pages: Math.ceil(total[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if admin (protect admin accounts)
        const [user] = await global.db.execute(
            'SELECT role_id FROM users WHERE id = ?',
            [id]
        );
        
        if (user.length > 0 && user[0].role_id === 2) {
            return res.status(403).json({ error: 'Cannot delete admin account' });
        }
        
        const [result] = await global.db.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /api/admin/cars - List all cars for admin
router.get('/cars', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, status = '', category = '' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (status) {
            whereClause += ' AND c.availability_status = ?';
            params.push(status);
        }
        if (category) {
            whereClause += ' AND cat.name = ?';
            params.push(category);
        }
        
        const [cars] = await global.db.execute(`
            SELECT c.id, c.sku, c.variant_name, c.year, c.fuel_type, c.transmission,
                   c.availability_status as status, c.rental_price_daily, c.selling_price,
                   m.model_name as model, b.name as brand, cat.name as category,
                   c.created_at
            FROM cars c
            JOIN car_models m ON c.model_id = m.id
            JOIN car_brands b ON m.brand_id = b.id
            JOIN car_categories cat ON m.category_id = cat.id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        const [total] = await global.db.execute(
            `SELECT COUNT(*) as total FROM cars c LEFT JOIN car_models m ON c.model_id = m.id ${whereClause}`,
            params
        );
        
        res.json({
            cars,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total[0].total,
                pages: Math.ceil(total[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Cars list error:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
    }
});

// POST /api/admin/cars - Create new car
router.post('/cars', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            model_id, variant_name, year, fuel_type, transmission,
            rental_price_daily, selling_price, availability_status,
            description, image_url
        } = req.body;
        
        // Validate required fields
        if (!model_id || !year || !rental_price_daily || !selling_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const [result] = await global.db.execute(`
            INSERT INTO cars (
                model_id, variant_name, year, fuel_type, transmission,
                rental_price_daily, selling_price, availability_status,
                description, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            model_id, variant_name, year, fuel_type, transmission,
            rental_price_daily, selling_price, availability_status,
            description, image_url
        ]);
        
        res.status(201).json({ 
            message: 'Car created successfully',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Create car error:', error);
        res.status(500).json({ error: 'Failed to create car' });
    }
});

// PUT /api/admin/cars/:id - Update car
router.put('/cars/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = fields.map(field => updates[field]);
        values.push(id);
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const [result] = await global.db.execute(`
            UPDATE cars SET ${setClause} WHERE id = ?
        `, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        res.json({ message: 'Car updated successfully' });
    } catch (error) {
        console.error('Update car error:', error);
        res.status(500).json({ error: 'Failed to update car' });
    }
});

// PATCH /api/admin/cars/:id - Partial update car (for status toggle)
router.patch('/cars/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { availability_status } = req.body;
        
        if (!availability_status) {
            return res.status(400).json({ error: 'availability_status required' });
        }
        
        const [result] = await global.db.execute(
            'UPDATE cars SET availability_status = ? WHERE id = ?',
            [availability_status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        res.json({ message: 'Car status updated successfully' });
    } catch (error) {
        console.error('Patch car error:', error);
        res.status(500).json({ error: 'Failed to update car status' });
    }
});

// DELETE /api/admin/cars/:id - Delete car
router.delete('/cars/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await global.db.execute(
            'DELETE FROM cars WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Delete car error:', error);
        res.status(500).json({ error: 'Failed to delete car' });
    }
});

// GET /api/admin/bookings - Combined bookings (car + service)
router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, status = '', type = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }
        if (type) {
            if (type === 'car') {
                whereClause += ' AND booking_type IS NOT NULL';
            } else if (type === 'service') {
                whereClause += ' AND service_id IS NOT NULL';
            }
            params.push(type);
        }
        
        const [bookings] = await global.db.execute(`
            SELECT
                id, booking_reference, user_id, car_id, service_id,
                booking_type, rental_start_date, rental_end_date,
                scheduled_date, total_amount, payment_status, status,
                customer_name, customer_email, customer_phone,
                created_at, car_model, service_name,
                CASE WHEN service_id IS NOT NULL THEN 'service' ELSE 'car' END as booking_type_label
            FROM (
                SELECT b.id, b.booking_reference, b.user_id, b.car_id, NULL as service_id,
                       b.booking_type, b.rental_start_date, b.rental_end_date, NULL as scheduled_date,
                       b.total_amount, b.payment_status, b.booking_status as status,
                       u.first_name || ' ' || u.last_name as customer_name,
                       u.email as customer_email, u.phone as customer_phone,
                       b.created_at, m.model_name as car_model, NULL as service_name
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN cars c ON b.car_id = c.id
                JOIN car_models m ON c.model_id = m.id
                WHERE ${whereClause.replace('status = ?', 'b.booking_status = ?')}
                
                UNION ALL
                
                SELECT sb.id, sb.booking_reference, sb.user_id, sb.car_id, sb.service_id,
                       NULL as booking_type, NULL, NULL, sb.scheduled_date,
                       sb.total_amount, sb.payment_status, sb.service_status as status,
                       u.first_name || ' ' || u.last_name as customer_name,
                       u.email as customer_email, u.phone as customer_phone,
                       sb.created_at, NULL as car_model, s.name as service_name
                FROM service_bookings sb
                JOIN users u ON sb.user_id = u.id
                JOIN services s ON sb.service_id = s.id
                WHERE ${whereClause.replace('status = ?', 'sb.service_status = ?')}
            ) combined
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        const [total] = await global.db.execute(`
            SELECT COUNT(*) as total FROM (
                SELECT 1 FROM bookings b WHERE ${whereClause.replace('status = ?', 'b.booking_status = ?')}
                UNION ALL
                SELECT 1 FROM service_bookings sb WHERE ${whereClause.replace('status = ?', 'sb.service_status = ?')}
            ) combined
        `, params);
        
        res.json({
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total[0].total,
                pages: Math.ceil(total[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Bookings list error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// PATCH /api/admin/bookings/:id - Update booking status
router.patch('/bookings/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { booking_status } = req.body;
        
        if (!booking_status) {
            return res.status(400).json({ error: 'booking_status required' });
        }
        
        // Check if it's a car booking or service booking
        const [booking] = await global.db.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [id]
        );
        
        if (booking.length > 0) {
            // Car booking
            const [result] = await global.db.execute(
                'UPDATE bookings SET booking_status = ? WHERE id = ?',
                [booking_status, id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            
            res.json({ message: 'Booking status updated successfully' });
        } else {
            // Service booking
            const [serviceResult] = await global.db.execute(
                'UPDATE service_bookings SET service_status = ? WHERE id = ?',
                [booking_status, id]
            );
            
            if (serviceResult.affectedRows === 0) {
                return res.status(404).json({ error: 'Service booking not found' });
            }
            
            res.json({ message: 'Service booking status updated successfully' });
        }
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// GET /api/admin/messages - Admin inquiries (updated to new schema)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50, subject = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = "WHERE ci.status IN ('new', 'assigned', 'in_progress')";
        let params = [];
        
        if (subject) {
            whereClause += ' AND ci.subject LIKE ?';
            params.push(`%${subject}%`);
        }
        
        if (status && status !== 'all') {
            whereClause += ' AND ci.status = ?';
            params.push(status);
        }
        
        const [inquiries] = await global.db.execute(`
            SELECT
                ci.id,
                ci.inquiry_id as reference,
                ci.subject,
                ci.message,
                ci.created_at,
                ci.status,
                ci.priority,
                cc.name as category_name,
                ci.name as customer_name,
                ci.email,
                ci.phone,
                COALESCE(resp.total_count, 0) as response_count,
                (
                    SELECT COUNT(*) FROM contact_responses cr
                    WHERE cr.inquiry_id = ci.id AND cr.is_read = FALSE
                ) as unread_count,
                (
                    SELECT content FROM contact_responses cr
                    WHERE cr.inquiry_id = ci.id
                    ORDER BY cr.created_at DESC LIMIT 1
                ) as last_response_preview
            FROM contact_inquiries ci
            LEFT JOIN contact_categories cc ON ci.category_id = cc.id
            LEFT JOIN (
                SELECT inquiry_id, COUNT(id) as total_count
                FROM contact_responses GROUP BY inquiry_id
            ) resp ON ci.id = resp.inquiry_id
            ${whereClause}
            ORDER BY ci.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        const [total] = await global.db.execute(`
            SELECT COUNT(*) as total
            FROM contact_inquiries ci
            ${whereClause}`,
            params
        );
        
        res.json({
            inquiries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total[0].total,
                pages: Math.ceil(total[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Messages list error:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
});

// DELETE /api/admin/messages/:inquiryId - Delete inquiry
router.delete('/messages/:inquiryId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { inquiryId } = req.params;
        
        const [result] = await global.db.execute(
            'DELETE FROM contact_inquiries WHERE id = ?',
            [inquiryId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
        
        res.json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Delete inquiry error:', error);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
});

// GET /api/admin/analytics - Analytics data for charts
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { range = '7days' } = req.query;
        let days;
        if (range === '7days') {
            days = 7;
        } else if (range === '30days') {
            days = 30;
        } else {
            days = 7;
        }
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
        
        // Daily logins (count distinct users with last_login in date range)
        const [dailyLogins] = await global.db.execute(`
            SELECT DATE(last_login) as date, COUNT(DISTINCT id) as count
            FROM users 
            WHERE last_login >= ? AND last_login <= ?
            GROUP BY DATE(last_login)
            ORDER BY date ASC
        `, [startDate, endDate]);
        
        // Daily bookings (car + service)
        const [dailyBookings] = await global.db.execute(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM (
                SELECT created_at FROM bookings WHERE created_at >= ? AND created_at <= ?
                UNION ALL
                SELECT created_at FROM service_bookings WHERE created_at >= ? AND created_at <= ?
            ) combined
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate, endDate, startDate, endDate]);
        
        // Booking status distribution (overall)
        const [bookingStatuses] = await global.db.execute(`
            SELECT booking_status as status, COUNT(*) as count
            FROM bookings 
            GROUP BY booking_status
            UNION ALL
            SELECT service_status as status, COUNT(*) as count
            FROM service_bookings 
            GROUP BY service_status
        `);
        
        // Generate labels for the date range
        const labels = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        // Fill login data
        const loginData = labels.map((_, index) => {
            const dateStr = new Date(startDate.getTime() + index * 86400000).toISOString().split('T')[0];
            const login = dailyLogins.find(l => l.date === dateStr);
            return login ? login.count : 0;
        });
        
        // Fill booking data
        const bookingData = labels.map((_, index) => {
            const dateStr = new Date(startDate.getTime() + index * 86400000).toISOString().split('T')[0];
            const booking = dailyBookings.find(b => b.date === dateStr);
            return booking ? booking.count : 0;
        });
        
        // Status distribution
        const statusCounts = { confirmed: 0, pending: 0, cancelled: 0, other: 0 };
        bookingStatuses.forEach(s => {
            if (s.status === 'confirmed' || s.status === 'active' || s.status === 'completed') {
                statusCounts.confirmed += s.count;
            } else if (s.status === 'pending' || s.status === 'scheduled') {
                statusCounts.pending += s.count;
            } else if (s.status === 'cancelled' || s.status === 'no_show') {
                statusCounts.cancelled += s.count;
            } else {
                statusCounts.other += s.count;
            }
        });
        
        const statusData = [statusCounts.confirmed, statusCounts.pending, statusCounts.cancelled];
        
        res.json({
            labels,
            dailyLogins: loginData,
            dailyBookings: bookingData,
            bookingStatuses: {
                labels: ['Confirmed', 'Pending', 'Cancelled'],
                data: statusData
            }
        });
    } catch (error) {
        console.error('Analytics query error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

router.get('/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [activities] = await global.db.execute(`
      SELECT 'user' as type, CONCAT('New user registered: ', u.email) as message, u.created_at as timestamp
      FROM users u
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'booking' as type, CONCAT('Car booking confirmed: ', m.model_name) as message, b.created_at as timestamp
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN car_models m ON c.model_id = m.id
      WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND b.booking_status = 'confirmed'
      UNION ALL
      SELECT 'service' as type, CONCAT('Service request: ', s.service_name) as message, sb.created_at as timestamp
      FROM service_bookings sb
      JOIN services s ON sb.service_id = s.id
      WHERE sb.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND sb.service_status = 'scheduled'
      UNION ALL
      SELECT 'payment' as type, CONCAT('Payment received: ৳', b.total_amount) as message, b.created_at as timestamp
      FROM bookings b
      WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND b.payment_status = 'paid'
      UNION ALL
      SELECT 'payment' as type, CONCAT('Payment received: ৳', sb.total_amount) as message, sb.created_at as timestamp
      FROM service_bookings sb
      WHERE sb.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND sb.payment_status = 'paid'
      ORDER BY timestamp DESC
      LIMIT ?
    `, [limit]);

    res.json({ activities });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

const setupModelDirectory = async (req, res, next) => {
  try {
    const { modelId } = req.params;
    
    // Verify model exists
    const [model] = await global.db.execute('SELECT id, model_name FROM car_models WHERE id = ?', [modelId]);
    if (model.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    const modelData = model[0];
    const modelSlug = modelData.model_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const uploadDir = path.join(__dirname, '..', 'assets', 'car-images', modelSlug);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    req.modelSlug = modelSlug;
    req.modelName = modelData.model_name;
    req.modelDir = uploadDir;
    req.modelId = modelId;
    
    next();
  } catch (error) {
    console.error('Setup model directory error:', error);
    res.status(500).json({ error: 'Failed to setup upload directory' });
  }
};

// Multer configuration for model image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.modelDir) {
      cb(null, req.modelDir);
    } else {
      cb(new Error('Model directory not set'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/admin/upload-model-images/:modelId - Upload images for a model (applies to all cars of that model)
router.post('/upload-model-images/:modelId',
  authenticateToken,
  requireAdmin,
  setupModelDirectory,
  upload.array('images', 5),
  async (req, res) => {
    try {
      const modelSlug = req.modelSlug;
      const modelName = req.modelName;
      const modelId = req.modelId;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }
      
      // Get all cars for this model
      const [cars] = await global.db.execute('SELECT id FROM cars WHERE model_id = ?', [modelId]);
      
      if (cars.length === 0) {
        return res.status(404).json({ error: 'No cars found for this model' });
      }
      
      const uploadedPaths = req.files.map((file, index) => {
        const relativePath = `/assets/car-images/${modelSlug}/${file.filename}`;
        return {
          image_url: relativePath,
          is_primary: index === 0,
          sort_order: index,
          image_type: 'exterior',
          alt_text: `${modelName} - Image ${index + 1}`
        };
      });
      
      // For each car of this model, insert the images
      for (const car of cars) {
        for (const imgData of uploadedPaths) {
          await global.db.execute(
            'INSERT INTO car_images (car_id, image_url, is_primary, sort_order, image_type, alt_text) VALUES (?, ?, ?, ?, ?, ?)',
            [car.id, imgData.image_url, imgData.is_primary, imgData.sort_order, imgData.image_type, imgData.alt_text]
          );
        }
      }
      
      res.json({
        message: `Successfully uploaded ${req.files.length} images for model ${modelName} and associated ${cars.length} cars`,
        model_slug: modelSlug,
        images: uploadedPaths.map(img => ({ image_url: img.image_url, is_primary: img.is_primary }))
      });
    } catch (error) {
      console.error('Model image upload error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

// Export functionality
router.get('/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { type = 'cars', format = 'csv', startDate, endDate } = req.query;
        
        console.log(`Export request: type=${type}, format=${format}, startDate=${startDate}, endDate=${endDate}`);
        
        // Set content type based on format
        let contentType, fileExtension;
        switch (format) {
            case 'excel':
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                fileExtension = 'xlsx';
                break;
            case 'pdf':
                contentType = 'application/pdf';
                fileExtension = 'pdf';
                break;
            default:
                contentType = 'text/csv';
                fileExtension = 'csv';
        }
        
        // Generate filename
        const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        
        let data;
        try {
            switch (type) {
                case 'cars':
                    data = await exportCars(startDate, endDate);
                    break;
                case 'users':
                    data = await exportUsers(startDate, endDate);
                    break;
                case 'bookings':
                    data = await exportBookings(startDate, endDate);
                    break;
                case 'messages':
                    data = await exportMessages(startDate, endDate);
                    break;
                case 'analytics':
                    data = await exportAnalytics(startDate, endDate);
                    break;
                case 'services':
                    data = await exportServices(startDate, endDate);
                    break;
                default:
                    throw new Error('Invalid export type: ' + type);
            }
        } catch (exportError) {
            console.error('Specific export function error:', exportError);
            // Return error data instead of throwing
            data = `Export Error\nType: ${type}\nError: ${exportError.message}\n`;
        }
        
        // Always return CSV data for now (PDF/Excel conversion happens client-side)
        res.send(data);
        
    } catch (error) {
        console.error('Export endpoint error:', error);
        res.status(500).json({ error: 'Export failed: ' + error.message });
    }
});

// Export functions for different data types
async function exportCars(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND c.created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND c.created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        // Try the full query first
        let cars;
        try {
            [cars] = await global.db.execute(`
                SELECT
                    c.id,
                    c.sku,
                    c.variant_name,
                    c.year,
                    c.fuel_type,
                    c.transmission,
                    c.seats,
                    c.availability_status,
                    c.listing_status,
                    c.rental_price_daily,
                    c.selling_price,
                    c.description,
                    c.created_at,
                    c.updated_at,
                    m.model_name as model,
                    b.name as brand,
                    cat.name as category,
                    ci.image_url
                FROM cars c
                JOIN car_models m ON c.model_id = m.id
                JOIN car_brands b ON m.brand_id = b.id
                JOIN car_categories cat ON m.category_id = cat.id
                LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_primary = 1
                ${whereClause}
                ORDER BY c.created_at DESC
            `, params);
        } catch (joinError) {
            console.warn('Full car query failed, trying simplified version:', joinError.message);
            // Fallback to simpler query if joins fail
            try {
                [cars] = await global.db.execute(`
                    SELECT
                        c.id,
                        c.sku,
                        c.variant_name,
                        c.year,
                        c.fuel_type,
                        c.transmission,
                        c.seats,
                        c.availability_status,
                        c.rental_price_daily,
                        c.selling_price,
                        c.description,
                        c.created_at,
                        c.updated_at
                    FROM cars c
                    ${whereClause}
                    ORDER BY c.created_at DESC
                `, params);
            } catch (simpleError) {
                console.error('Even simple car query failed:', simpleError.message);
                // Return empty result if all queries fail
                cars = [];
            }
        }
        
        // Convert to CSV
        const headers = [
            'ID', 'SKU', 'Variant', 'Year', 'Fuel Type', 'Transmission', 'Seats',
            'Availability', 'Listing Status', 'Daily Rate (BDT)', 'Selling Price (BDT)',
            'Description', 'Created At', 'Updated At', 'Model', 'Brand', 'Category', 'Image URL'
        ];
        
        let csv = headers.join(',') + '\n';
        cars.forEach(car => {
            const row = [
                car.id,
                car.sku || '',
                `"${(car.variant_name || '').replace(/"/g, '""')}"`,
                car.year || '',
                car.fuel_type || '',
                car.transmission || '',
                car.seats || '',
                car.availability_status || '',
                car.listing_status || '',
                car.rental_price_daily || 0,
                car.selling_price || 0,
                `"${(car.description || '').replace(/"/g, '""')}"`,
                car.created_at || '',
                car.updated_at || '',
                car.model || '',
                car.brand || '',
                car.category || '',
                car.image_url || ''
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export cars error:', error);
        // Return CSV with error message
        return 'Error,Cars export failed\n' + error.message + '\n';
    }
}

async function exportUsers(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND u.created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND u.created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        let users;
        try {
            // Try query with role join first
            [users] = await global.db.execute(`
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    u.account_status,
                    u.created_at,
                    u.last_login,
                    r.role_name as role
                FROM users u
                LEFT JOIN user_roles r ON u.role_id = r.id
                ${whereClause}
                ORDER BY u.created_at DESC
            `, params);
        } catch (joinError) {
            console.warn('Users query with role join failed, trying simplified version:', joinError.message);
            // Fallback to simpler query
            try {
                [users] = await global.db.execute(`
                    SELECT
                        u.id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone,
                        u.account_status,
                        u.created_at,
                        u.last_login
                    FROM users u
                    ${whereClause}
                    ORDER BY u.created_at DESC
                `, params);
                
                // Add role to each user object
                users = users.map(user => ({ ...user, role: 'user' }));
            } catch (simpleError) {
                console.error('Even simple users query failed:', simpleError.message);
                users = [];
            }
        }
        
        const headers = [
            'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Created At', 'Last Login', 'Role'
        ];
        
        let csv = headers.join(',') + '\n';
        users.forEach(user => {
            const row = [
                user.id,
                `"${(user.first_name || '').replace(/"/g, '""')}"`,
                `"${(user.last_name || '').replace(/"/g, '""')}"`,
                user.email || '',
                user.phone || '',
                user.account_status || '',
                user.created_at || '',
                user.last_login || '',
                user.role || 'user'
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export users error:', error);
        return 'Error,Users export failed\n' + error.message + '\n';
    }
}

async function exportBookings(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        let carBookings = [];
        let serviceBookings = [];
        
        // Try to get car bookings
        try {
            [carBookings] = await global.db.execute(`
                SELECT
                    'Car Booking' as type,
                    b.id,
                    b.booking_reference,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    m.model_name as car_model,
                    b.rental_start_date,
                    b.rental_end_date,
                    b.total_amount,
                    b.payment_status,
                    b.booking_status,
                    b.created_at
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN cars c ON b.car_id = c.id
                JOIN car_models m ON c.model_id = m.id
                ${whereClause}
            `, params);
        } catch (carBookingError) {
            console.warn('Car bookings query failed, trying simplified version:', carBookingError.message);
            try {
                [carBookings] = await global.db.execute(`
                    SELECT
                        'Car Booking' as type,
                        b.id,
                        b.booking_reference,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone,
                        'Unknown Model' as car_model,
                        b.rental_start_date,
                        b.rental_end_date,
                        b.total_amount,
                        b.payment_status,
                        b.booking_status,
                        b.created_at
                    FROM bookings b
                    JOIN users u ON b.user_id = u.id
                    ${whereClause}
                `, params);
            } catch (simpleCarError) {
                console.warn('Simple car bookings query also failed:', simpleCarError.message);
                carBookings = [];
            }
        }
        
        // Try to get service bookings
        try {
            [serviceBookings] = await global.db.execute(`
                SELECT
                    'Service Booking' as type,
                    sb.id,
                    sb.booking_reference,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    s.name as service_name,
                    sb.scheduled_date as rental_start_date,
                    sb.scheduled_date as rental_end_date,
                    sb.total_amount,
                    sb.payment_status,
                    sb.service_status as booking_status,
                    sb.created_at
                FROM service_bookings sb
                JOIN users u ON sb.user_id = u.id
                JOIN services s ON sb.service_id = s.id
                ${whereClause}
            `, params);
        } catch (serviceBookingError) {
            console.warn('Service bookings query failed:', serviceBookingError.message);
            serviceBookings = [];
        }
        
        const allBookings = [...carBookings, ...serviceBookings];
        
        const headers = [
            'Type', 'ID', 'Reference', 'First Name', 'Last Name', 'Email', 'Phone',
            'Item', 'Start Date', 'End Date', 'Amount (BDT)', 'Payment Status', 'Booking Status', 'Created At'
        ];
        
        let csv = headers.join(',') + '\n';
        allBookings.forEach(booking => {
            const row = [
                booking.type || 'Unknown',
                booking.id || '',
                booking.booking_reference || '',
                `"${(booking.first_name || '').replace(/"/g, '""')}"`,
                `"${(booking.last_name || '').replace(/"/g, '""')}"`,
                booking.email || '',
                booking.phone || '',
                `"${(booking.car_model || booking.service_name || 'Unknown').replace(/"/g, '""')}"`,
                booking.rental_start_date || '',
                booking.rental_end_date || '',
                booking.total_amount || 0,
                booking.payment_status || '',
                booking.booking_status || '',
                booking.created_at || ''
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export bookings error:', error);
        return 'Error,Bookings export failed\n' + error.message + '\n';
    }
}

async function exportMessages(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        let messages;
        try {
            // Try full query with joins
            [messages] = await global.db.execute(`
                SELECT
                    ci.id,
                    ci.inquiry_id as reference,
                    ci.subject,
                    ci.message,
                    ci.name as customer_name,
                    ci.email,
                    ci.phone,
                    ci.status,
                    ci.priority,
                    cc.name as category,
                    ci.created_at,
                    (
                        SELECT COUNT(*) FROM contact_responses cr
                        WHERE cr.inquiry_id = ci.id
                    ) as response_count
                FROM contact_inquiries ci
                LEFT JOIN contact_categories cc ON ci.category_id = cc.id
                ${whereClause}
                ORDER BY ci.created_at DESC
            `, params);
        } catch (joinError) {
            console.warn('Messages query with joins failed, trying simplified version:', joinError.message);
            try {
                // Try simpler query without joins
                [messages] = await global.db.execute(`
                    SELECT
                        ci.id,
                        ci.inquiry_id as reference,
                        ci.subject,
                        ci.message,
                        ci.name as customer_name,
                        ci.email,
                        ci.phone,
                        ci.status,
                        ci.priority,
                        ci.created_at
                    FROM contact_inquiries ci
                    ${whereClause}
                    ORDER BY ci.created_at DESC
                `, params);
                
                // Add default values for missing fields
                messages = messages.map(msg => ({
                    ...msg,
                    category: 'General',
                    response_count: 0
                }));
            } catch (simpleError) {
                console.warn('Simple messages query failed:', simpleError.message);
                messages = [];
            }
        }
        
        const headers = [
            'ID', 'Reference', 'Subject', 'Message', 'Customer Name', 'Email', 'Phone',
            'Status', 'Priority', 'Category', 'Created At', 'Response Count'
        ];
        
        let csv = headers.join(',') + '\n';
        messages.forEach(message => {
            const row = [
                message.id || '',
                message.reference || '',
                `"${(message.subject || '').replace(/"/g, '""')}"`,
                `"${(message.message || '').replace(/"/g, '""')}"`,
                `"${(message.customer_name || '').replace(/"/g, '""')}"`,
                message.email || '',
                message.phone || '',
                message.status || '',
                message.priority || '',
                message.category || '',
                message.created_at || '',
                message.response_count || 0
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export messages error:', error);
        return 'Error,Messages export failed\n' + error.message + '\n';
    }
}

async function exportAnalytics(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        let userRegistrations = [];
        let bookingCounts = [];
        
        // Try to get user registrations
        try {
            [userRegistrations] = await global.db.execute(`
                SELECT DATE(created_at) as date, COUNT(*) as registrations
                FROM users
                ${whereClause}
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `, params);
        } catch (userError) {
            console.warn('User analytics query failed:', userError.message);
            userRegistrations = [];
        }
        
        // Try to get booking counts
        try {
            [bookingCounts] = await global.db.execute(`
                SELECT
                    DATE(created_at) as date,
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_bookings,
                    SUM(total_amount) as total_revenue
                FROM bookings
                ${whereClause.replace('created_at', 'b.created_at')}
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `, params);
        } catch (bookingError) {
            console.warn('Booking analytics query failed:', bookingError.message);
            bookingCounts = [];
        }
        
        const headers = [
            'Date', 'User Registrations', 'Total Bookings', 'Paid Bookings', 'Total Revenue (BDT)'
        ];
        
        // Merge data by date
        const dateMap = new Map();
        
        userRegistrations.forEach(reg => {
            dateMap.set(reg.date, {
                date: reg.date,
                registrations: reg.registrations,
                totalBookings: 0,
                paidBookings: 0,
                revenue: 0
            });
        });
        
        bookingCounts.forEach(booking => {
            if (dateMap.has(booking.date)) {
                const existing = dateMap.get(booking.date);
                existing.totalBookings = booking.total_bookings;
                existing.paidBookings = booking.paid_bookings;
                existing.revenue = booking.total_revenue;
            } else {
                dateMap.set(booking.date, {
                    date: booking.date,
                    registrations: 0,
                    totalBookings: booking.total_bookings,
                    paidBookings: booking.paid_bookings,
                    revenue: booking.total_revenue
                });
            }
        });
        
        let csv = headers.join(',') + '\n';
        Array.from(dateMap.values()).forEach(row => {
            const data = [
                row.date,
                row.registrations || 0,
                row.totalBookings || 0,
                row.paidBookings || 0,
                row.revenue || 0
            ];
            csv += data.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export analytics error:', error);
        return 'Error,Analytics export failed\n' + error.message + '\n';
    }
}

async function exportServices(startDate, endDate) {
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        
        if (startDate) {
            whereClause += ' AND sb.created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            whereClause += ' AND sb.created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }
        
        let services;
        try {
            // Try full query with joins
            [services] = await global.db.execute(`
                SELECT
                    sb.id,
                    sb.booking_reference,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone,
                    s.name as service_name,
                    s.category,
                    sb.scheduled_date,
                    sb.total_amount,
                    sb.payment_status,
                    sb.service_status,
                    sb.created_at
                FROM service_bookings sb
                JOIN users u ON sb.user_id = u.id
                JOIN services s ON sb.service_id = s.id
                ${whereClause}
                ORDER BY sb.created_at DESC
            `, params);
        } catch (joinError) {
            console.warn('Services query with joins failed, trying simplified version:', joinError.message);
            try {
                // Try simpler query
                [services] = await global.db.execute(`
                    SELECT
                        sb.id,
                        sb.booking_reference,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone,
                        'Unknown Service' as service_name,
                        'General' as category,
                        sb.scheduled_date,
                        sb.total_amount,
                        sb.payment_status,
                        sb.service_status,
                        sb.created_at
                    FROM service_bookings sb
                    JOIN users u ON sb.user_id = u.id
                    ${whereClause}
                    ORDER BY sb.created_at DESC
                `, params);
            } catch (simpleError) {
                console.warn('Simple services query failed:', simpleError.message);
                services = [];
            }
        }
        
        const headers = [
            'ID', 'Reference', 'First Name', 'Last Name', 'Email', 'Phone',
            'Service Name', 'Category', 'Scheduled Date', 'Amount (BDT)', 'Payment Status', 'Service Status', 'Created At'
        ];
        
        let csv = headers.join(',') + '\n';
        services.forEach(service => {
            const row = [
                service.id || '',
                service.booking_reference || '',
                `"${(service.first_name || '').replace(/"/g, '""')}"`,
                `"${(service.last_name || '').replace(/"/g, '""')}"`,
                service.email || '',
                service.phone || '',
                `"${(service.service_name || '').replace(/"/g, '""')}"`,
                service.category || '',
                service.scheduled_date || '',
                service.total_amount || 0,
                service.payment_status || '',
                service.service_status || '',
                service.created_at || ''
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    } catch (error) {
        console.error('Export services error:', error);
        return 'Error,Services export failed\n' + error.message + '\n';
    }
}

module.exports = router;