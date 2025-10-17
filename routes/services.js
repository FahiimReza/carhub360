const express = require('express');
const { sendServiceBookingNotification } = require('../utils/emailService');
const router = express.Router();

// JWT Auth Middleware (copied from routes/users.js or routes/bookings.js)
const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT s.*, sc.name as category
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = TRUE AND sc.is_active = TRUE
    `;
    const params = [];
    
    if (category) {
      query += ' AND sc.name = ?';
      params.push(category);
    }
    
    query += ' ORDER BY sc.name, s.service_name';
    
    const [services] = await global.db.execute(query, params);
    
    res.json({ services });
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/services/book - Book a service
router.post('/book', async (req, res) => {
  try {
    const {
      user_id, service_id, car_id, scheduled_date,
      total_price, service_location, customer_notes
    } = req.body;

    // Generate booking reference
    const booking_reference = `SV${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [result] = await global.db.execute(`
        INSERT INTO service_bookings (
          booking_reference, user_id, service_id, car_id,
          scheduled_date, service_location, base_price, total_amount,
          payment_status, service_status, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      booking_reference, user_id, service_id, car_id || null,
      scheduled_date, service_location || null, total_price, total_price, 'pending', 'scheduled', customer_notes
    ]);

    // Get service details for email notification
    const [serviceDetails] = await global.db.execute(`
        SELECT s.service_name, sc.name as category
        FROM services s
        JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.id = ?
    `, [service_id]);

    // Get user details for email notification
    const [userDetails] = await global.db.execute(`
        SELECT CONCAT(u.first_name, ' ', u.last_name) as name, u.email, u.phone
        FROM users u
        WHERE u.id = ?
    `, [user_id]);

    // Send service booking notification email to admin (async, don't wait)
    const bookingData = {
        booking_reference,
        scheduled_date,
        total_amount: total_price,
        service_location,
        customer_notes
    };

    const serviceData = serviceDetails[0] || {};
    const userData = userDetails[0] || {};

    // Send email notification asynchronously (don't block the response)
    sendServiceBookingNotification(bookingData, serviceData, userData).catch(emailError => {
        console.error('Failed to send service booking notification email:', emailError);
    });

    res.json({
      message: 'Service booking created successfully',
      bookingId: result.insertId,
      booking_reference
    });
  } catch (error) {
    console.error('Service booking error:', error);
    res.status(500).json({ error: 'Failed to book service' });
  }
});

// PUT /api/services/bookings/:id - Update service booking status
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_status, payment_status } = req.body;

    const [result] = await global.db.execute(`
      UPDATE service_bookings
      SET service_status = ?, payment_status = ?, updated_at = NOW()
      WHERE id = ?
    `, [service_status, payment_status || 'pending', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service booking not found' });
    }

    res.json({ message: 'Service booking updated successfully' });
  } catch (error) {
    console.error('Service booking update error:', error);
    res.status(500).json({ error: 'Failed to update service booking' });
  }
});

// GET /api/services/bookings/admin - Get all service bookings (admin)
router.get('/bookings/admin', async (req, res) => {
  try {
    const [bookings] = await global.db.execute(`
      SELECT sb.*, s.service_name, sc.name as category,
             cm.model_name as car_model, cb.name as car_brand,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.email as user_email, u.phone as user_phone
      FROM service_bookings sb
      JOIN services s ON sb.service_id = s.id
      JOIN service_categories sc ON s.category_id = sc.id
      LEFT JOIN cars c ON sb.car_id = c.id
      LEFT JOIN car_models cm ON c.model_id = cm.id
      LEFT JOIN car_brands cb ON cm.brand_id = cb.id
      JOIN users u ON sb.user_id = u.id
      ORDER BY sb.created_at DESC
    `);

    res.json({ bookings });
  } catch (error) {
    console.error('Admin service bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch service bookings' });
  }
});

// GET /api/services/bookings - Get service bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated token
    
    let query = `
        SELECT sb.*, s.service_name as service_name, sc.name as category,
               c.sku as car_name, cm.model_name as model
        FROM service_bookings sb
        JOIN services s ON sb.service_id = s.id
        JOIN service_categories sc ON s.category_id = sc.id
        LEFT JOIN cars c ON sb.car_id = c.id
        LEFT JOIN car_models cm ON c.model_id = cm.id
        WHERE sb.user_id = ?
    `;
    const params = [userId]; // Use userId from token
    
    query += ' ORDER BY sb.scheduled_date DESC';
    
    const [bookings] = await global.db.execute(query, params);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Service bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch service bookings' });
  }
});

// GET /api/services/categories - Get service categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await global.db.execute(`
        SELECT DISTINCT sc.name as category
        FROM services s
        JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.is_active = TRUE AND sc.is_active = TRUE
        ORDER BY sc.name
    `);
    
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;