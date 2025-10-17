const BlogService = {
    // API Base URL
    API_BASE: '/api/blog',

    // Blog Posts
    async createPost(postData) {
        try {
            const currentUser = window.getCurrentUser();
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch(`${this.API_BASE}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            return { id: result.postId, ...postData, author_name: currentUser?.name || 'Anonymous' };
        } catch (error) {
            throw new Error('Failed to create post: ' + error.message);
        }
    },

    async getPosts(limit = 20, offset = 0, category = '') {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });
            if (category) {
                params.append('category', category);
            }

            const response = await fetch(`${this.API_BASE}/posts?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Return flat structure matching API response
            return result.posts.map(post => ({
                ...post,
                likes: post.likes || post.likes_count || 0,
                comments: post.comments || post.comments_count || 0,
                views: post.views || post.views_count || 0,
                author_name: post.author_name || 'Anonymous',
            }));
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    },

    async getPost(postId) {
        try {
            const response = await fetch(`${this.API_BASE}/posts/${postId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Post not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Return flat structure matching API response
            const post = result.post;
            return {
                ...post,
                likes: post.likes || post.likes_count || 0,
                comments: post.comments || post.comments_count || 0,
                views: post.views || post.views_count || 0,
                author_name: post.author_name || 'Anonymous',
            };
        } catch (error) {
            throw new Error('Post not found');
        }
    },

    async updatePostStatus(postId, status) {
        try {
            const post = await this.getPost(postId);
            const response = await fetch(`${this.API_BASE}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return post;
        } catch (error) {
            throw new Error('Failed to update post status');
        }
    },

    async deletePost(postId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch(`${this.API_BASE}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            throw new Error('Failed to delete post: ' + error.message);
        }
    },

    // Comments
    async addComment(commentData) {
        try {
            const currentUser = window.getCurrentUser();
            const response = await fetch(`${this.API_BASE}/posts/${commentData.post_id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...commentData,
                    user_id: currentUser ? currentUser.id : null,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown server error'}`);
            }

            const result = await response.json();
            if (result.message === 'Comment added successfully') {
                return true;
            } else {
                throw new Error(result.error || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('BlogService addComment error:', error);
            throw error;
        }
    },

    async getComments(postId) {
        try {
            const response = await fetch(`${this.API_BASE}/posts/${postId}/comments`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Return flat structure matching API response
            return result.comments.map(comment => ({
                ...comment,
                author_name: comment.user_name || 'Anonymous',
                likes: comment.likes || 0,
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    async deleteComment(commentId) {
        try {
            // Note: Backend might need a DELETE endpoint for comments
            // For now, assuming a general DELETE /comments/:id
            const response = await fetch(`${this.API_BASE}/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            throw new Error('Failed to delete comment');
        }
    },

    // Likes - This would need backend support for likes
    async toggleLike(userId, postId) {
        try {
            const response = await fetch(`${this.API_BASE}/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    post_id: postId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to toggle like'}`);
            }

            const result = await response.json();
            return result.liked; // Backend returns { liked: true/false }
        } catch (error) {
            console.error('Toggle like error:', error);
            throw new Error('Failed to toggle like');
        }
    },

    async getUserLikes(userId) {
        if (!userId) {
            console.log('No user ID provided for likes, returning empty array');
            return [];
        }
        try {
            const response = await fetch(`${this.API_BASE}/users/${userId}/likes`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Transform likes to match expected format (flat post_id)
            return (result.likes || []).map(like => ({
                ...like,
                post_id: like.post_id || like.objectData?.post_id,
            }));
        } catch (error) {
            console.error('Error fetching user likes:', error);
            return [];
        }
    }
};