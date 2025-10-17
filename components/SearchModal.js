function SearchModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    // Listen for custom event to open search
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener('openSearch', handleOpenSearch);
    
    return () => {
      window.removeEventListener('openSearch', handleOpenSearch);
    };
  }, []);

  React.useEffect(() => {
    // Close modal on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Simulate API call to search cars
      // In a real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock search results - replace with actual API call
      const mockResults = [
        { id: 1, name: 'Tesla Model 3', type: 'Sedan', price: '$39,990', image: 'https://via.placeholder.com/100x60?text=Tesla' },
        { id: 2, name: 'BMW X5', type: 'SUV', price: '$59,400', image: 'https://via.placeholder.com/100x60?text=BMW' },
        { id: 3, name: 'Mercedes C-Class', type: 'Sedan', price: '$43,200', image: 'https://via.placeholder.com/100x60?text=Mercedes' },
        { id: 4, name: 'Audi Q7', type: 'SUV', price: '$54,500', image: 'https://via.placeholder.com/100x60?text=Audi' },
        { id: 5, name: 'Porsche 911', type: 'Sports', price: '$103,400', image: 'https://via.placeholder.com/100x60?text=Porsche' }
      ].filter(car => 
        car.name.toLowerCase().includes(query.toLowerCase()) || 
        car.type.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (carId) => {
    // Navigate to car details page
    window.location.href = `car-details.html?id=${carId}`;
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay active" onClick={() => setIsOpen(false)}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Search Vehicles</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            className="search-input"
            placeholder="Search by make, model, or type..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {searchQuery.trim().length >= 2 && (
          <div className="mt-4">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {searchResults.length} results found
                </h3>
                {searchResults.map(car => (
                  <div 
                    key={car.id}
                    className="flex items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(car.id)}
                  >
                    <img src={car.image} alt={car.name} className="w-16 h-10 object-cover rounded mr-3" />
                    <div className="flex-1">
                      <h4 className="text-[var(--text-primary)] font-medium">{car.name}</h4>
                      <p className="text-[var(--text-secondary)] text-sm">{car.type} • {car.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isSearching ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[var(--text-secondary)]">No vehicles found matching "{searchQuery}"</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">Try searching with different keywords</p>
              </div>
            ) : null}
          </div>
        )}
        
        {searchQuery.trim().length < 2 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Tesla', 'BMW', 'SUV', 'Sports Car', 'Electric'].map(term => (
                <button
                  key={term}
                  className="px-3 py-1 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--primary-color)] rounded-full text-sm transition-all"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}