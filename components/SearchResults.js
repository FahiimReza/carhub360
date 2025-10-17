function SearchResults() {
  try {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchType, setSearchType] = React.useState('all');

    React.useEffect(() => {
      // Get search query from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      if (query) {
        setSearchQuery(query);
        performSearch(query);
      }
    }, []);

    const performSearch = async (query) => {
      if (!query || query.length < 1) return;
      
      setIsLoading(true);
      try {
        // Use SQL API endpoint
        const params = new URLSearchParams({ q: query, limit: 50 });
        const response = await fetch(`/api/cars?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch cars');
        const data = await response.json();
        
        const transformedCars = data.cars.map(car => ({
          id: car.id,
          name: `${car.brand_name} ${car.model_name}`,
          type: car.category_name,
          fuel: car.fuel_type,
          transmission: car.transmission,
          seating: car.seats,
          rentPrice: `৳${(car.rental_price_daily || 0).toLocaleString()}/day`,
          buyPrice: `৳${(car.selling_price / 1000000).toFixed(1)}M`,
          image: car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/300x200?text=No+Image',
          featured: false,
          keyFeatures: [],
          warranty: '1 Year',
          notes: car.description || '',
          availability_status: car.availability_status,
          year: car.year,
          engine_power: car.engine_power
        }));

        // Mock services for now, or fetch from API if available
        const services = [
          { name: 'Oil Change Service', category: 'Maintenance', price: '৳2,500' },
          { name: 'Brake Repair', category: 'Repair', price: '৳5,000' },
          { name: 'Engine Diagnostics', category: 'Diagnostics', price: '৳3,500' },
          { name: 'AC Service', category: 'Maintenance', price: '৳4,000' },
          { name: 'Car Wash', category: 'Cleaning', price: '৳800' }
        ];
        
        const matchingServices = services.filter(service =>
          service.name.toLowerCase().includes(query.toLowerCase()) ||
          service.category.toLowerCase().includes(query.toLowerCase())
        );

        const results = [
          ...transformedCars.map(car => ({ type: 'car', data: car })),
          ...matchingServices.map(service => ({ type: 'service', data: service }))
        ];

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsLoading(false);
    };

    const handleNewSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
        // Update URL without page reload
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchQuery.trim())}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    };

    const filteredResults = searchResults.filter(result => {
      if (searchType === 'all') return true;
      return result.type === searchType;
    });

    return (
      <div className="min-h-screen pt-20 pb-16" data-name="search-results" data-file="components/SearchResults.js">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="glass-card p-6 mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Search Results</h1>
            
            {/* Search Form */}
            <form onSubmit={handleNewSearch} className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search cars, services..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-white/20 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="icon-search text-[var(--text-secondary)]"></div>
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {['all', 'car', 'service'].map(type => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    searchType === type
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-white/10 text-[var(--text-secondary)] hover:bg-white/20'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'car' ? 'Cars' : 'Services'}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="icon-loader animate-spin text-4xl text-[var(--primary-color)] mb-4"></div>
              <p className="text-[var(--text-secondary)]">Searching...</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                  {searchQuery && ` for "${searchQuery}"`}
                </h2>
              </div>

              {filteredResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="icon-search text-6xl text-[var(--text-secondary)] mb-4"></div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No results found</h3>
                  <p className="text-[var(--text-secondary)]">Try different keywords or browse our categories</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((result, index) => (
                    <div key={index} className="glass-card p-6 hover:transform hover:scale-105 transition-all cursor-pointer"
                         onClick={() => {
                           if (result.type === 'car') {
                             window.location.href = `car-details.html?id=${result.data.id}`;
                           } else {
                             window.location.href = 'services.html';
                           }
                         }}>
                      {result.type === 'car' ? (
                        <div>
                          <ImageWithFallback
                            src={result.data.image}
                            alt={result.data.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            {result.data.name}
                          </h3>
                          <p className="text-[var(--text-secondary)] mb-2">{result.data.type}</p>
                          <p className="text-[var(--primary-color)] font-bold">
                            {result.data.rentPrice}/day
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-full h-48 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-lg mb-4 flex items-center justify-center">
                            <div className="icon-wrench text-6xl text-[var(--primary-color)]"></div>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            {result.data.name}
                          </h3>
                          <p className="text-[var(--text-secondary)] mb-2">{result.data.category}</p>
                          <p className="text-[var(--primary-color)] font-bold">{result.data.price}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('SearchResults component error:', error);
    return null;
  }
}