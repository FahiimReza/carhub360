const express = require('express');
const router = express.Router();
const { sendMessageNotification } = require('../utils/emailService');

// Authentication middleware
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

// Assume admin ID is 1
const ADMIN_ID = 1;

// 1. Create new conversation - POST /api/messages/conversations
router.post('/conversations', async (req, res) => {
  try {
    const { subject, message, userId } = req.body;
    const senderId = userId || null;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Check if conversation already exists between user and admin
    let conversationId;
    if (senderId) {
      const [existing] = await global.db.execute(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
         JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ? AND cp1.user_id != cp2.user_id`,
        [senderId, ADMIN_ID]
      );
      if (existing.length > 0) {
        conversationId = existing[0].id;
      }
    }

    if (!conversationId) {
      // Create new conversation
      const [convResult] = await global.db.execute(
        'INSERT INTO conversations (subject) VALUES (?)',
        [subject]
      );
      conversationId = convResult.insertId;

      // Add participants
      await global.db.execute(
        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
        [conversationId, ADMIN_ID]
      );
      if (senderId) {
        await global.db.execute(
          'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
          [conversationId, senderId]
        );
      }
    }

    // Insert initial message
    const [msgResult] = await global.db.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, senderId, message]
    );

    // Get user details for email notification
    let userData = null;
    if (senderId) {
      const [userDetails] = await global.db.execute(
        'SELECT CONCAT(first_name, " ", last_name) as name, email, phone FROM users WHERE id = ?',
        [senderId]
      );
      userData = userDetails.length > 0 ? userDetails[0] : null;
    }

    // Send email notification to admin for new conversation
    const messageData = {
      subject,
      message,
      conversationId
    };

    // Send email notification asynchronously (don't wait for it to complete)
    sendMessageNotification(messageData, userData).catch(error => {
      console.error('Failed to send message notification email:', error);
    });

    res.status(201).json({ success: true, conversationId, messageId: msgResult.insertId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// 2. Send message - POST /api/messages/:conversationId
router.post('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify user is participant
    const [participantCheck] = await global.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, senderId]
    );

    if (participantCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }

    const [result] = await global.db.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, senderId, content]
    );

    // Get user details for email notification
    const [userDetails] = await global.db.execute(
      'SELECT CONCAT(first_name, " ", last_name) as name, email, phone FROM users WHERE id = ?',
      [senderId]
    );

    // Get conversation details for email notification
    const [conversationDetails] = await global.db.execute(
      'SELECT subject FROM conversations WHERE id = ?',
      [conversationId]
    );

    // Send email notification to admin for new message in existing conversation
    const messageData = {
      subject: conversationDetails.length > 0 ? conversationDetails[0].subject : 'New Message',
      message: content,
      conversationId
    };

    const userData = userDetails.length > 0 ? userDetails[0] : null;

    // Send email notification asynchronously (don't wait for it to complete)
    sendMessageNotification(messageData, userData).catch(error => {
      console.error('Failed to send message notification email:', error);
    });

    res.status(201).json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 3. Fetch user's conversations - GET /api/messages/conversations/:userId
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await global.db.execute(
      `SELECT
        c.id,
        c.subject,
        c.created_at,
        COUNT(m.id) AS message_count,
        MAX(m.created_at) AS last_message_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_preview,
        (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_sender_id,
        (SELECT u2.first_name FROM messages m2 JOIN users u2 ON m2.sender_id = u2.id WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_sender_name,
        COUNT(CASE WHEN m.sender_id != ? AND m.is_read = 0 THEN 1 END) AS unread_count
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE cp.user_id = ?
       GROUP BY c.id
       ORDER BY last_message_at DESC, c.created_at DESC`,
      [userId, userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 4. Fetch conversation messages - GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.query.userId;

    // Verify user is participant
    const [participantCheck] = await global.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participantCheck.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }

    const [conversation] = await global.db.execute(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const [messages] = await global.db.execute(
      `SELECT m.*, u.first_name as sender_name, u.last_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Mark as read for this user
    if (userId) {
      await global.db.execute(
        `UPDATE messages
         SET is_read = 1
         WHERE conversation_id = ? AND sender_id != ? AND is_read = 0`,
        [conversationId, userId]
      );
    }

    res.json({ conversation: conversation[0], messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 5. Delete conversation - DELETE /api/messages/:conversationId
router.delete('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify authorization
    const [participantCheck] = await global.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participantCheck.length === 0 && userId !== ADMIN_ID) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await global.db.execute('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
    await global.db.execute('DELETE FROM conversation_participants WHERE conversation_id = ?', [conversationId]);
    await global.db.execute('DELETE FROM conversations WHERE id = ?', [conversationId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Admin: Get all conversations
router.get('/admin/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (userId !== ADMIN_ID) {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const [rows] = await global.db.execute(
      `SELECT
        c.id,
        c.subject,
        c.created_at,
        cp.user_id as customer_id,
        u.first_name as customer_name,
        u.email,
        COUNT(m.id) AS message_count,
        MAX(m.created_at) AS last_message_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_preview,
        (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_sender_id,
        (SELECT su2.first_name FROM messages m2 JOIN users su2 ON m2.sender_id = su2.id WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_sender_name
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE cp.user_id != ?
       GROUP BY c.id
       ORDER BY last_message_at DESC, c.created_at DESC`,
      [ADMIN_ID]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fetch admin conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch admin conversations' });
  }
});

// Close conversation - PATCH /api/messages/:conversationId/close
router.patch('/:conversationId/close', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify authorization
    const [participantCheck] = await global.db.execute(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (participantCheck.length === 0 && userId !== ADMIN_ID) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Add status to conversations if not exists, or update
    await global.db.execute(
      `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status ENUM('open', 'closed') DEFAULT 'open'`,
      []
    );

    await global.db.execute(
      'UPDATE conversations SET status = "closed" WHERE id = ?',
      [conversationId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({ error: 'Failed to close conversation' });
  }
});

module.exports = router;