function BlogPostCard({ post, user, onLike }) {
    try {
        const [userLikes, setUserLikes] = React.useState([]);
        const [isLiked, setIsLiked] = React.useState(false);

        React.useEffect(() => {
            if (user && user.id) {
                BlogService.getUserLikes(user.id).then(likes => {
                    setUserLikes(likes);
                    setIsLiked(likes.some(like => like.post_id === post.id));
                }).catch(error => {
                    console.error('Error fetching likes:', error);
                    setIsLiked(false);
                });
            } else {
                setUserLikes([]);
                setIsLiked(false);
            }
        }, [user, post.id]);

        const handleLike = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) return;
            
            try {
                const liked = await BlogService.toggleLike(user.id, post.id);
                setIsLiked(liked);
                if (onLike) onLike(post.id, liked);
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const getCategoryColor = (category) => {
            const colors = {
                'Car Reviews': 'bg-blue-500/20 text-blue-400',
                'Maintenance Tips': 'bg-green-500/20 text-green-400',
                'Buying Advice': 'bg-yellow-500/20 text-yellow-400',
                'General Discussion': 'bg-purple-500/20 text-purple-400',
                'Service Questions': 'bg-red-500/20 text-red-400'
            };
            return colors[category] || 'bg-gray-500/20 text-gray-400';
        };

        const getVideoThumbnail = (url) => {
            if (url.includes('youtube.com/watch?v=')) {
                const videoId = url.split('v=')[1]?.split('&')[0];
                return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
            }
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
            }
            return null;
        };

        return React.createElement('article', {
            className: 'glass-card p-6 hover:transform hover:translateY(-2px) transition-all duration-300 cursor-pointer',
            onClick: () => window.location.href = `blog-post.html?id=${post.id}`
        },
            // Header
            React.createElement('div', { className: 'flex items-start justify-between mb-4' },
                React.createElement('div', { className: 'flex items-center space-x-3' },
                    React.createElement('div', { className: 'w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center' },
                        React.createElement('span', { className: 'text-white font-semibold' },
                            post.author_name?.charAt(0) || 'A'
                        )
                    ),
                    React.createElement('div', null,
                        React.createElement('h4', { className: 'font-semibold text-[var(--text-primary)]' },
                            post.author_name || 'Anonymous'
                        ),
                        React.createElement('p', { className: 'text-sm text-[var(--text-secondary)]' },
                            formatDate(post.created_at || post.published_at)
                        )
                    )
                ),
                React.createElement('span', {
                    className: `px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`
                }, post.category)
            ),

            // Featured Image or Video Thumbnail
            post.featured_image ? React.createElement('img', {
                src: post.featured_image,
                alt: post.title,
                className: 'w-full h-48 object-cover rounded-lg mb-4'
            }) : post.video_url && React.createElement('div', { className: 'relative w-full h-48 rounded-lg mb-4 overflow-hidden' },
                React.createElement('img', {
                    src: getVideoThumbnail(post.video_url),
                    alt: post.title,
                    className: 'w-full h-full object-cover'
                }),
                React.createElement('div', { className: 'absolute inset-0 bg-black/30 flex items-center justify-center' },
                    React.createElement('div', { className: 'w-16 h-16 bg-white/90 rounded-full flex items-center justify-center' },
                        React.createElement('div', { className: 'w-0 h-0 border-l-[20px] border-l-red-600 border-y-[12px] border-y-transparent ml-1' })
                    )
                )
            ),

            // Content
            React.createElement('h2', { className: 'text-xl font-bold text-[var(--text-primary)] mb-3' },
                post.title
            ),
            React.createElement('p', { className: 'text-[var(--text-secondary)] mb-4 line-clamp-3' },
                post.content?.substring(0, 150) + '...'
            ),

            // Tags
            post.tags && React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
                post.tags.split(',').slice(0, 3).map((tag, index) =>
                    React.createElement('span', {
                        key: index,
                        className: 'px-2 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded text-xs'
                    }, `#${tag.trim()}`)
                )
            ),

            // Footer - Make the likes div clickable
            React.createElement('div', { className: 'flex items-center justify-between' },
                React.createElement('div', { className: 'flex items-center space-x-4' },
                    React.createElement('div', {
                        className: `flex items-center space-x-2 cursor-pointer ${isLiked ? 'text-red-400' : 'text-[var(--text-secondary)]'} hover:text-red-400 transition-colors`,
                        onClick: handleLike
                    },
                        React.createElement('div', { className: `icon-heart text-lg ${isLiked ? 'text-red-400' : ''}` }),
                        React.createElement('span', { className: 'text-sm' }, post.likes || 0)
                    ),
                    React.createElement('div', { className: 'flex items-center space-x-1 text-[var(--text-secondary)]' },
                        React.createElement('div', { className: 'icon-message-circle text-lg' }),
                        React.createElement('span', { className: 'text-sm' }, post.comments || 0)
                    )
                ),
                React.createElement('span', { className: 'text-[var(--primary-color)] text-sm font-medium' },
                    'Read More →'
                )
            )
        );
    } catch (error) {
        console.error('BlogPostCard component error:', error);
        return null;
    }
}