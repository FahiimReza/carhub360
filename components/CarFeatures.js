function CarFeatures({ car }) {
  try {
    return (
      <div className="glass-card p-6 hover-lift">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
          <div className="icon-star text-[var(--accent-color)] mr-3"></div>
          Key Features
        </h3>
        {(() => {
          let features = [];
          
          // Try multiple possible locations for features
          if (Array.isArray(car.objectData.keyFeatures)) {
            features = car.objectData.keyFeatures;
          } else if (typeof car.objectData.keyFeatures === 'string') {
            features = car.objectData.keyFeatures.split(',').map(f => f.trim()).filter(f => f);
          } else if (car.features && Array.isArray(car.features)) {
            // Try the features array from the API response
            features = car.features.map(f => f.name || f).filter(f => f);
          } else if (car.objectData.features && Array.isArray(car.objectData.features)) {
            // Try features in objectData
            features = car.objectData.features.map(f => f.name || f).filter(f => f);
          }
          
          // If still no features, add some default ones based on category
          if (features.length === 0) {
            const category = car.objectData.category || car.category_name || '';
            if (category.toLowerCase().includes('suv')) {
              features = ['Spacious Interior', 'High Ground Clearance', 'Advanced Safety Features'];
            } else if (category.toLowerCase().includes('sedan')) {
              features = ['Comfortable Seating', 'Fuel Efficient', 'Smooth Ride'];
            } else if (category.toLowerCase().includes('luxury')) {
              features = ['Premium Materials', 'Advanced Technology', 'Superior Comfort'];
            } else {
              features = ['Reliable Performance', 'Modern Design', 'Great Value'];
            }
          }
          
          if (features.length === 0) {
            return (
              <div className="text-center py-4">
                <p className="text-[var(--text-secondary)]">No specific features listed for this vehicle.</p>
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.slice(0, 6).map((feature, idx) => (
                <div key={idx} className="flex items-center text-[var(--text-secondary)]">
                  <div className="icon-check text-green-400 mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  } catch (error) {
    console.error('CarFeatures component error:', error);
    return null;
  }
}