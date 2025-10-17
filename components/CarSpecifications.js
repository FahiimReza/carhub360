function CarSpecifications({ car }) {
  try {
    const getSpecsByCategory = (category) => {
      const baseSpecs = {
        'Engine & Performance': {
          'Engine': car.objectData.engine,
          'Fuel Type': car.objectData.fuelType,
          'Transmission': 'Automatic',
          'Power': '150-200 HP',
          'Torque': '200-250 Nm',
          'Top Speed': '180-200 km/h',
          'Acceleration': '8-12 seconds (0-100 km/h)'
        },
        'Dimensions & Weight': {
          'Length': '4.5-4.8m',
          'Width': '1.8-1.9m',
          'Height': '1.6-1.7m',
          'Weight': '1400-1800kg',
          'Ground Clearance': '150-200mm',
          'Boot Space': '400-500L',
          'Fuel Tank': '50-60L'
        },
        'Features & Safety': {
          'Airbags': '6-7',
          'ABS': 'Yes',
          'Seating': '5-7 Seats',
          'Warranty': car.objectData.warranty || '3 years',
          'Safety Rating': '5 Star NCAP',
          'Climate Control': 'Automatic AC',
          'Infotainment': 'Touchscreen Display'
        }
      };

      // Adjust specs based on category
      if (category === 'SUV') {
        baseSpecs['Dimensions & Weight']['Length'] = '4.6-5.0m';
        baseSpecs['Dimensions & Weight']['Height'] = '1.7-1.8m';
        baseSpecs['Dimensions & Weight']['Ground Clearance'] = '200-250mm';
        baseSpecs['Features & Safety']['Seating'] = '7 Seats';
      } else if (category === 'Luxury') {
        baseSpecs['Engine & Performance']['Power'] = '250-400 HP';
        baseSpecs['Features & Safety']['Airbags'] = '8-10';
        baseSpecs['Features & Safety']['Climate Control'] = 'Dual Zone AC';
      } else if (category === 'Pickup') {
        baseSpecs['Dimensions & Weight']['Length'] = '5.2-5.5m';
        baseSpecs['Dimensions & Weight']['Height'] = '1.8-1.9m';
        baseSpecs['Engine & Performance']['Engine'] = '2.5L - 3.0L Diesel';
        baseSpecs['Features & Safety']['Seating'] = '5 Seats (Crew Cab)';
      }

      return baseSpecs;
    };

    const specifications = getSpecsByCategory(car.objectData.category);
    const categories = Object.keys(specifications);
    const categoryColors = ['primary', 'secondary', 'accent'];

    return (
      <div className="glass-card p-8 mb-16">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
          Detailed Specifications
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category, categoryIndex) => (
            <div key={category} className="space-y-4">
              <h3 className={`text-xl font-bold mb-4 text-[var(--${categoryColors[categoryIndex]}-color)] flex items-center`}>
                <div className={`icon-${categoryIndex === 0 ? 'settings' : categoryIndex === 1 ? 'maximize' : 'shield'} mr-3`}></div>
                {category}
              </h3>
              
              <div className="space-y-3">
                {Object.entries(specifications[category]).map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-[var(--text-secondary)] text-sm">{label}:</span>
                    <span className="font-semibold text-[var(--text-primary)] text-sm text-right">
                      {value === 'Yes' ? (
                        <div className="flex items-center text-green-400">
                          <div className="icon-check mr-1"></div>
                          Yes
                        </div>
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Notes */}
        {car.objectData.notes && (
          <div className="mt-8 p-6 bg-[var(--primary-color)]/10 rounded-lg border border-[var(--primary-color)]/20">
            <h4 className="font-bold text-[var(--text-primary)] mb-2 flex items-center">
              <div className="icon-info text-[var(--primary-color)] mr-2"></div>
              Additional Information
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">{car.objectData.notes}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('CarSpecifications component error:', error);
    return null;
  }
}
