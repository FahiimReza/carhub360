const express = require('express');
const router = express.Router();

// POST /api/reviews - Create a new review
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      reviewable_type,
      reviewable_id,
      rating,
      title,
      content,
      pros,
      cons,
      verified_purchase = false
    } = req.body;

    if (!user_id || !reviewable_type || !reviewable_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields: user_id, reviewable_type, reviewable_id, rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const [result] = await global.db.execute(
      `INSERT INTO reviews (
        user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [user_id, reviewable_type, reviewable_id, rating, title, content, pros, cons, verified_purchase]
    );

    res.status(201).json({
      message: 'Review created successfully',
      reviewId: result.insertId,
      review: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/reviews - Get reviews (filtered by type and id if provided)
router.get('/', async (req, res) => {
  try {
    const { reviewable_type, reviewable_id, user_id, status = 'approved', limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = ? AND r.reviewable_type = ?
    `;
    const params = [status, reviewable_type];

    if (reviewable_id) {
      query += ` AND r.reviewable_id = ?`;
      params.push(reviewable_id);
    }

    if (user_id) {
      query += ` AND r.user_id = ?`;
      params.push(user_id);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [reviews] = await global.db.execute(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM reviews WHERE status = ? AND reviewable_type = ?`;
    let countParams = [status, reviewable_type];
    if (reviewable_id) {
      countQuery += ` AND reviewable_id = ?`;
      countParams.push(reviewable_id);
    }
    if (user_id) {
      countQuery += ` AND user_id = ?`;
      countParams.push(user_id);
    }
    const [countResult] = await global.db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      reviews,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PUT /api/reviews/:id - Update review status (admin only, e.g., approve/reject)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [review] = await global.db.execute(`
      SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as reviewer_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (review.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review[0]);
  } catch (error) {
    console.error('Review fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [result] = await global.db.execute(
      `UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id - Delete a review (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Add admin authentication middleware here
    // For now, assuming admin access

    const [result] = await global.db.execute(
      `DELETE FROM reviews WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;