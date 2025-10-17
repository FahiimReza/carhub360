function CommentSection({ postId, user, comments, onCommentAdded }) {
    try {
        const [newComment, setNewComment] = React.useState('');
        const [loading, setLoading] = React.useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!user || !newComment.trim()) return;

            try {
                setLoading(true);
                await BlogService.addComment({
                    post_id: postId,
                    user_id: user.id,
                    content: newComment.trim(),
                    parent_id: null
                });
                setNewComment('');
                onCommentAdded();
            } catch (error) {
                console.error('Error adding comment:', error);
                // Database likely updated even if response parsing failed, so reload comments
                onCommentAdded();
                if (!error.message.includes('HTTP 200') && !error.message.includes('Unexpected response')) {
                    alert('Failed to add comment: ' + error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        const handleDeleteComment = async (commentId) => {
            if (confirm('Are you sure you want to delete this comment?')) {
                try {
                    await BlogService.deleteComment(commentId);
                    onCommentAdded(); // Reload comments
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    alert('Failed to delete comment. Please try again.');
                }
            }
        };

        const canDeleteComment = (comment) => {
            if (!user) return false;
            return user.role === 'admin' || user.id === comment.user_id;
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return React.createElement('div', { className: 'glass-card p-8' },
            React.createElement('h2', { className: 'text-2xl font-bold text-[var(--text-primary)] mb-6' },
                `Comments (${comments.length})`
            ),

            // Add Comment Form (for logged in users)
            user ? (
                React.createElement('form', { onSubmit: handleSubmit, className: 'mb-8' },
                    React.createElement('div', { className: 'flex items-start space-x-4' },
                        React.createElement('div', { className: 'w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center flex-shrink-0' },
                            React.createElement('span', { className: 'text-white font-semibold' },
                                (user.name || user.email || 'User')?.charAt(0).toUpperCase()
                            )
                        ),
                        React.createElement('div', { className: 'flex-1' },
                            React.createElement('textarea', {
                                value: newComment,
                                onChange: (e) => setNewComment(e.target.value),
                                placeholder: 'Share your thoughts...',
                                rows: 3,
                                className: 'w-full p-4 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none resize-none'
                            }),
                            React.createElement('div', { className: 'flex justify-end mt-3' },
                                React.createElement('button', {
                                    type: 'submit',
                                    disabled: loading || !newComment.trim(),
                                    className: 'btn-primary flex items-center space-x-2 disabled:opacity-50'
                                },
                                    loading && React.createElement('div', { className: 'icon-loader-2 text-lg animate-spin' }),
                                    React.createElement('span', null, loading ? 'Posting...' : 'Post Comment')
                                )
                            )
                        )
                    )
                )
            ) : (
                React.createElement('div', { className: 'text-center py-6 mb-8 border border-white/10 rounded-lg' },
                    React.createElement('p', { className: 'text-[var(--text-secondary)] mb-4' }, 'Please login to join the discussion'),
                    React.createElement('a', { href: 'login.html', className: 'btn-primary' }, 'Login to Comment')
                )
            ),

            // Comments List
            comments.length === 0 ? (
                React.createElement('div', { className: 'text-center py-8' },
                    React.createElement('div', { className: 'icon-message-square text-4xl text-[var(--text-secondary)] mb-3' }),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'No comments yet. Be the first to share your thoughts!')
                )
            ) : (
                React.createElement('div', { className: 'space-y-6' },
                    comments.map(comment =>
                        React.createElement('div', {
                            key: comment.id,
                            className: 'flex items-start space-x-4 p-4 rounded-lg bg-white/5'
                        },
                            React.createElement('div', { className: 'w-10 h-10 rounded-full bg-[var(--secondary-color)] flex items-center justify-center flex-shrink-0' },
                                React.createElement('span', { className: 'text-white font-semibold' },
                                    comment.author_name?.charAt(0) || 'A'
                                )
                            ),
                            React.createElement('div', { className: 'flex-1' },
                                React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                                    React.createElement('div', { className: 'flex items-center space-x-2' },
                                        React.createElement('h4', { className: 'font-semibold text-[var(--text-primary)]' },
                                            comment.author_name || 'Anonymous'
                                        ),
                                        React.createElement('span', { className: 'text-sm text-[var(--text-secondary)]' },
                                            formatDate(comment.created_at)
                                        )
                                    ),
                                    canDeleteComment(comment) && React.createElement('button', {
                                        onClick: () => handleDeleteComment(comment.id),
                                        className: 'text-red-500 hover:text-red-400 transition-colors',
                                        title: 'Delete Comment'
                                    },
                                        React.createElement('div', { className: 'icon-trash text-sm' })
                                    )
                                ),
                                React.createElement('p', { className: 'text-[var(--text-primary)] leading-relaxed' },
                                    comment.content
                                )
                            )
                        )
                    )
                )
            )
        );
    } catch (error) {
        console.error('CommentSection component error:', error);
        return null;
    }
}