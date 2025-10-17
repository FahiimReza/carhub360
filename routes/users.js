const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationNotification } = require('../utils/emailService');
const router = express.Router();

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

// POST /api/users/register - User registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, address = '', city = '' } = req.body;
        
        // Check if user exists
        const [existing] = await global.db.execute(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Split name into first and last (simple split)
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || name;
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Insert user
        const [result] = await global.db.execute(`
            INSERT INTO users (first_name, last_name, email, password, phone, address_line1, city, role_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [firstName, lastName, email, hashedPassword, phone, address, city]);
        
        // Generate JWT
        const token = jwt.sign(
            { userId: result.insertId, email, role: 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        // Send registration notification email to admin (async, don't wait)
        const userData = {
            id: result.insertId,
            name: name,
            email: email,
            phone: phone,
            role: 'user'
        };
        
        // Send email notification asynchronously (don't block the response)
        sendRegistrationNotification(userData).catch(emailError => {
            console.error('Failed to send registration notification email:', emailError);
        });
        
        res.json({
            message: 'Registration successful',
            token,
            user: { id: result.insertId, name, email, phone, role: 'user' }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/users/login - User login
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt - Request body:', req.body);
        const { email, password } = req.body;
        
        // Find user with role
        const [users] = await global.db.execute(`
            SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.phone, u.role_id, r.role_name as role
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.id
            WHERE u.email = ?
        `, [email]);
        
        console.log('Query result:', users);
        
        if (users.length === 0) {
            console.log('User not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', validPassword);
        
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        const userData = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim(),
            email: user.email,
            role: user.role || 'user'
        };
        
        console.log('Login successful for user:', userData);
        
        res.json({
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone } = req.body;

    // Check if user exists
    const [existingUser] = await global.db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser[0].email) {
      const [emailCheck] = await global.db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const [result] = await global.db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?',
      [first_name, last_name, email, phone, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Failed to update user' });
    }

    // Get updated user data
    const [updatedUser] = await global.db.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, r.role_name as role, u.created_at
      FROM users u
      LEFT JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    const userForFrontend = {
      id: updatedUser[0].id,
      name: `${updatedUser[0].first_name} ${updatedUser[0].last_name}`.trim(),
      email: updatedUser[0].email,
      role: updatedUser[0].role
    };

    res.json({
      message: 'Profile updated successfully',
      user: userForFrontend
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await global.db.execute(`
            SELECT u.id, u.email, u.phone, u.address_line1 as address, u.city,
                   CONCAT(u.first_name, ' ', u.last_name) as name, u.avatar,
                   u.email_verified as verified, u.created_at, r.role_name as role
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.id
            WHERE u.id = ?
        `, [req.user.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user: users[0] });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

module.exports = router;
