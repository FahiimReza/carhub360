function BlogPostView({ postId, user }) {
    try {
        const [post, setPost] = React.useState(null);
        const [comments, setComments] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [isLiked, setIsLiked] = React.useState(false);

        React.useEffect(() => {
            loadPost();
            loadComments();
        }, [postId]);

        const loadPost = async () => {
            try {
                const fetchedPost = await BlogService.getPost(postId);
                setPost(fetchedPost);
                
                // Check if user has liked this post
                if (user && user.id) {
                    BlogService.getUserLikes(user.id).then(likes => {
                        setIsLiked(likes.some(like => like.post_id === postId));
                    }).catch(error => {
                        console.error('Error checking like status:', error);
                        setIsLiked(false);
                    });
                } else {
                    setIsLiked(false);
                }
            } catch (error) {
                console.error('Error loading post:', error);
            }
        };

        const loadComments = async () => {
            try {
                const fetchedComments = await BlogService.getComments(postId);
                setComments(fetchedComments);
            } catch (error) {
                console.error('Error loading comments:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleLike = async () => {
            if (!user) return;
            
            try {
                const liked = await BlogService.toggleLike(user.id, post.id);
                setIsLiked(liked);
                setPost(prev => ({ ...prev, likes: (prev.likes || 0) + (liked ? 1 : -1) }));
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        };

        const handleDeletePost = async () => {
            if (!user || (!isAuthor() && !isAdmin())) return;
            
            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                try {
                    await BlogService.deletePost(postId);
                    alert('Post deleted successfully!');
                    window.location.href = 'blog.html';
                } catch (error) {
                    console.error('Error deleting post:', error);
                    // Extract more detailed error message if available
                    let errorMessage = 'Failed to delete post. Please try again.';
                    if (error.message) {
                        // Try to extract the JSON error message from the response
                        try {
                            const errorData = JSON.parse(error.message.split(' - ')[1] || '{}');
                            errorMessage = errorData.error || errorMessage;
                        } catch (parseError) {
                            // If parsing fails, use the original error message
                            errorMessage = error.message;
                        }
                    }
                    alert(errorMessage);
                }
            }
        };

        const isAuthor = () => {
            return user && post && (user.id === post.author_id);
        };
    
        const isAdmin = () => {
            return user && user.role === 'admin';
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getEmbedUrl = (url) => {
            // Convert YouTube URL to embed format
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1]?.split('&')[0];
                return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
            }
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
            }
            // For other video platforms, return as is
            return url;
        };

        if (loading || !post) {
            return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
                React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('div', { className: 'icon-loader-2 text-4xl text-[var(--primary-color)] animate-spin mx-auto mb-4' }),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Loading post...')
                )
            );
        }

        return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
            React.createElement('div', { className: 'max-w-4xl mx-auto' },
                // Back Button
                React.createElement('div', { className: 'mb-6' },
                    React.createElement('a', {
                        href: 'blog.html',
                        className: 'flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors'
                    },
                        React.createElement('div', { className: 'icon-arrow-left text-lg' }),
                        React.createElement('span', null, 'Back to Blog')
                    )
                ),

                // Post Content
                React.createElement('article', { className: 'glass-card p-8 mb-8' },
                    // Category Badge
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('span', { className: 'px-3 py-1 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-full text-sm font-medium' },
                            post.category || 'General'
                        )
                    ),

                    // Title
                    React.createElement('h1', { className: 'text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6' },
                        post.title
                    ),

                    // Author & Meta
                    React.createElement('div', { className: 'flex items-center justify-between mb-8 pb-6 border-b border-white/10' },
                        React.createElement('div', { className: 'flex items-center space-x-3' },
                            React.createElement('div', { className: 'w-12 h-12 rounded-full bg-[var(--primary-color)] flex items-center justify-center' },
                                React.createElement('span', { className: 'text-white font-semibold text-lg' },
                                    post.author_name?.charAt(0) || 'A'
                                )
                            ),
                            React.createElement('div', null,
                                React.createElement('h3', { className: 'font-semibold text-[var(--text-primary)]' },
                                    post.author_name || 'Anonymous'
                                ),
                                React.createElement('p', { className: 'text-sm text-[var(--text-secondary)]' },
                                    formatDate(post.created_at || post.published_at)
                                )
                            )
                        ),
                        React.createElement('div', { className: 'flex items-center space-x-4' },
                            React.createElement('div', {
                                className: `flex items-center space-x-2 cursor-pointer ${isLiked ? 'text-red-400' : 'text-[var(--text-secondary)]'} hover:text-red-400 transition-colors`,
                                onClick: handleLike
                            },
                                React.createElement('div', { className: `icon-heart text-xl ${isLiked ? 'text-red-400' : ''}` }),
                                React.createElement('span', null, post.likes || 0)
                            ),
                            (isAuthor() || isAdmin()) && React.createElement('button', {
                                className: 'flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors',
                                onClick: handleDeletePost,
                                title: 'Delete Post'
                            },
                                React.createElement('div', { className: 'icon-trash text-xl' })
                            )
                        )
                    ),

                    // Featured Image
                    post.featured_image && React.createElement('img', {
                        src: post.featured_image,
                        alt: post.title,
                        className: 'w-full h-64 md:h-96 object-cover rounded-lg mb-8'
                    }),

                    // Video Player
                    post.video_url && React.createElement('div', { className: 'mb-8' },
                        React.createElement('div', { className: 'relative w-full rounded-lg overflow-hidden bg-black' },
                            React.createElement('iframe', {
                                src: getEmbedUrl(post.video_url),
                                title: 'Video Player',
                                className: 'w-full aspect-video',
                                frameBorder: '0',
                                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                                allowFullScreen: true
                            })
                        )
                    ),

                    // Content
                    React.createElement('div', { className: 'prose prose-invert max-w-none' },
                        React.createElement('div', {
                            className: 'text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap text-lg',
                            dangerouslySetInnerHTML: { __html: post.content.replace(/\n/g, '<br>') }
                        })
                    ),

                    // Tags
                    post.tags && React.createElement('div', { className: 'flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10' },
                        post.tags.split(',').map((tag, index) =>
                            React.createElement('span', {
                                key: index,
                                className: 'px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full text-sm'
                            }, `#${tag.trim()}`)
                        )
                    )
                ),

                // Comments Section
                React.createElement(CommentSection, {
                    postId,
                    user,
                    comments,
                    onCommentAdded: loadComments
                })
            )
        );
    } catch (error) {
        console.error('BlogPostView component error:', error);
        return null;
    }
}