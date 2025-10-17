function BlogAdminPanel({ user }) {
    try {
        const [posts, setPosts] = React.useState([]);
        const [comments, setComments] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [activeTab, setActiveTab] = React.useState('posts');

        React.useEffect(() => {
            loadData();
        }, []);

        const loadData = async () => {
            try {
                setLoading(true);
                const [allPosts, allComments] = await Promise.all([
                    BlogService.getPosts(100, 'all'),
                    trickleListObjects('blog_comment', 100, true)
                ]);
                setPosts(allPosts);
                setComments(allComments.items);
            } catch (error) {
                console.error('Error loading admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleDeletePost = async (postId) => {
            if (!confirm('Are you sure you want to delete this post?')) return;
            
            try {
                await BlogService.deletePost(postId);
                setPosts(posts.filter(post => post.objectId !== postId));
            } catch (error) {
                alert('Failed to delete post: ' + error.message);
            }
        };

        const handleDeleteComment = async (commentId) => {
            if (!confirm('Are you sure you want to delete this comment?')) return;
            
            try {
                await BlogService.deleteComment(commentId);
                setComments(comments.filter(comment => comment.objectId !== commentId));
            } catch (error) {
                alert('Failed to delete comment: ' + error.message);
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        if (loading) {
            return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
                React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('div', { className: 'icon-loader-2 text-4xl text-[var(--primary-color)] animate-spin mx-auto mb-4' }),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Loading admin data...')
                )
            );
        }

        return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
            React.createElement('div', { className: 'mb-8' },
                React.createElement('h1', { className: 'text-4xl font-bold text-[var(--text-primary)] mb-2' }, 'Blog Administration'),
                React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Manage blog posts and comments')
            ),

            // Tabs
            React.createElement('div', { className: 'glass-card p-6 mb-8' },
                React.createElement('div', { className: 'flex space-x-4' },
                    React.createElement('button', {
                        className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'posts'
                                ? 'bg-[var(--primary-color)] text-white'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`,
                        onClick: () => setActiveTab('posts')
                    }, `Posts (${posts.length})`),
                    React.createElement('button', {
                        className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'comments'
                                ? 'bg-[var(--primary-color)] text-white'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`,
                        onClick: () => setActiveTab('comments')
                    }, `Comments (${comments.length})`)
                )
            ),

            // Posts Tab
            activeTab === 'posts' && React.createElement('div', { className: 'space-y-4' },
                posts.length === 0 ? (
                    React.createElement('div', { className: 'text-center py-12 glass-card' },
                        React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'No posts found')
                    )
                ) : (
                    posts.map(post =>
                        React.createElement('div', {
                            key: post.objectId,
                            className: 'glass-card p-6'
                        },
                            React.createElement('div', { className: 'flex justify-between items-start' },
                                React.createElement('div', { className: 'flex-1' },
                                    React.createElement('h3', { className: 'text-lg font-semibold text-[var(--text-primary)] mb-2' },
                                        post.objectData.title
                                    ),
                                    React.createElement('div', { className: 'flex items-center space-x-4 text-sm text-[var(--text-secondary)] mb-3' },
                                        React.createElement('span', null, `By ${post.objectData.author_name}`),
                                        React.createElement('span', null, formatDate(post.createdAt)),
                                        React.createElement('span', { className: 'px-2 py-1 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded' },
                                            post.objectData.category
                                        )
                                    ),
                                    React.createElement('p', { className: 'text-[var(--text-secondary)] mb-4' },
                                        post.objectData.content.substring(0, 150) + '...'
                                    )
                                ),
                                React.createElement('div', { className: 'flex space-x-2' },
                                    React.createElement('a', {
                                        href: `blog-post.html?id=${post.objectId}`,
                                        className: 'btn-primary text-sm'
                                    }, 'View'),
                                    React.createElement('button', {
                                        className: 'btn-danger',
                                        onClick: () => handleDeletePost(post.objectId)
                                    }, 'Delete')
                                )
                            )
                        )
                    )
                )
            ),

            // Comments Tab
            activeTab === 'comments' && React.createElement('div', { className: 'space-y-4' },
                comments.length === 0 ? (
                    React.createElement('div', { className: 'text-center py-12 glass-card' },
                        React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'No comments found')
                    )
                ) : (
                    comments.map(comment =>
                        React.createElement('div', {
                            key: comment.objectId,
                            className: 'glass-card p-6'
                        },
                            React.createElement('div', { className: 'flex justify-between items-start' },
                                React.createElement('div', { className: 'flex-1' },
                                    React.createElement('div', { className: 'flex items-center space-x-3 mb-3' },
                                        React.createElement('div', { className: 'w-8 h-8 rounded-full bg-[var(--secondary-color)] flex items-center justify-center' },
                                            React.createElement('span', { className: 'text-white text-sm font-semibold' },
                                                comment.objectData.author_name?.charAt(0) || 'A'
                                            )
                                        ),
                                        React.createElement('div', null,
                                            React.createElement('span', { className: 'font-medium text-[var(--text-primary)]' },
                                                comment.objectData.author_name
                                            ),
                                            React.createElement('span', { className: 'text-sm text-[var(--text-secondary)] ml-2' },
                                                formatDate(comment.createdAt)
                                            )
                                        )
                                    ),
                                    React.createElement('p', { className: 'text-[var(--text-primary)]' },
                                        comment.objectData.content
                                    )
                                ),
                                React.createElement('button', {
                                    className: 'btn-danger',
                                    onClick: () => handleDeleteComment(comment.objectId)
                                }, 'Delete')
                            )
                        )
                    )
                )
            )
        );
    } catch (error) {
        console.error('BlogAdminPanel component error:', error);
        return null;
    }
}