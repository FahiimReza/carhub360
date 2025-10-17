function CarCompare() {
  try {
    const [cars, setCars] = React.useState([]);
    const [selectedCars, setSelectedCars] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [priceFilter, setPriceFilter] = React.useState('all');

    React.useEffect(() => {
      loadCars();
    }, []);

    const loadCars = async () => {
      try {
        const response = await fetch('/api/cars?limit=50');
        if (!response.ok) throw new Error('Failed to fetch cars');
        const data = await response.json();
        
        const getSizedImageUrl = (baseUrl, size) => {
          if (!baseUrl || baseUrl === '/assets/car-images/placeholder.jpg') {
            return 'https://via.placeholder.com/300x200?text=No+Image';
          }
          // The backend now provides the correct image path, so no need to strip suffixes here
          return baseUrl;
        };

        const transformedCars = data.cars.map(car => ({
          objectId: car.id,
          objectData: {
            brand: car.brand_name,
            model: car.model_name,
            fullName: `${car.brand_name} ${car.model_name}`,
            category: car.category_name,
            fuelType: car.fuel_type,
            priceMax: parseFloat(car.selling_price) || 0,
            priceMin: parseFloat(car.selling_price) * 0.8 || 0, // Approximate
            imageUrl: getSizedImageUrl(
              car.images && car.images.length > 0
                ? (typeof car.images[0] === 'string' ? car.images[0] : car.images[0].url || car.images[0].image_url)
                : null,
              400
            ),
            rentPricePerDay: parseFloat(car.rental_price_daily) || 0,
            engine: car.engine_displacement || (car.description?.match(/(\d+\.?\d*)cc/i)?.[1] ? car.description.match(/(\d+\.?\d*)cc/i)[1] + 'cc' : 'N/A'),
            enginePower: car.engine_power || (car.description?.match(/(\d+\.?\d*)hp/i)?.[1] ? car.description.match(/(\d+\.?\d*)hp/i)[1] + 'hp' : 'N/A'),
            transmission: car.transmission,
            seats: car.seats,
            year: car.year,
            notes: car.additional_notes || car.description
          }
        }));
        
        setCars(transformedCars);
      } catch (error) {
        console.error('Error loading cars:', error);
      }
      setLoading(false);
    };

    const addCarToCompare = (car) => {
      if (selectedCars.length < 3 && !selectedCars.find(c => c.objectId === car.objectId)) {
        setSelectedCars([...selectedCars, car]);
      }
    };

    const removeCarFromCompare = (carId) => {
      setSelectedCars(selectedCars.filter(c => c.objectId !== carId));
    };

    const clearAllCompare = () => {
      setSelectedCars([]);
    };

    const formatPrice = (price) => {
      return `৳${(price / 100000).toFixed(1)}L`;
    };

    // Filter cars based on search and filters
    const filteredCars = cars.filter(car => {
      const matchesSearch = car.objectData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.objectData.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || car.objectData.category.toLowerCase() === categoryFilter.toLowerCase();
      
      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'budget' && car.objectData.priceMax <= 5000000) ||
        (priceFilter === 'mid' && car.objectData.priceMax > 5000000 && car.objectData.priceMax <= 10000000) ||
        (priceFilter === 'luxury' && car.objectData.priceMax > 10000000);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    return (
      <div className="pt-20 px-6 min-h-screen" data-name="car-compare" data-file="components/CarCompare.js">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent mb-4">
              Smart Car Comparison
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Compare up to 3 cars side-by-side with detailed specifications and pricing
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="icon-search text-[var(--text-secondary)]"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search cars by name or category..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
                <option value="pickup">Pickup</option>
                <option value="mpv">MPV</option>
              </select>

              <select
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget (Under ৳50L)</option>
                <option value="mid">Mid-Range (৳50L-100L)</option>
                <option value="luxury">Luxury (Above ৳100L)</option>
              </select>
            </div>
          </div>

          {/* Selected Cars Comparison */}
          {selectedCars.length > 0 && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center">
                  <div className="icon-compare text-[var(--primary-color)] mr-3"></div>
                  Comparison ({selectedCars.length}/3)
                </h2>
                <button 
                  onClick={clearAllCompare}
                  className="text-red-400 hover:text-red-300 flex items-center"
                >
                  <div className="icon-trash-2 mr-2"></div>
                  Clear All
                </button>
              </div>

              <div className="glass-card p-0 overflow-hidden">
                {/* Car Headers */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-b border-white/10">
                  <div className="p-6 bg-[var(--primary-color)]/5">
                    <h3 className="font-bold text-[var(--text-primary)]">Features</h3>
                  </div>
                  {selectedCars.map((car, index) => (
                    <div key={car.objectId} className="p-6 text-center relative">
                      <button
                        onClick={() => removeCarFromCompare(car.objectId)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <div className="icon-x text-sm"></div>
                      </button>
                      <img 
                        src={car.objectData.imageUrl} 
                        alt={car.objectData.model}
                        className="w-24 h-16 object-cover rounded-lg mx-auto mb-3"
                      />
                      <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">
                        {car.objectData.fullName}
                      </h4>
                      <div className="flex items-center justify-center space-x-1">
                        {[1,2,3,4,5].map(star => (
                          <div key={star} className="icon-star text-[var(--accent-color)] text-sm"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison Rows */}
                <ComparisonRow label="Daily Rent" icon="calendar" data={selectedCars.map(car =>
                  `৳${car.objectData.rentPricePerDay?.toLocaleString() || 0}/day`
                )} highlight={true} />

                <ComparisonRow label="Car Price" icon="tag" data={selectedCars.map(car =>
                  `${formatPrice(car.objectData.priceMin)} - ${formatPrice(car.objectData.priceMax)}`
                )} />

                <ComparisonRow label="Engine" icon="cpu" data={selectedCars.map(car =>
                  car.objectData.enginePower || car.objectData.engine || 'N/A'
                )} />

                <ComparisonRow label="Fuel Type" icon="fuel" data={selectedCars.map(car =>
                  car.objectData.fuelType?.charAt(0).toUpperCase() + car.objectData.fuelType?.slice(1) || 'N/A'
                )} />

                <ComparisonRow label="Transmission" icon="settings" data={selectedCars.map(car =>
                  car.objectData.transmission?.charAt(0).toUpperCase() + car.objectData.transmission?.slice(1) || 'N/A'
                )} />

                <ComparisonRow label="Seats" icon="users" data={selectedCars.map(car =>
                  car.objectData.seats || 'N/A'
                )} />

                <ComparisonRow label="Year" icon="calendar" data={selectedCars.map(car =>
                  car.objectData.year || 'N/A'
                )} />

                <ComparisonRow label="Category" icon="car" data={selectedCars.map(car =>
                  car.objectData.category
                )} />
              </div>
            </div>
          )}

          {/* Available Cars */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center">
                <div className="icon-grid text-[var(--secondary-color)] mr-3"></div>
                Available Cars
              </h2>
              <div className="text-[var(--text-secondary)]">
                {filteredCars.length} cars found
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="glass-card p-4 animate-pulse">
                    <div className="bg-white/10 h-40 rounded-lg mb-4"></div>
                    <div className="bg-white/10 h-4 rounded mb-2"></div>
                    <div className="bg-white/10 h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-16">
                <div className="icon-search text-6xl text-[var(--text-secondary)] mb-4"></div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No cars found</h3>
                <p className="text-[var(--text-secondary)] mb-6">Try adjusting your search or filters</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setPriceFilter('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map((car) => {
                  const isSelected = selectedCars.find(c => c.objectId === car.objectId);
                  const canAdd = selectedCars.length < 3;
                  
                  return (
                    <CarCompareCard 
                      key={car.objectId}
                      car={car}
                      isSelected={isSelected}
                      canAdd={canAdd}
                      onAdd={() => addCarToCompare(car)}
                      formatPrice={formatPrice}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-16 text-center space-y-6">
            {selectedCars.length > 1 && (
              <div className="glass-card p-6 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Ready to decide?</h3>
                <div className="flex space-x-4">
                  <button className="btn-primary flex-1">
                    <div className="icon-heart mr-2"></div>
                    Save Comparison
                  </button>
                  <button className="btn-secondary flex-1">
                    <div className="icon-share mr-2"></div>
                    Share
                  </button>
                </div>
              </div>
            )}
            
            <a href="index.html" className="btn-secondary inline-flex items-center">
              <div className="icon-arrow-left text-lg mr-2"></div>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CarCompare component error:', error);
    return null;
  }
}

function ComparisonRow({ label, icon, data, highlight = false }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-0 border-b border-white/10 ${highlight ? 'bg-[var(--primary-color)]/5' : ''}`}>
      <div className="p-4 bg-[var(--bg-secondary)]/50 flex items-center">
        <div className={`icon-${icon} text-[var(--primary-color)] mr-3`}></div>
        <span className="font-semibold text-[var(--text-primary)]">{label}</span>
      </div>
      {data.map((value, index) => (
        <div key={index} className="p-4 text-center">
          <span className={`${highlight ? 'font-bold text-[var(--primary-color)]' : 'text-[var(--text-primary)]'}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CarCompareCard({ car, isSelected, canAdd, onAdd, formatPrice }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className={`glass-card overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-[var(--primary-color)] bg-[var(--primary-color)]/5' : ''
      } ${!canAdd && !isSelected ? 'opacity-50' : ''}`}
      onClick={() => canAdd && !isSelected && onAdd()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={car.objectData.imageUrl} 
          alt={car.objectData.model}
          className="w-full h-40 object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-white text-xs mb-2">
              <span className="bg-white/20 px-2 py-1 rounded">{car.objectData.category}</span>
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center">
            <div className="icon-check text-sm"></div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[var(--text-primary)] mb-2 text-lg truncate">
          {car.objectData.fullName}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Daily Rent</span>
            <span className="font-bold text-[var(--primary-color)]">
              ৳{car.objectData.rentPricePerDay?.toLocaleString() || 0}/day
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-secondary)]">Car Price</span>
            <span className="font-semibold text-[var(--accent-color)]">
              {formatPrice(car.objectData.priceMin)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-4">
          <span className="flex items-center">
            <div className="icon-fuel mr-1"></div>
            {car.objectData.fuelType?.charAt(0).toUpperCase() + car.objectData.fuelType?.slice(1)}
          </span>
          <span className="flex items-center">
            <div className="icon-cpu mr-1"></div>
            {car.objectData.enginePower || car.objectData.engine || 'N/A'}
          </span>
        </div>

        {isSelected ? (
          <div className="text-center py-2 text-[var(--primary-color)] font-semibold text-sm">
            <div className="icon-check mr-2"></div>
            Added to comparison
          </div>
        ) : !canAdd ? (
          <div className="text-center py-2 text-[var(--text-secondary)] text-sm">
            Maximum 3 cars allowed
          </div>
        ) : (
          <button className="w-full btn-primary text-sm py-2 hover-shine">
            <div className="icon-plus mr-2"></div>
            Add to Compare
          </button>
        )}
      </div>
    </div>
  );
}
