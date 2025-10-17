const express = require('express');
const router = express.Router();

// Generate a unique coupon code
function generateCouponCode() {
    const prefix = 'CH360';
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `${prefix}-${random}`;
}

// POST /api/coupons/create - Create a new coupon from game
router.post('/create', async (req, res) => {
    try {
        const {
            serial_number,
            coupon_code,
            game_type,
            user_id,
            discount_value,
            discount_type,
            min_order_value,
            max_discount_amount,
            description,
            expires_at
        } = req.body;
        
        // Validate input
        if (!serial_number || !coupon_code || !game_type) {
            return res.status(400).json({ error: 'Serial number, coupon code, and game type are required' });
        }
        
        // Check if coupon code already exists
        const [existingCoupons] = await global.db.execute(
            'SELECT id FROM coupons_list WHERE code = ?',
            [coupon_code]
        );
        
        if (existingCoupons.length > 0) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }
        
        // Set default values if not provided
        const discount = discount_value || 10;
        const type = discount_type || 'percentage';
        const expiry = expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        
        // Insert coupon into database
        const [result] = await global.db.execute(
            `INSERT INTO coupons_list
             (code, discount_type, discount_value, expiry_date, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [coupon_code, type, discount, expiry, user_id]
        );
        
        res.json({
            success: true,
            couponId: result.insertId,
            coupon: {
                id: result.insertId,
                code: coupon_code,
                discount_value: discount,
                discount_type: type,
                description: desc,
                expiry_date: expiry,
                game_type: game_type
            },
            message: 'Coupon created successfully'
        });
        
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// POST /api/coupons - Create a new coupon from game
router.post('/', async (req, res) => {
    try {
        const {
            serial_number,
            coupon_code,
            game_type,
            user_id,
            discount_value,
            discount_type,
            min_order_value,
            max_discount_amount,
            description,
            expires_at
        } = req.body;
        
        // Validate input
        if (!serial_number || !coupon_code || !game_type) {
            return res.status(400).json({ error: 'Serial number, coupon code, and game type are required' });
        }
        
        // Check if coupon code already exists
        const [existingCoupons] = await global.db.execute(
            'SELECT id FROM coupons_list WHERE code = ?',
            [coupon_code]
        );
        
        if (existingCoupons.length > 0) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }
        
        // Set default values if not provided
        const discount = discount_value || 10;
        const type = discount_type || 'percentage';
        const expiry = expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        
        // Insert coupon into database
        const [result] = await global.db.execute(
            `INSERT INTO coupons_list
             (code, discount_type, discount_value, expiry_date, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [coupon_code, type, discount, expiry, user_id]
        );
        
        res.json({
            success: true,
            couponId: result.insertId,
            message: 'Coupon created successfully'
        });
        
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// GET /api/coupons/validate/:code - Validate a coupon
router.get('/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        const [coupons] = await global.db.execute(
            `SELECT * FROM coupons_list
             WHERE code = ? AND is_used = 0 AND (expiry_date IS NULL OR expiry_date > NOW())`,
            [code]
        );
        
        if (coupons.length === 0) {
            return res.status(404).json({
                valid: false,
                message: 'Coupon not found, expired, or already used'
            });
        }
        
        const coupon = coupons[0];
        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                coupon_code: coupon.code,
                discount_value: coupon.discount_value,
                discount_type: coupon.discount_type,
                min_order_value: 3000, // Default minimum order value since table doesn't have this field
                max_discount_amount: null, // Not available in existing table
                expires_at: coupon.expiry_date
            }
        });
        
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});

// POST /api/coupons/use/:code - Delete a coupon after use
router.post('/use/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { user_id, order_id } = req.body;
        
        // First check if coupon exists and is not used
        const [coupons] = await global.db.execute(
            `SELECT id FROM coupons_list
             WHERE code = ? AND is_used = 0 AND (expiry_date IS NULL OR expiry_date > NOW())`,
            [code]
        );
        
        if (coupons.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found, expired, or already used'
            });
        }
        
        // Delete the coupon from database
        const [result] = await global.db.execute(
            `DELETE FROM coupons_list WHERE code = ?`,
            [code]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Coupon used and removed successfully'
        });
        
    } catch (error) {
        console.error('Error using coupon:', error);
        res.status(500).json({ error: 'Failed to use coupon' });
    }
});

// GET /api/coupons/user/:userId - Get all coupons for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [coupons] = await global.db.execute(
            `SELECT * FROM coupons_list
             WHERE user_id = ?
             ORDER BY generated_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            coupons: coupons
        });
        
    } catch (error) {
        console.error('Error fetching user coupons:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

module.exports = router;