const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendBookingNotification } = require('../utils/emailService');

// JWT Auth Middleware
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

// GET /api/bookings - Get user bookings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [bookings] = await global.db.execute(`
            SELECT b.*, cm.model_name as car_name, cm.model_name as model, cb.name as brand_name,
                   ci.image_url as car_image
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN car_models cm ON c.model_id = cm.id
            JOIN car_brands cb ON cm.brand_id = cb.id
            LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_primary = 1
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [parseInt(userId)]);
        
        res.json({ bookings });
    } catch (error) {
        console.error('Bookings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      user_id, car_id, booking_type, rental_start_date, rental_end_date,
      pickup_location, dropoff_location, special_requests, discount_amount = 0, payment_method_id = 1
    } = req.body;
    
    // Generate booking reference
    const booking_reference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Check car availability
    const [car] = await global.db.execute(
      'SELECT rental_price_daily, selling_price, availability_status FROM cars WHERE id = ?', [car_id]
    );
    
    if (car.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (car[0].availability_status !== 'available') {
      return res.status(400).json({ error: 'Car not available' });
    }
    
    // Calculate prices
    let base_price = 0;
    let total_amount = 0;
    let total_days = 0;
    
    if (booking_type === 'rental' && rental_start_date && rental_end_date) {
      const start = new Date(rental_start_date);
      const end = new Date(rental_end_date);
      total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      total_days = Math.max(total_days, 1);
      base_price = car[0].rental_price_daily * total_days;
      total_amount = base_price - parseFloat(discount_amount || 0);
    } else if (booking_type === 'purchase') {
      base_price = car[0].selling_price;
      total_amount = base_price - parseFloat(discount_amount || 0);
    }
    
    // Insert booking
    const [result] = await global.db.execute(`
      INSERT INTO bookings (
        booking_reference, user_id, car_id, booking_type, rental_start_date, rental_end_date,
        total_days, pickup_location, dropoff_location, special_requests, base_price,
        discount_amount, total_amount, booking_status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
    `, [
      booking_reference, user_id, car_id, booking_type,
      rental_start_date ? new Date(rental_start_date) : null,
      rental_end_date ? new Date(rental_end_date) : null,
      total_days || null,
      pickup_location || null, dropoff_location || null, special_requests || null,
      base_price, parseFloat(discount_amount || 0), total_amount
    ]);
    
    // Get user details for email notification
    const [userDetails] = await global.db.execute(
      'SELECT CONCAT(first_name, " ", last_name) as name, email, phone FROM users WHERE id = ?',
      [user_id]
    );
    
    // Get complete car details for email notification
    const [carDetails] = await global.db.execute(`
      SELECT c.*, cm.model_name, cb.name as brand_name, ci.image_url
      FROM cars c
      JOIN car_models cm ON c.model_id = cm.id
      JOIN car_brands cb ON cm.brand_id = cb.id
      LEFT JOIN car_images ci ON c.id = ci.car_id AND ci.is_primary = 1
      WHERE c.id = ?
    `, [car_id]);
    
    // Send email notification to admin
    const bookingData = {
      booking_reference,
      booking_type,
      total_amount,
      rental_start_date,
      rental_end_date,
      total_days,
      special_requests
    };
    
    const userData = userDetails.length > 0 ? userDetails[0] : null;
    const carData = carDetails.length > 0 ? carDetails[0] : null;
    
    // Send email notification asynchronously (don't wait for it to complete)
    sendBookingNotification(bookingData, carData, userData).catch(error => {
      console.error('Failed to send booking notification email:', error);
    });
    
    res.json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      booking_reference,
      total_amount
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id - Update booking status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;
        
        const [result] = await global.db.execute(`
            UPDATE bookings SET booking_status = ?, payment_status = ?, updated_at = NOW()
            WHERE id = ?
        `, [status, payment_status, id]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Booking update error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// GET /api/bookings/admin - Get all bookings (admin)
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const [bookings] = await global.db.execute(`
            SELECT b.*, cm.model_name as car_name, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email as user_email
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN car_models cm ON c.model_id = cm.id
            JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
        `);
        
        res.json({ bookings });
    } catch (error) {
        console.error('Admin bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch admin bookings' });
    }
});

module.exports = router;
