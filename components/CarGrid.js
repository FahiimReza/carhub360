function CarGrid({ activeTab, filters, setFilters }) {
  try {
    const [cars, setCars] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalCars, setTotalCars] = React.useState(0);
    const carsPerPage = 12;

    React.useEffect(() => {
      loadCars();
      
      // Add event listener for car updates
      const handleCarUpdate = () => {
        loadCars();
      };
      
      window.addEventListener('carDataUpdated', handleCarUpdate);
      
      return () => {
        window.removeEventListener('carDataUpdated', handleCarUpdate);
      };
    }, [filters]); // Re-load when filters change for server-side filtering

    React.useEffect(() => {
      setCurrentPage(1); // Reset to first page when filters change
    }, [filters]);

    const loadCars = async () => {
      try {
        // Build query params for server-side filtering
        const params = new URLSearchParams();
        if (filters.type !== 'all') params.append('category', filters.type.toLowerCase());
        if (filters.fuel !== 'all') params.append('fuel_type', filters.fuel.toLowerCase());
        if (filters.transmission !== 'all') params.append('transmission', filters.transmission.toLowerCase());
        if (filters.budget !== 'all') {
          const budgets = {
            low: '0,5000',
            mid: '5000,10000',
            high: '10000,'
          };
          if (budgets[filters.budget]) params.append('rental_price_daily', budgets[filters.budget]);
        }
        
        // Add sorting parameters
        if (filters.sortBy) {
          if (filters.sortBy.endsWith('-desc')) {
            params.append('sortBy', filters.sortBy.replace('-desc', ''));
            params.append('sortOrder', 'desc');
          } else {
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', 'asc');
          }
        }
        
        params.append('limit', '100'); // Load all for client-side pagination if needed
  
        const response = await fetch(`/api/cars?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch cars');
        const data = await response.json();
        
       const cleanImageUrl = (url) => {
         if (!url || url === '/assets/car-images/placeholder.jpg') return 'https://via.placeholder.com/300x200?text=No+Image';
         // The backend now provides the correct image path, so no need to strip suffixes here.
         return url;
       };

       const transformedCars = data.cars.map((car, index) => ({
         id: car.id,
         brand_name: car.brand_name,
         name: `${car.brand_name} ${car.model_name}`,
         type: car.category_name,
         fuel: car.fuel_type,
         transmission: car.transmission,
         seating: car.seats,
         rentPrice: `৳${(car.rental_price_daily || 0).toLocaleString()}/day`,
         buyPrice: `৳${(car.selling_price / 100000).toFixed(1)}L`,
         image: cleanImageUrl(car.images && car.images.length > 0 ? (typeof car.images[0] === 'string' ? car.images[0] : car.images[0].url || car.images[0].image_url) : null),
         featured: index < 2,
         keyFeatures: car.keyFeatures || [], // From features join if needed
         warranty: '1 Year', // Default or from DB
         notes: car.additional_notes || '',
         availability_status: car.availability_status,
         year: car.year,
         engine_power: car.engine_power
       }));
        
        setCars(transformedCars);
        setTotalCars(transformedCars.length);
      } catch (error) {
        console.error('Error loading cars:', error);
      }
      setLoading(false);
    };

    const filteredCars = cars; // Server-side filtering already applied, client-side for additional if needed

    // Pagination calculations
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    const currentCars = filteredCars.slice(startIndex, endIndex);

    const goToPage = (page) => {
      setCurrentPage(page);
      document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <section className="py-20 px-6" id="cars" data-name="car-grid" data-file="components/CarGrid.js">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              {activeTab === 'rent' ? 'Cars Available for Rent' : 'Cars Available for Purchase'}
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Choose from our premium collection of {totalCars}+ verified vehicles
            </p>
            {filteredCars.length !== totalCars && (
              <p className="text-[var(--text-secondary)] mt-2">
                Showing {filteredCars.length} cars matching your filters
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-12 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select 
                className="bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup</option>
                <option value="MPV">MPV</option>
              </select>

              <select 
                className="bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                value={filters.fuel}
                onChange={(e) => setFilters({...filters, fuel: e.target.value})}
              >
                <option value="all">All Fuel Types</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>

              <select 
                className="bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                value={filters.transmission}
                onChange={(e) => setFilters({...filters, transmission: e.target.value})}
              >
                <option value="all">All Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>

              <select
                className="bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                value={filters.budget}
                onChange={(e) => setFilters({...filters, budget: e.target.value})}
              >
                <option value="all">All Budgets</option>
                <option value="low">Under ৳5,000/day</option>
                <option value="mid">৳5,000-10,000/day</option>
                <option value="high">Above ৳10,000/day</option>
              </select>

              <select
                className="bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                value={filters.sortBy || 'created'}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="created">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="year">Year: Newest</option>
                <option value="year-desc">Year: Oldest</option>
              </select>
            </div>
          </div>

          {/* Cars Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <div key={i} className="glass-card p-3 rounded-xl animate-pulse">
                  <div className="bg-white/10 h-28 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="bg-white/10 h-3 rounded"></div>
                    <div className="bg-white/10 h-3 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {currentCars.length > 0 ? (
                  currentCars.map((car, index) => (
                    <CarCard key={car.id} car={car} activeTab={activeTab} index={index} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">No cars found</h3>
                    <p className="text-[var(--text-secondary)]">Try adjusting your filters to see more results.</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                  >
                    <div className="icon-chevron-left text-lg"></div>
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    
                    // Show first page, last page, current page, and pages around current page
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            isCurrentPage
                              ? 'bg-[var(--primary-color)] text-white'
                              : 'bg-[var(--bg-card)] border border-white/10 text-[var(--text-secondary)] hover:bg-[var(--primary-color)] hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 3 && currentPage > 4) ||
                      (page === currentPage + 3 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={page} className="px-2 text-[var(--text-secondary)]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                  >
                    <div className="icon-chevron-right text-lg"></div>
                  </button>
                </div>
              )}

              {/* Results Summary */}
              {filteredCars.length > 0 && (
                <div className="mt-8 text-center text-[var(--text-secondary)]">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredCars.length)} of {filteredCars.length} cars
                  {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error('CarGrid component error:', error);
    return null;
  }
}
