function CarPricing({ car, activeTab, setActiveTab, formatPrice, discountedPrice }) {
  try {
    return (
      <div className="glass-card p-6 hover-glow">
        <div className="flex items-center space-x-4 mb-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center ${
              activeTab === 'rent'
                ? 'bg-[var(--primary-color)] text-white transform scale-105'
                : 'text-[var(--text-secondary)] hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('rent')}
          >
            <div className="icon-key mr-2"></div>
            Rent
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center ${
              activeTab === 'buy'
                ? 'bg-[var(--primary-color)] text-white transform scale-105'
                : 'text-[var(--text-secondary)] hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('buy')}
          >
            <div className="icon-shopping-cart mr-2"></div>
            Buy
          </button>
        </div>
        
        {activeTab === 'rent' ? (
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent mb-2">
              ৳{car.objectData.rentPricePerDay}/day
            </div>
            <p className="text-[var(--text-secondary)] mb-4">Daily rental price</p>
            <div className="text-sm text-[var(--text-secondary)]">
              <div>✓ Insurance included</div>
              <div>✓ 24/7 roadside assistance</div>
              <div>✓ Free delivery within city</div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className={`text-4xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent mb-2 ${discountedPrice ? 'line-through opacity-60' : ''}`}>
              {formatPrice(car.objectData.priceMin)} - {formatPrice(car.objectData.priceMax)}
            </div>
            {discountedPrice && (
              <div className="text-3xl font-bold text-green-500 mb-2">
                {formatPrice(discountedPrice)}
              </div>
            )}
            <p className="text-[var(--text-secondary)] mb-4">Purchase price range</p>
            <div className="text-sm text-[var(--text-secondary)]">
              <div>✓ {car.objectData.warranty} warranty</div>
              <div>✓ Financing options available</div>
              <div>✓ Trade-in accepted</div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('CarPricing component error:', error);
    return null;
  }
}