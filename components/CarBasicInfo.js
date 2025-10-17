function CarBasicInfo({ car }) {
  try {
    // Calculate star display based on rating
    const renderStars = (rating) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];
      
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars.push(
            <div key={i} className="icon-star text-[var(--accent-color)] text-lg"></div>
          );
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(
            <div key={i} className="icon-star-half-alt text-[var(--accent-color)] text-lg"></div>
          );
        } else {
          stars.push(
            <div key={i} className="icon-star text-gray-400 text-lg"></div>
          );
        }
      }
      return stars;
    };
    
    // Get rating from car data (from API) or default to 0
    const rating = parseFloat(car.rating_average) || 0;
    const ratingCount = parseInt(car.rating_count) || 0;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">
            {car.objectData.model}
          </h1>
          <div className="flex items-center space-x-2">
            {renderStars(rating)}
            <span className="text-[var(--text-secondary)] ml-2">
              ({rating > 0 ? rating.toFixed(1) : '0.0'}/5{ratingCount > 0 ? ` - ${ratingCount} review${ratingCount !== 1 ? 's' : ''}` : ''})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <span className="flex items-center bg-[var(--primary-color)]/10 px-3 py-2 rounded-full text-[var(--primary-color)]">
            <div className="icon-car mr-2"></div>
            {car.objectData.category}
          </span>
          <span className="flex items-center bg-[var(--secondary-color)]/10 px-3 py-2 rounded-full text-[var(--secondary-color)]">
            <div className="icon-fuel mr-2"></div>
            {car.objectData.fuelType}
          </span>
          <span className="flex items-center bg-[var(--accent-color)]/10 px-3 py-2 rounded-full text-[var(--accent-color)]">
            {car.objectData.engine}
          </span>
          <span className="flex items-center bg-green-500/10 px-3 py-2 rounded-full text-green-400">
            <div className="icon-shield-check mr-2"></div>
            Available
          </span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CarBasicInfo component error:', error);
    return null;
  }
}