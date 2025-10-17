const express = require('express');
const jwt = require('jsonwebtoken');
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

// GET /api/blog/posts - Get all blog posts
router.get('/posts', async (req, res) => {
    try {
        const { limit = 10, offset = 0, category } = req.query;
        
        let query = `
            SELECT p.*, p.views_count as views, p.likes_count as likes, p.comments_count as comments,
                   CONCAT(u.first_name, ' ', u.last_name) as author_name, u.avatar as author_avatar,
                   bc.name as category
            FROM blog_posts p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_categories bc ON p.category_id = bc.id
            WHERE p.status = 'published'
        `;
        
        const params = [];
        
        if (category) {
            query += ` AND bc.name = ?`;
            params.push(category);
        }
        
        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [posts] = await global.db.execute(query, params);
        
        res.json({ posts });
    } catch (error) {
        console.error('Blog posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/blog/posts/:id - Get single blog post
router.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const postId = parseInt(id);
        
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        
        // Get post details
        const [posts] = await global.db.execute(`
            SELECT p.*, p.views_count as views, p.likes_count as likes, p.comments_count as comments,
                   CONCAT(u.first_name, ' ', u.last_name) as author_name, u.avatar as author_avatar,
                   bc.name as category,
                   GROUP_CONCAT(bt.name SEPARATOR ', ') as tags
            FROM blog_posts p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_categories bc ON p.category_id = bc.id
            LEFT JOIN blog_post_tags bpt ON p.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            WHERE p.id = ? AND p.status = 'published'
            GROUP BY p.id
        `, [postId]);
        
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Update views
        await global.db.execute(
            'UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [postId]
        );
        
        res.json({ post: posts[0] });
    } catch (error) {
        console.error('Blog post error:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// POST /api/blog/posts - Create blog post
router.post('/posts', authenticateToken, async (req, res) => {
    try {
        console.log('=== Blog Post Creation Started ===');
        console.log('Authenticated user ID:', req.user.userId);
        console.log('Received post data:', req.body);

        const authorIdInt = parseInt(req.user.userId);
        if (isNaN(authorIdInt)) {
            console.log('Validation failed: Invalid authenticated user ID');
            return res.status(400).json({ error: 'Invalid user authentication' });
        }

        const {
            title, content, excerpt = null, category,
            tags = [], featured_image = null, video_url = null, status = 'draft'
        } = req.body;

        if (!title || !content || title.trim().length === 0 || content.trim().length === 0) {
            console.log('Validation failed: Title or content missing');
            return res.status(400).json({ error: 'Title and content are required' });
        }

        console.log('Checking author ID:', authorIdInt);
        const [userRows] = await global.db.execute('SELECT id FROM users WHERE id = ?', [authorIdInt]);
        console.log('User check result:', userRows.length > 0 ? 'User found' : 'User not found');
        if (userRows.length === 0) {
            return res.status(400).json({ error: 'Authenticated user not found in database' });
        }
        
        // Generate slug from title
        const slug = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        console.log('Generated slug:', slug);
        
        // Map category string to category_id
        let categoryId = null;
        if (category && category.trim()) {
            const [catResult] = await global.db.execute(
                'SELECT id FROM blog_categories WHERE name = ?',
                [category.trim()]
            );
            if (catResult.length > 0) {
                categoryId = catResult[0].id;
            } else {
                // Create category if not exists
                const [newCat] = await global.db.execute(
                    'INSERT INTO blog_categories (name, slug, description) VALUES (?, ?, ?)',
                    [category.trim(), category.trim().toLowerCase().replace(/\s+/g, '-'), `Category: ${category.trim()}`]
                );
                categoryId = newCat.insertId;
            }
        }

        if (!categoryId) {
            return res.status(400).json({ error: 'Invalid or missing category' });
        }
        
        // Parse tags if string
        let tagsArray = [];
        console.log('Processing tags:', tags);
        if (typeof tags === 'string') {
            tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (Array.isArray(tags)) {
            tagsArray = tags;
        }
        console.log('Parsed tags array:', tagsArray);
        
        // Insert post without tags
        const publishedAt = status === 'published' ? 'NOW()' : 'NULL';
        const insertParams = [
            title.trim(),
            slug,
            content.trim(),
            excerpt ? excerpt.trim() : null,
            authorIdInt,
            categoryId,
            featured_image ? featured_image.trim() : null,
            video_url ? video_url.trim() : null,
            status
        ];
        console.log('Insert params:', insertParams);
        console.log('Executing INSERT query with publishedAt:', publishedAt);
        const [result] = await global.db.execute(`
            INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category_id,
                                  featured_image, video_url, status, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${publishedAt})
        `, insertParams);
        console.log('Insert result:', result);
        
        const postId = result.insertId;
        console.log('Post created with ID:', postId);
        
        // Insert tags into junction table if any
        if (tagsArray.length > 0) {
            for (const tagName of tagsArray) {
                // Get or create tag
                let [tagResult] = await global.db.execute(
                    'SELECT id FROM blog_tags WHERE name = ?',
                    [tagName]
                );
                let tagId;
                if (tagResult.length === 0) {
                    const [newTag] = await global.db.execute(
                        'INSERT INTO blog_tags (name, slug) VALUES (?, ?)',
                        [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]
                    );
                    tagId = newTag.insertId;
                } else {
                    tagId = tagResult[0].id;
                }
                
                // Insert junction
                await global.db.execute(
                    'INSERT IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)',
                    [postId, tagId]
                );
            }
        }
        
        res.json({
            message: 'Blog post created successfully',
            postId: postId
        });
        console.log('=== Blog Post Creation Completed Successfully ===');
    } catch (error) {
        console.error('Blog creation error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to create post: ' + error.message });
    }
});

// GET /api/blog/posts/:id/comments - Get post comments
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [comments] = await global.db.execute(`
            SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.avatar as user_avatar
            FROM blog_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.status = 'approved'
            ORDER BY c.created_at ASC
        `, [id]);
        
        res.json({ comments });
    } catch (error) {
        console.error('Comments error:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// POST /api/blog/posts/:id/comments - Add comment
router.post('/posts/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const postId = parseInt(id);
        const { user_id, content, parent_id = null } = req.body;
        const userId = user_id ? parseInt(user_id) : null;
        
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        
        if (userId && isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        
        // Check if post exists
        const [postCheck] = await global.db.execute(
            'SELECT id FROM blog_posts WHERE id = ?',
            [postId]
        );
        
        if (postCheck.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Check if user exists if user_id provided
        if (userId) {
            const [userCheck] = await global.db.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );
            
            if (userCheck.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
        }
        
        const [result] = await global.db.execute(`
            INSERT INTO blog_comments (post_id, user_id, content, parent_id, status)
            VALUES (?, ?, ?, ?, 'approved')
        `, [postId, userId, content.trim(), parent_id]);
        
        // Update post comments count
        await global.db.execute(
            'UPDATE blog_posts SET comments_count = comments_count + 1 WHERE id = ?',
            [postId]
        );
        
        res.json({
            message: 'Comment added successfully',
            commentId: result.insertId
        });
    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ error: 'Failed to add comment: ' + error.message });
    }
});

router.get('/users/:userId/likes', async (req, res) => {
    try {
        console.log('GET /api/blog/users/likes route hit for userId:', req.params.userId);
        const { userId } = req.params;
        
        if (!userId) {
            return res.json({ likes: [] });
        }
        
        const user_id = parseInt(userId);
        if (isNaN(user_id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const [likes] = await global.db.execute(`
            SELECT bpl.*, bp.title as post_title
            FROM blog_post_likes bpl
            JOIN blog_posts bp ON bpl.post_id = bp.id
            WHERE bpl.user_id = ?
        `, [user_id]);
        
        res.json({ likes });
    } catch (error) {
        console.error('User likes error:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
});

router.post('/likes', async (req, res) => {
    try {
        const { user_id, post_id } = req.body;
        const userId = parseInt(user_id);
        const postId = parseInt(post_id);
        
        if (isNaN(userId) || isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid user or post ID' });
        }
        
        // Check if like exists
        const [existing] = await global.db.execute(
            'SELECT id FROM blog_post_likes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        
        let liked;
        if (existing.length > 0) {
            // Remove like
            await global.db.execute(
                'DELETE FROM blog_post_likes WHERE user_id = ? AND post_id = ?',
                [userId, postId]
            );
            await global.db.execute(
                'UPDATE blog_posts SET likes_count = likes_count - 1 WHERE id = ?',
                [postId]
            );
            liked = false;
        } else {
            // Add like
            await global.db.execute(
                'INSERT INTO blog_post_likes (user_id, post_id) VALUES (?, ?)',
                [userId, postId]
            );
            await global.db.execute(
                'UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = ?',
                [postId]
            );
            liked = true;
        }
        
        res.json({ liked });
    } catch (error) {
        console.error('Like toggle error:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

router.delete('/comments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const commentId = parseInt(id);
        
        if (isNaN(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        
        // Get post_id before deletion
        const [commentInfo] = await global.db.execute(
            'SELECT post_id FROM blog_comments WHERE id = ?',
            [commentId]
        );
        
        if (commentInfo.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        const postId = parseInt(commentInfo[0].post_id);
        
        // Delete comment
        const [result] = await global.db.execute(
            'DELETE FROM blog_comments WHERE id = ?',
            [commentId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // Update post comments count
        await global.db.execute(
            'UPDATE blog_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = ?',
            [postId]
        );
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

router.delete('/posts/:id', authenticateToken, async (req, res) => {
    console.log('DELETE /api/blog/posts/:id route hit');
    console.log('Post ID:', req.params.id);
    console.log('User from token:', JSON.stringify(req.user, null, 2));
    
    try {
        const { id } = req.params;
        const postId = parseInt(id);
        
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        // Get post information including author
        const [postInfo] = await global.db.execute(
            'SELECT id, author_id FROM blog_posts WHERE id = ?',
            [postId]
        );
        
        if (postInfo.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is admin or post author
        const isAdmin = req.user.role === 'admin' || req.user.role === 'administrator';
        const isAuthor = parseInt(req.user.userId) === postInfo[0].author_id;

        console.log('Permission check - Admin:', isAdmin, 'Author:', isAuthor, 'User ID:', req.user.userId, 'Post Author ID:', postInfo[0].author_id);

        if (!isAdmin && !isAuthor) {
            console.log('Permission check failed. User role:', req.user.role);
            return res.status(403).json({ error: 'Admin access or author permission required to delete posts' });
        }

        // Delete related comments
        await global.db.execute('DELETE FROM blog_comments WHERE post_id = ?', [postId]);

        // Delete related likes
        await global.db.execute('DELETE FROM blog_post_likes WHERE post_id = ?', [postId]);

        // Delete post-tag associations
        await global.db.execute('DELETE FROM blog_post_tags WHERE post_id = ?', [postId]);

        // Delete the post itself
        await global.db.execute('DELETE FROM blog_posts WHERE id = ?', [postId]);

        console.log('Post deleted successfully:', postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to delete post: ' + error.message });
    }
});

module.exports = router;
