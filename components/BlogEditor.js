function BlogEditor({ user }) {
    try {
        const [formData, setFormData] = React.useState({
            title: '',
            content: '',
            category: 'General Discussion',
            tags: '',
            featured_image: '',
            video_url: ''
        });
        const [loading, setLoading] = React.useState(false);
        const [success, setSuccess] = React.useState(false);

        const categories = ['Car Reviews', 'Maintenance Tips', 'Buying Advice', 'General Discussion', 'Service Questions'];

        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!user) return;

            if (!formData.title.trim() || !formData.content.trim()) {
                alert('Please fill in title and content');
                return;
            }

            try {
                setLoading(true);
                await BlogService.createPost({
                    ...formData,
                    status: 'published'
                });
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = 'blog.html';
                }, 2000);
            } catch (error) {
                console.error('Error creating post:', error);
                alert('Failed to create post: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (success) {
            return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
                React.createElement('div', { className: 'max-w-2xl mx-auto text-center' },
                    React.createElement('div', { className: 'glass-card p-8' },
                        React.createElement('div', { className: 'icon-check-circle text-6xl text-green-400 mb-4' }),
                        React.createElement('h2', { className: 'text-2xl font-bold text-[var(--text-primary)] mb-2' }, 'Post Created Successfully!'),
                        React.createElement('p', { className: 'text-[var(--text-secondary)] mb-6' }, 'Your post has been published and is now visible to the community.'),
                        React.createElement('a', { href: 'blog.html', className: 'btn-primary' }, 'View All Posts')
                    )
                )
            );
        }

        return React.createElement('div', { className: 'container mx-auto px-4 py-8' },
            React.createElement('div', { className: 'max-w-4xl mx-auto' },
                // Header
                React.createElement('div', { className: 'mb-8' },
                    React.createElement('h1', { className: 'text-4xl font-bold text-[var(--text-primary)] mb-2' }, 'Create New Post'),
                    React.createElement('p', { className: 'text-[var(--text-secondary)]' }, 'Share your automotive experience with the community')
                ),

                // Form
                React.createElement('form', { onSubmit: handleSubmit, className: 'glass-card p-8' },
                    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6' },
                        // Title
                        React.createElement('div', { className: 'lg:col-span-2' },
                            React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Post Title *'),
                            React.createElement('input', {
                                type: 'text',
                                name: 'title',
                                value: formData.title,
                                onChange: handleChange,
                                placeholder: 'Enter an engaging title for your post',
                                className: 'input-field',
                                required: true
                            })
                        ),

                        // Category
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Category'),
                            React.createElement('select', {
                                name: 'category',
                                value: formData.category,
                                onChange: handleChange,
                                className: 'input-field'
                            },
                                categories.map(cat =>
                                    React.createElement('option', { key: cat, value: cat }, cat)
                                )
                            )
                        ),

                        // Tags
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Tags'),
                            React.createElement('input', {
                                type: 'text',
                                name: 'tags',
                                value: formData.tags,
                                onChange: handleChange,
                                placeholder: 'honda, sedan, maintenance (comma separated)',
                                className: 'input-field'
                            })
                        ),

                        // Featured Image
                        React.createElement('div', { className: 'lg:col-span-2' },
                            React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Featured Image URL'),
                            React.createElement('input', {
                                type: 'url',
                                name: 'featured_image',
                                value: formData.featured_image,
                                onChange: handleChange,
                                placeholder: 'https://example.com/image.jpg',
                                className: 'input-field'
                            })
                        ),

                        // Video URL
                        React.createElement('div', { className: 'lg:col-span-2' },
                            React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Video URL (Optional)'),
                            React.createElement('input', {
                                type: 'url',
                                name: 'video_url',
                                value: formData.video_url,
                                onChange: handleChange,
                                placeholder: 'https://www.youtube.com/watch?v=example or https://youtu.be/example',
                                className: 'input-field'
                            })
                        )
                    ),

                    // Content
                    React.createElement('div', { className: 'mb-8' },
                        React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Content *'),
                        React.createElement('textarea', {
                            name: 'content',
                            value: formData.content,
                            onChange: handleChange,
                            placeholder: 'Write your post content here...',
                            rows: 12,
                            className: 'input-field resize-none',
                            required: true
                        })
                    ),

                    // Actions
                    React.createElement('div', { className: 'flex justify-between items-center' },
                        React.createElement('a', {
                            href: 'blog.html',
                            className: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
                        }, '← Back to Blog'),
                        React.createElement('button', {
                            type: 'submit',
                            disabled: loading,
                            className: 'btn-primary flex items-center space-x-2'
                        },
                            loading && React.createElement('div', { className: 'icon-loader-2 text-lg animate-spin' }),
                            React.createElement('span', null, loading ? 'Publishing...' : 'Publish Post')
                        )
                    )
                )
            )
        );
    } catch (error) {
        console.error('BlogEditor component error:', error);
        return null;
    }
}