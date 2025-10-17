function AICarSuggestions({ currentCar }) {
  try {
    const [suggestions, setSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [analysis, setAnalysis] = React.useState('');

    React.useEffect(() => {
      loadAISuggestions();
    }, [currentCar]);

    const loadAISuggestions = async () => {
      try {
        setLoading(true);
        
        // Get current car details
        const currentPrice = currentCar.objectData.priceMax || currentCar.objectData.priceMin || 0;
        const currentCategory = currentCar.objectData.category || '';
        const currentBrand = currentCar.brand_name || '';
        
        console.log('Current car details:', {
          id: currentCar.id,
          price: currentPrice,
          category: currentCategory,
          brand: currentBrand
        });
        
        // First try to get cars by category only
        let response;
        let data;
        
        if (currentCategory) {
          response = await fetch(`/api/cars?category=${encodeURIComponent(currentCategory)}&limit=10`);
          if (!response.ok) throw new Error('Failed to fetch suggestions');
          data = await response.json();
        } else {
          // If no category, get all cars
          response = await fetch('/api/cars?limit=20');
          if (!response.ok) throw new Error('Failed to fetch suggestions');
          data = await response.json();
        }
        
        console.log('API response:', data);
        
        // If no cars found with the current approach, try a broader search
        if (!data.cars || data.cars.length === 0) {
          console.log('No cars found with category filter, trying all cars');
          response = await fetch('/api/cars?limit=20');
          if (!response.ok) throw new Error('Failed to fetch suggestions');
          data = await response.json();
        }
        
        // Filter out the current car and process suggestions
        let filteredCars = data.cars
          .filter(car => car.id !== currentCar.id)
          .map(car => ({
            id: car.id,
            brand_name: car.brand_name,
            model_name: car.model_name,
            category_name: car.category_name,
            selling_price: car.selling_price,
            rental_price_daily: car.rental_price_daily,
            images: car.images || [],
            features: car.features || [],
            // Calculate match score
            matchScore: calculateMatchScore(currentCar, car, currentPrice)
          }));
        
        // If we have fewer than 4 cars, try to get more
        if (filteredCars.length < 4) {
          response = await fetch('/api/cars?limit=50');
          if (!response.ok) throw new Error('Failed to fetch more suggestions');
          data = await response.json();
          
          const additionalCars = data.cars
            .filter(car => car.id !== currentCar.id && !filteredCars.some(fc => fc.id === car.id))
            .map(car => ({
              id: car.id,
              brand_name: car.brand_name,
              model_name: car.model_name,
              category_name: car.category_name,
              selling_price: car.selling_price,
              rental_price_daily: car.rental_price_daily,
              images: car.images || [],
              features: car.features || [],
              matchScore: calculateMatchScore(currentCar, car, currentPrice)
            }));
          
          filteredCars = [...filteredCars, ...additionalCars];
        }
        
        // Sort by match score
        filteredCars = filteredCars
          .sort((a, b) => b.matchScore - a.matchScore);
        
        console.log('Final filtered cars:', filteredCars);
        
        // Only show the cars that would be meaningful alternatives
        const betterValueCars = currentPrice > 0 ?
          filteredCars.filter(car => car.selling_price < currentPrice * 0.95) : []; // At least 5% cheaper
        const similarPriceCars = currentPrice > 0 ?
          filteredCars.filter(car => Math.abs(car.selling_price - currentPrice) / currentPrice < 0.05) : []; // Within 5% price
        const premiumCars = currentPrice > 0 ?
          filteredCars.filter(car => car.selling_price > currentPrice * 1.05) : []; // At least 5% more expensive
        
        // Select cars based on availability and meaningful price differences
        let selectedCars = [];
        
        // Add 1 better value car if available
        if (betterValueCars.length > 0) {
          selectedCars.push(betterValueCars[0]);
        }
        
        // Add 1 similar price car if available (but not the same car)
        if (similarPriceCars.length > 0) {
          const similarCar = similarPriceCars.find(car => car.id !== currentCar.id);
          if (similarCar) {
            selectedCars.push(similarCar);
          }
        }
        
        // Add 1 premium car if available
        if (premiumCars.length > 0) {
          selectedCars.push(premiumCars[0]);
        }
        
        // If we still don't have enough cars, add the highest matching alternatives
        if (selectedCars.length < 3) {
          const remainingCars = filteredCars.filter(car =>
            !selectedCars.includes(car) && car.id !== currentCar.id
          );
          selectedCars.push(...remainingCars.slice(0, 3 - selectedCars.length));
        }
        
        // Limit to 3 cars
        selectedCars = selectedCars.slice(0, 3);
        
        // Generate analysis based on the actual selected cars
        const analysisData = generateAnalysis(currentCar, selectedCars, currentPrice);
        
        setSuggestions(selectedCars);
        setAnalysis(analysisData.text);
      } catch (error) {
        console.error('Error loading AI suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Calculate match score based on various factors
    const calculateMatchScore = (currentCar, suggestedCar, currentPrice) => {
      let score = 50; // Start with base score
      
      // Price similarity (30% weight) - only if we have a valid price
      if (currentPrice > 0 && suggestedCar.selling_price) {
        const priceDiff = Math.abs(suggestedCar.selling_price - currentPrice) / currentPrice;
        score -= priceDiff * 30;
        
        // Bonus for better value (cheaper price)
        if (suggestedCar.selling_price < currentPrice) {
          score += 10;
        }
      }
      
      // Category match (25% weight)
      if (currentCar.objectData && suggestedCar.category_name === currentCar.objectData.category) {
        score += 25;
      }
      
      // Brand preference (15% weight)
      if (currentCar.brand_name && suggestedCar.brand_name === currentCar.brand_name) {
        score += 15;
      } else if (currentCar.brand_name && isSimilarBrand(suggestedCar.brand_name, currentCar.brand_name)) {
        score += 7;
      }
      
      // Features overlap (20% weight)
      if (currentCar.features && currentCar.features.length > 0 && suggestedCar.features && suggestedCar.features.length > 0) {
        const currentFeatures = currentCar.features.map(f => f.name || f).join(' ').toLowerCase();
        const suggestedFeatures = suggestedCar.features.map(f => f.name || f).join(' ').toLowerCase();
        const commonWords = findCommonWords(currentFeatures, suggestedFeatures);
        score += Math.min(commonWords.length * 5, 20);
      }
      
      // Base score for being a valid car (10% weight)
      score += 10;
      
      return Math.max(0, Math.min(100, score));
    };

    // Check if brands are similar (e.g., Toyota vs Lexus, Honda vs Acura)
    const isSimilarBrand = (brand1, brand2) => {
      const brandGroups = [
        ['toyota', 'lexus'],
        ['honda', 'acura'],
        ['nissan', 'infiniti'],
        ['hyundai', 'genesis'],
        ['volkswagen', 'audi', 'porsche', 'bentley']
      ];
      
      return brandGroups.some(group => 
        group.includes(brand1.toLowerCase()) && group.includes(brand2.toLowerCase())
      );
    };

    // Find common words between two strings
    const findCommonWords = (str1, str2) => {
      const words1 = str1.split(/\s+/);
      const words2 = str2.split(/\s+/);
      return words1.filter(word => words2.includes(word));
    };

    // Generate AI analysis text
    const generateAnalysis = (currentCar, suggestions, currentPrice) => {
      const carModel = currentCar.objectData.model || currentCar.objectData.model_name || 'this car';
      const carCategory = currentCar.objectData.category || 'similar vehicles';
      
      if (suggestions.length === 0) {
        return {
          text: `AI Analysis for ${carModel}:\n\nWhile we couldn't find exact matches in your preferred category, we've selected some great alternatives that might interest you. Consider exploring different categories or expanding your budget range for more options.`,
          betterValueCount: 0,
          premiumCount: 0
        };
      }
      
      // Categorize the selected cars based on actual price differences
      const betterValueCars = currentPrice > 0 ? suggestions.filter(car => car.selling_price < currentPrice * 0.95) : [];
      const similarPriceCars = currentPrice > 0 ? suggestions.filter(car =>
        Math.abs(car.selling_price - currentPrice) / currentPrice < 0.05
      ) : [];
      const premiumCars = currentPrice > 0 ? suggestions.filter(car => car.selling_price > currentPrice * 1.05) : [];
      
      let analysis = `AI Analysis for ${carModel}:\n\n`;
      
      if (betterValueCars.length > 0) {
        analysis += `Found ${betterValueCars.length} car${betterValueCars.length > 1 ? 's' : ''} with similar features at lower prices. `;
        analysis += `These options offer better value for money while maintaining the ${carCategory} experience you're looking for.\n\n`;
      }
      
      if (similarPriceCars.length > 0) {
        analysis += `Consider ${similarPriceCars.length} alternative${similarPriceCars.length > 1 ? 's' : ''} with similar pricing. `;
        analysis += `These options provide comparable features and value within your budget range.\n\n`;
      }
      
      if (premiumCars.length > 0) {
        analysis += `Consider ${premiumCars.length} premium alternative${premiumCars.length > 1 ? 's' : ''} with enhanced features. `;
        analysis += `These options provide upgraded amenities and technology for a modest price increase.\n\n`;
      }
      
      // Top recommendation (highest match score that's not the same car)
      const topCar = suggestions.find(car => car.id !== currentCar.id) || suggestions[0];
      if (topCar && topCar.id !== currentCar.id) {
        let priceRelation = '';
        let priceDesc = '';
        
        if (currentPrice > 0 && topCar.selling_price) {
          const priceDiff = ((topCar.selling_price - currentPrice) / currentPrice * 100).toFixed(0);
          
          if (priceDiff > 5) {
            priceRelation = ` (+${priceDiff}% price)`;
            priceDesc = 'premium option';
          } else if (priceDiff < -5) {
            priceRelation = ` (${priceDiff}% price)`;
            priceDesc = 'better value';
          } else {
            priceRelation = ` (similar price)`;
            priceDesc = 'comparable alternative';
          }
        }
        
        analysis += `Top Recommendation: ${topCar.brand_name} ${topCar.model_name}${priceRelation}`;
        analysis += ` with a ${Math.round(topCar.matchScore)}% match to your preferences.`;
        
        if (priceDesc) {
          analysis += ` This ${priceDesc} offers excellent value.`;
        }
      } else {
        // If no good alternatives found, provide a helpful message
        analysis += `We couldn't find suitable alternatives at this time. The ${carModel} appears to be a unique offering in its category.`;
      }
      
      return {
        text: analysis,
        betterValueCount: betterValueCars.length,
        similarPriceCount: similarPriceCars.length,
        premiumCount: premiumCars.length
      };
    };

    const formatPrice = (price) => `৳${(price / 100000).toFixed(1)}L`;

    if (loading) {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] backdrop-blur-md border border-white/10 p-8 mt-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary-color)]/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[var(--secondary-color)]/20 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)]/20 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-12 w-12 items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-[var(--primary-color)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-[var(--text-primary)] font-semibold text-lg">AI is finding perfect matches</p>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Analyzing similar cars based on your preferences...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] backdrop-blur-md border border-white/10 p-8 mt-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary-color)]/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[var(--secondary-color)]/20 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">AI Suggestions</h3>
                <p className="text-[var(--text-secondary)] text-sm">Smart recommendations for you</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[var(--primary-color)]/10 to-[var(--secondary-color)]/10 p-6 rounded-xl border border-[var(--primary-color)]/20 backdrop-blur-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[var(--primary-color)] mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[var(--text-primary)] font-medium mb-1">No exact matches found</p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Based on your interest in the {currentCar.objectData.model || 'this car'}, we couldn't find exact matches in your budget range.
                    Consider expanding your search criteria or check back later for new arrivals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] backdrop-blur-md border border-white/10 p-8 mt-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary-color)]/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[var(--secondary-color)]/20 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">AI Suggestions</h3>
                <p className="text-[var(--text-secondary)] text-sm">Perfect matches for your preferences</p>
              </div>
            </div>
            <div className="flex items-center text-xs text-[var(--text-secondary)] bg-white/5 px-3 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Powered by AI
            </div>
          </div>
          
          {/* AI Analysis */}
          <div className="bg-gradient-to-r from-[var(--primary-color)]/10 to-[var(--secondary-color)]/10 p-6 rounded-xl border border-[var(--primary-color)]/20 backdrop-blur-sm mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[var(--primary-color)] mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-2">AI Analysis</p>
                <p className="text-[var(--text-secondary)] text-sm whitespace-pre-line">{analysis}</p>
              </div>
            </div>
          </div>
          
          {/* Suggested Cars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((car) => {
            const priceDiff = ((car.selling_price - (currentCar.objectData.priceMax || currentCar.objectData.priceMin || 0)) / (currentCar.objectData.priceMax || currentCar.objectData.priceMin || 1) * 100).toFixed(0);
            const isCheaper = car.selling_price < (currentCar.objectData.priceMax || currentCar.objectData.priceMin || 0);
            
            return (
              <div
                key={car.id}
                onClick={() => window.location.href = `car-details.html?id=${car.id}`}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-[var(--primary-color)]/30 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 to-[var(--secondary-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Match Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white text-xs px-2 py-1 rounded-full z-10 font-semibold shadow-lg">
                  {Math.round(car.matchScore)}% Match
                </div>
                
                {/* Price Indicator */}
                <div className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-full z-10 font-semibold shadow-lg ${
                  isCheaper ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
                }`}>
                  {isCheaper ? `-${Math.abs(priceDiff)}%` : `+${priceDiff}%`}
                </div>
                
                <div className="relative z-10">
                  <ImageWithFallback
                    src={car.images && car.images.length > 0 ?
                      (car.images[0].includes('-400.webp') ? car.images[0] : `${car.images[0].replace('.webp', '')}-400.webp`) :
                      'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={`${car.brand_name} ${car.model_name}`}
                    className="w-full h-36 rounded-lg mb-4 object-cover transition-transform duration-300 group-hover:scale-105"
                    carModel={`${car.brand_name} ${car.model_name}`}
                    category={car.category_name}
                  />
                  
                  <h4 className="font-bold text-[var(--text-primary)] mb-2 text-sm group-hover:text-[var(--primary-color)] transition-colors">
                    {car.brand_name} {car.model_name}
                  </h4>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[var(--primary-color)] font-bold">
                      {formatPrice(car.selling_price)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-2 py-1 rounded-full">
                      {car.category_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[var(--accent-color)] font-medium">
                      ৳{car.rental_price_daily}/day
                    </div>
                    <div className="flex items-center text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs mr-1">View</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Key Features Preview */}
                  {car.features && car.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {car.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-gradient-to-r from-white/10 to-white/5 px-2 py-1 rounded-full text-[var(--text-secondary)] border border-white/10">
                          {feature.name}
                        </span>
                      ))}
                      {car.features.length > 2 && (
                        <span className="text-xs text-[var(--text-secondary)] opacity-70">+{car.features.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AICarSuggestions component error:', error);
    return null;
  }
}