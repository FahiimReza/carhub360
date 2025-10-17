function SearchBar({ onSearch, placeholder = "Search cars, services..." }) {
  try {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);

    React.useEffect(() => {
      if (searchQuery.length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, [searchQuery]);

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Search cars using SQL API endpoint
        const params = new URLSearchParams({ q: searchQuery, limit: 5 });
        const response = await fetch(`/api/cars?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch cars');
        const data = await response.json();
        
        const matchingCars = data.cars;

        // Mock services search (you can extend this)
        const services = [
          'Oil Change Service',
          'Brake Repair',
          'Engine Diagnostics',
          'AC Service',
          'Car Wash'
        ];
        const matchingServices = services.filter(service =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults([
          ...matchingCars.map(car => ({ type: 'car', data: car })),
          ...matchingServices.map(service => ({ type: 'service', data: { name: service } }))
        ]);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsSearching(false);
    };

    const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Navigate to search results page
        window.location.href = `search-results.html?q=${encodeURIComponent(searchQuery.trim())}`;
      }
      setShowResults(false);
    };

    return (
      <div className="relative w-full max-w-md" data-name="search-bar" data-file="components/SearchBar.js">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:bg-white/20 focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="icon-loader animate-spin text-[var(--primary-color)]"></div>
            ) : (
              <div className="icon-search text-[var(--text-secondary)]"></div>
            )}
          </div>
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--primary-color)] text-white p-2 rounded-full hover:scale-110 transition-transform"
          >
            <div className="icon-arrow-right text-sm"></div>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-b-0"
                onClick={() => {
                  setShowResults(false);
                  if (result.type === 'car') {
                    window.location.href = `car-details.html?id=${result.data.id}`;
                  } else {
                    window.location.href = 'services.html';
                  }
                }}
              >
                <div className="flex items-center">
                  <div className={`icon-${result.type === 'car' ? 'car' : 'wrench'} text-[var(--primary-color)] mr-3`}></div>
                  <div>
                    <div className="text-[var(--text-primary)] font-semibold">
                      {result.type === 'car' ? `${result.data.brand_name} ${result.data.model_name}` : result.data.name}
                    </div>
                    {result.type === 'car' && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        {result.data.category_name} • ৳{result.data.rental_price_daily}/day
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('SearchBar component error:', error);
    return null;
  }
}