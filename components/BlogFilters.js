function BlogFilters({ onFilterChange, activeFilters }) {
    try {
        const categories = ['All', 'Car Reviews', 'Maintenance Tips', 'Buying Advice', 'General Discussion', 'Service Questions'];
        const sortOptions = [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'most_liked', label: 'Most Liked' }
        ];

        const handleCategoryChange = (category) => {
            onFilterChange({ ...activeFilters, category: category === 'All' ? '' : category });
        };

        const handleSortChange = (e) => {
            onFilterChange({ ...activeFilters, sort: e.target.value });
        };

        const handleSearchChange = (e) => {
            onFilterChange({ ...activeFilters, search: e.target.value });
        };

        return React.createElement('div', { className: 'glass-card p-6 mb-8' },
            React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
                // Search
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Search Posts'),
                    React.createElement('div', { className: 'relative' },
                        React.createElement('div', { className: 'icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]' }),
                        React.createElement('input', {
                            type: 'text',
                            placeholder: 'Search by title or content...',
                            className: 'w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none',
                            value: activeFilters.search || '',
                            onChange: handleSearchChange
                        })
                    )
                ),

                // Category Filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Category'),
                    React.createElement('div', { className: 'flex flex-wrap gap-2' },
                        categories.map(category =>
                            React.createElement('button', {
                                key: category,
                                className: `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    (activeFilters.category === category || (category === 'All' && !activeFilters.category))
                                        ? 'bg-[var(--primary-color)] text-white'
                                        : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                }`,
                                onClick: () => handleCategoryChange(category)
                            }, category)
                        )
                    )
                ),

                // Sort Options
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-[var(--text-primary)] mb-2' }, 'Sort By'),
                    React.createElement('select', {
                        className: 'w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none',
                        value: activeFilters.sort || 'newest',
                        onChange: handleSortChange
                    },
                        sortOptions.map(option =>
                            React.createElement('option', { key: option.value, value: option.value }, option.label)
                        )
                    )
                )
            )
        );
    } catch (error) {
        console.error('BlogFilters component error:', error);
        return null;
    }
}