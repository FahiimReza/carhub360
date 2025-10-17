function RelatedCars({ currentCar }) {
  try {
    const [relatedCars, setRelatedCars] = React.useState([]);

    React.useEffect(() => {
      loadRelatedCars();
    }, [currentCar]);

    const loadRelatedCars = async () => {
      try {
        const category = currentCar.objectData.category.toLowerCase();
        const response = await fetch(`/api/cars?category=${encodeURIComponent(category)}&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch related cars');
        const data = await response.json();
        const filtered = data.cars
          .filter(car => car.id !== currentCar.id)
          .slice(0, 4)
          .map(car => ({
            objectId: car.id,
            objectData: {
              model: `${car.brand_name} ${car.model_name}`,
              category: car.category_name,
              imageUrl: car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/300x200?text=No+Image',
              priceMin: car.selling_price,
              rentPricePerDay: car.rental_price_daily
            }
          }));
        setRelatedCars(filtered);
      } catch (error) {
        console.error('Error loading related cars:', error);
      }
    };

    const formatPrice = (price) => `৳${(price / 100000).toFixed(1)}L`;

    if (relatedCars.length === 0) {
      return (
        <div className="glass-card p-8">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
            Similar Cars You Might Like
          </h2>
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">No similar cars found at the moment.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-8 mb-16">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
          Similar Cars You Might Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedCars.map((car) => (
            <div key={car.objectId} 
                 onClick={() => window.location.href = `car-details.html?id=${car.objectId}`}
                 className="glass-card p-4 cursor-pointer hover-lift hover-glow transition-all duration-300">
              <ImageWithFallback
                src={car.objectData.imageUrl}
                alt={car.objectData.model}
                className="w-full h-32 rounded-lg mb-3"
                carModel={car.objectData.model}
                category={car.objectData.category}
              />
              <h4 className="font-bold text-[var(--text-primary)] mb-2 text-sm">{car.objectData.model}</h4>
              <div className="flex justify-between items-center">
                <span className="text-[var(--primary-color)] font-bold text-sm">
                  {formatPrice(car.objectData.priceMin)}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">{car.objectData.category}</span>
              </div>
              <div className="mt-2 text-xs text-[var(--accent-color)]">
                ৳{car.objectData.rentPricePerDay}/day
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('RelatedCars component error:', error);
    return null;
  }
}