function BlogFeed({ user }) {
    try {
        const [posts, setPosts] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [filters, setFilters] = React.useState({
            category: '',
            sort: 'newest',
            search: ''
        });

        React.useEffect(() => {
            loadPosts();
        }, []);

        const loadPosts = async () => {
            try {
                setLoading(true);
                const fetchedPosts = await BlogService.getPosts(50, 0);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error loading posts:', error);
            } finally {
                setLoading(false);
            }
        };

        const filteredPosts = React.useMemo(() => {
            if (!posts || posts.length === 0) return [];

            // Filter out undefined/null posts first
            let filtered = posts.filter(post => post !== undefined && post !== null && post !== null);

            // Category filter
            if (filters.category) {
                filtered = filtered.filter(post => (post?.category || 'General') === filters.category);
            }

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(post =>
                    post?.title?.toLowerCase().includes(searchTerm) ||
                    post?.excerpt?.toLowerCase().includes(searchTerm) ||
                    post?.content?.toLowerCase().includes(searchTerm)
                );
            }

            // Sort
            switch (filters.sort) {
                case 'oldest':
                    filtered.sort((a, b) => new Date(a?.created_at || 0) - new Date(b?.created_at || 0));
                    break;
                case 'most_liked':
                    filtered.sort((a, b) => (b?.likes || 0) - (a?.likes || 0));
                    break;
                default: // newest
                    filtered.sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));
            }

            return filtered;
        }, [posts, filters]);

        const handleLike = async (postId, liked) => {
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            likes: (post.likes || 0) + (liked ? 1 : -1)
                        }
                        : post
                )
            );
        };

        if (loading) {
            return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
                React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('div', { className: 'icon-loader-2 text-4xl text-[var(--primary-color)] animate-spin mx-auto mb-4' }),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Loading posts...')
                )
            );
        }

        return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
            // Header
            React.createElement('div', { className: 'flex flex-col md:flex-row justify-between items-start md:items-center mb-8' },
                React.createElement('div', null,
                    React.createElement('h1', { className: 'text-4xl font-bold text-[var(--text-primary)] mb-2' }, 'Community Blog'),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Share experiences, get advice, and connect with fellow car enthusiasts')
                ),
                user && React.createElement('a', {
                    href: 'blog-create.html',
                    className: 'btn-primary flex items-center space-x-2 mt-4 md:mt-0'
                },
                    React.createElement('div', { className: 'icon-plus text-lg' }),
                    React.createElement('span', null, 'Create Post')
                )
            ),

            // Filters
            React.createElement(BlogFilters, {
                onFilterChange: setFilters,
                activeFilters: filters
            }),

            // Posts Grid
            filteredPosts.length === 0 ? (
                React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('div', { className: 'icon-message-square text-6xl text-[var(--text-secondary)] mb-4' }),
                    React.createElement('h3', { className: 'text-xl font-semibold text-[var(--text-primary)] mb-2' }, 'No posts found'),
                    React.createElement('p', { className: 'text-[var(--text-secondary)] mb-6' }, 'Be the first to share your automotive experience!'),
                    user && React.createElement('a', {
                        href: 'blog-create.html',
                        className: 'btn-primary'
                    }, 'Create First Post')
                )
            ) : (
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                    filteredPosts.map(post =>
                        React.createElement(BlogPostCard, {
                            key: post.id,
                            post,
                            user,
                            onLike: handleLike
                        })
                    )
                )
            )
        );
    } catch (error) {
        console.error('BlogFeed component error:', error);
        return null;
    }
}