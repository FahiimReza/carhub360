function CarCard({ car, activeTab, index }) {
  try {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        className="relative transition-all duration-300 animate-slide-up"
        style={{ animationDelay: `${index * 0.1}s` }}
        data-name="car-card"
        data-file="components/CarCard.js"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`glass-card rounded-xl cursor-pointer transition-all duration-300 transform ${
            isHovered ? 'scale-105 shadow-2xl' : 'hover:shadow-lg'
          } ${isHovered ? 'p-4' : 'p-3'}`}
          onClick={() => window.location.href = `car-details.html?id=${car.id}`}
        >
          
          {/* Car Image */}
          <div className="relative overflow-hidden rounded-lg mb-3">
            <ImageWithFallback
              src={car.image}
              alt={car.name}
              className={`transition-all duration-300 ${
                isHovered ? 'h-40' : 'h-28'
              }`}
              carModel={car.name}
              category={car.type}
              onImageUpdate={(newUrl) => {
                // No DB update needed; service handles fallbacks, DB pre-updated
                if (car.id && newUrl !== car.image) {
                  console.log(`Fallback image for ${car.name}: ${newUrl}`);
                  window.dispatchEvent(new CustomEvent('carDataUpdated'));
                }
              }}
            />
            {car.featured && (
              <div className="absolute top-2 right-2 bg-[var(--accent-color)] text-white px-2 py-1 rounded-full text-xs font-semibold">
                <div className="icon-star text-xs mr-1"></div>
                Hot
              </div>
            )}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `car-details.html?id=${car.id}`;
              }}
            ></div>
          </div>
          
          {/* Car Info */}
          <div className="space-y-2">
            <h3 className={`font-bold text-[var(--text-primary)] transition-all duration-300 ${
              isHovered ? 'text-lg mb-2' : 'text-sm mb-1'
            } truncate`}>
              {car.name}
            </h3>
            
            {/* Compact Info - Always Visible */}
            <div className="flex items-center justify-between">
              <div className={`font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent transition-all duration-300 ${
                isHovered ? 'text-xl' : 'text-base'
              }`}>
                {activeTab === 'rent' ? car.rentPrice : car.buyPrice.split(' - ')[0]}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {car.type}
              </div>
            </div>

            {/* Expanded Info - Visible on Hover */}
            <div className={`transition-all duration-300 overflow-hidden ${
              isHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {/* Features */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-3">
                <span className="flex items-center">
                  <div className="icon-fuel text-[var(--primary-color)] mr-1"></div>
                  {car.fuel}
                </span>
                <span className="flex items-center">
                  <div className="icon-users text-[var(--secondary-color)] mr-1"></div>
                  {car.seating}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mb-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `car-details.html?id=${car.id}`;
                  }}
                  className="btn-primary flex-1 text-xs py-2 transform transition-all duration-300 hover:scale-105"
                >
                  <div className="icon-eye text-xs mr-1"></div>
                  Details
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `car-details.html?id=${car.id}`;
                  }}
                  className="btn-secondary text-xs py-2 px-3 transform transition-all duration-300 hover:scale-105"
                >
                  <div className={`icon-${activeTab === 'rent' ? 'key' : 'shopping-cart'} text-xs`}></div>
                </button>
              </div>

              {/* Quick Features */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center text-xs text-green-400">
                  <div className="icon-shield-check mr-1"></div>
                  Verified
                </div>
                <div className="flex items-center text-xs text-blue-400">
                  <div className="icon-clock mr-1"></div>
                  Instant
                </div>
                <div className="flex items-center text-xs text-orange-400">
                  <div className="icon-phone mr-1"></div>
                  24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CarCard component error:', error);
    return null;
  }
}
