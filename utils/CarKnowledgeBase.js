// Enhanced Car Knowledge Base for Smart ChatBot
const CarKnowledgeBase = {
  // Car categories with detailed information
  categories: {
    economy: {
      name: 'Economy Cars',
      description: 'Fuel-efficient and affordable, perfect for city driving',
      priceRange: { rent: '৳2,000-3,500/day', buy: '৳10-15 lakh' },
      examples: ['Toyota Corolla', 'Honda Civic', 'Nissan Sunny'],
      features: ['High mileage', 'Low maintenance', 'Easy parking'],
      bestFor: ['Daily commute', 'First-time car owners', 'Budget-conscious users']
    },
    sedan: {
      name: 'Sedans',
      description: 'Comfortable and elegant, ideal for families and business',
      priceRange: { rent: '৳3,500-6,000/day', buy: '৳15-25 lakh' },
      examples: ['Toyota Camry', 'Honda Accord', 'BMW 3 Series'],
      features: ['Spacious interior', 'Smooth ride', 'Professional look'],
      bestFor: ['Family use', 'Business meetings', 'Long drives']
    },
    suv: {
      name: 'SUVs',
      description: 'Spacious and versatile, perfect for adventures and families',
      priceRange: { rent: '৳5,000-10,000/day', buy: '৳25-45 lakh' },
      examples: ['Toyota RAV4', 'Honda CR-V', 'Ford Explorer'],
      features: ['7 seats available', 'High ground clearance', 'Large cargo space'],
      bestFor: ['Family trips', 'Road trips', 'Off-road adventures']
    },
    luxury: {
      name: 'Luxury Vehicles',
      description: 'Premium comfort and cutting-edge technology',
      priceRange: { rent: '৳10,000-20,000/day', buy: '৳60 lakh+' },
      examples: ['Mercedes S-Class', 'BMW 7 Series', 'Audi A8'],
      features: ['Premium materials', 'Advanced tech', 'Superior comfort'],
      bestFor: ['Special occasions', 'Business executives', 'Luxury experience']
    },
    electric: {
      name: 'Electric Vehicles',
      description: 'Eco-friendly with instant torque and quiet operation',
      priceRange: { rent: '৳4,000-8,000/day', buy: '৳20-40 lakh' },
      examples: ['Tesla Model 3', 'Nissan Leaf', 'Hyundai Kona Electric'],
      features: ['Zero emissions', 'Low running costs', 'Instant acceleration'],
      bestFor: ['Environmentally conscious', 'Tech enthusiasts', 'Urban driving']
    }
  },

  // Brand-specific information
  brands: {
    toyota: {
      name: 'Toyota',
      reputation: 'Reliable and durable',
      popularModels: ['Corolla', 'Camry', 'RAV4', 'Prius'],
      strengths: ['Reliability', 'Resale value', 'Fuel efficiency'],
      priceRange: 'Budget to mid-range'
    },
    honda: {
      name: 'Honda',
      reputation: 'Innovative and efficient',
      popularModels: ['Civic', 'CR-V', 'Accord', 'Fit'],
      strengths: ['Build quality', 'Performance', 'Resale value'],
      priceRange: 'Mid-range'
    },
    bmw: {
      name: 'BMW',
      reputation: 'Luxury performance',
      popularModels: ['3 Series', '5 Series', 'X5', 'X3'],
      strengths: ['Driving dynamics', 'Premium feel', 'Technology'],
      priceRange: 'Premium to luxury'
    },
    tesla: {
      name: 'Tesla',
      reputation: 'Electric innovation leader',
      popularModels: ['Model 3', 'Model S', 'Model X', 'Model Y'],
      strengths: ['Technology', 'Performance', 'Autopilot'],
      priceRange: 'Premium'
    }
  },

  // Dynamic suggestion engine
  getSuggestions: function(context) {
    const { userIntent, preferences, previousQuestions, shownCars } = context;
    const suggestions = [];

    // Initial suggestions based on intent
    if (userIntent === 'initial') {
      suggestions.push(
        { text: 'I want to rent a car', action: 'set_intent', value: 'rental' },
        { text: 'I want to buy a car', action: 'set_intent', value: 'purchase' },
        { text: 'Compare car models', action: 'set_intent', value: 'comparison' },
        { text: 'Check rental prices', action: 'set_intent', value: 'information' }
      );
    }

    // Rental journey suggestions
    if (userIntent === 'rental') {
      if (!preferences.carType) {
        suggestions.push(
          { text: 'Economy cars (৳2,000-3,500/day)', action: 'set_preference', key: 'carType', value: 'economy' },
          { text: 'Sedans (৳3,500-6,000/day)', action: 'set_preference', key: 'carType', value: 'sedan' },
          { text: 'SUVs (৳5,000-10,000/day)', action: 'set_preference', key: 'carType', value: 'suv' },
          { text: 'Luxury cars (৳10,000+/day)', action: 'set_preference', key: 'carType', value: 'luxury' }
        );
      } else if (!preferences.budget) {
        const category = this.categories[preferences.carType];
        suggestions.push(
          { text: 'Budget-friendly', action: 'set_preference', key: 'budget', value: 'low' },
          { text: 'Mid-range', action: 'set_preference', key: 'budget', value: 'medium' },
          { text: 'Premium', action: 'set_preference', key: 'budget', value: 'high' }
        );
      } else if (!preferences.duration) {
        suggestions.push(
          { text: 'Daily rental', action: 'set_preference', key: 'duration', value: 'daily' },
          { text: 'Weekly rental (15% off)', action: 'set_preference', key: 'duration', value: 'weekly' },
          { text: 'Monthly rental (30% off)', action: 'set_preference', key: 'duration', value: 'monthly' }
        );
      }
    }

    // Purchase journey suggestions
    if (userIntent === 'purchase') {
      if (!preferences.carType) {
        suggestions.push(
          { text: 'Show all categories', action: 'browse_inventory' },
          { text: 'Economy cars (৳10-15 lakh)', action: 'set_preference', key: 'carType', value: 'economy' },
          { text: 'Sedans (৳15-25 lakh)', action: 'set_preference', key: 'carType', value: 'sedan' },
          { text: 'SUVs (৳25-45 lakh)', action: 'set_preference', key: 'carType', value: 'suv' }
        );
      } else if (!preferences.budget) {
        suggestions.push(
          { text: 'Under ৳15 lakh', action: 'set_preference', key: 'budget', value: 'low' },
          { text: '৳15-25 lakh', action: 'set_preference', key: 'budget', value: 'medium' },
          { text: '৳25-40 lakh', action: 'set_preference', key: 'budget', value: 'high' },
          { text: 'Above ৳40 lakh', action: 'set_preference', key: 'budget', value: 'luxury' }
        );
      }
    }

    // After showing cars
    if (shownCars && shownCars.length > 0) {
      suggestions.push(
        { text: 'View car details', action: 'view_details' },
        { text: 'Compare selected', action: 'compare_cars' },
        { text: 'Check availability', action: 'check_availability' },
        { text: 'See more options', action: 'more_options' }
      );
    }

    return suggestions;
  },

  // Response generation based on context
  generateResponse: function(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    let response = { text: '', suggestions: [], carData: null };

    // Handle rental inquiries
    if (lowerMessage.includes('rent') || lowerMessage.includes('rental')) {
      response.text = "I'd be happy to help you find the perfect rental car! What type of vehicle are you looking for?";
      response.suggestions = this.getSuggestions({ ...context, userIntent: 'rental' });
      return response;
    }

    // Handle purchase inquiries
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      response.text = "Great! Let me help you find your dream car. What category are you interested in?";
      response.suggestions = this.getSuggestions({ ...context, userIntent: 'purchase' });
      return response;
    }

    // Handle budget questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
      response.text = "Our pricing varies by category and duration. Economy cars start at ৳2,000/day, sedans at ৳3,500/day, SUVs at ৳5,000/day, and luxury vehicles at ৳10,000/day. Weekly rentals get 15% off and monthly rentals save 30%! What's your budget range?";
      response.suggestions = [
        { text: 'Under ৳3,000/day', action: 'set_preference', key: 'budget', value: 'low' },
        { text: '৳3,000-6,000/day', action: 'set_preference', key: 'budget', value: 'medium' },
        { text: '৳6,000-10,000/day', action: 'set_preference', key: 'budget', value: 'high' },
        { text: 'Above ৳10,000/day', action: 'set_preference', key: 'budget', value: 'luxury' }
      ];
      return response;
    }

    // Handle car type inquiries
    for (const [category, info] of Object.entries(this.categories)) {
      if (lowerMessage.includes(category)) {
        response.text = `${info.name} are ${info.description.toLowerCase()}. ${info.name} ${info.priceRange.rent} for rentals and ${info.priceRange.buy} for purchase. Would you like to see specific ${category} models?`;
        response.carData = { category, info };
        response.suggestions = [
          { text: `Show ${category} models`, action: 'browse_inventory', value: category },
          { text: 'Compare with other types', action: 'set_intent', value: 'comparison' },
          { text: 'Check availability', action: 'check_availability', value: category }
        ];
        return response;
      }
    }

    // Handle brand inquiries
    for (const [brand, info] of Object.entries(this.brands)) {
      if (lowerMessage.includes(brand)) {
        response.text = `${info.name} is known for ${info.reputation.toLowerCase()}. Popular models include ${info.popularModels.join(', ')}. They're ${info.priceRange} vehicles with strengths like ${info.strengths.join(', ').toLowerCase()}. Which model interests you?`;
        response.carData = { brand, info };
        response.suggestions = info.popularModels.map(model => ({
          text: model,
          action: 'view_details',
          value: model
        }));
        return response;
      }
    }

    // Default response
    response.text = "I'm here to help you find the perfect car! Are you looking to rent or buy? You can also ask me about specific car types, brands, or pricing.";
    response.suggestions = this.getSuggestions({ ...context, userIntent: 'initial' });
    return response;
  },

  // Car recommendation engine
  recommendCars: function(preferences) {
    const { carType, budget, brand, features, duration } = preferences;
    const recommendations = [];

    // Sample car data - in real implementation, this would come from database
    const sampleCars = [
      { 
        id: 1, 
        name: 'Toyota Corolla', 
        category: 'sedan', 
        brand: 'toyota', 
        price: 3500, 
        rating: 4.5, 
        features: ['fuel_efficient', 'reliable'],
        description: 'Comfortable and reliable sedan perfect for city driving',
        reasoning: 'Great value for money with excellent reliability'
      },
      { 
        id: 2, 
        name: 'Honda CR-V', 
        category: 'suv', 
        brand: 'honda', 
        price: 5500, 
        rating: 4.7, 
        features: ['spacious', 'safe'],
        description: 'Spacious SUV with hybrid technology for fuel efficiency',
        reasoning: 'Perfect for families with excellent safety features'
      },
      { 
        id: 3, 
        name: 'BMW 3 Series', 
        category: 'sedan', 
        brand: 'bmw', 
        price: 8000, 
        rating: 4.8, 
        features: ['luxury', 'performance'],
        description: 'Premium luxury sedan with advanced features and comfort',
        reasoning: 'Luxury experience with superior performance'
      },
      { 
        id: 4, 
        name: 'Tesla Model 3', 
        category: 'electric', 
        brand: 'tesla', 
        price: 7000, 
        rating: 4.9, 
        features: ['electric', 'tech_focused'],
        description: 'Futuristic electric sedan with autopilot capabilities',
        reasoning: 'Cutting-edge technology with zero emissions'
      },
      { 
        id: 5, 
        name: 'Toyota RAV4', 
        category: 'suv', 
        brand: 'toyota', 
        price: 6000, 
        rating: 4.6, 
        features: ['reliable', 'spacious'],
        description: 'Versatile SUV known for reliability and practicality',
        reasoning: 'Reliable SUV with great resale value'
      }
    ];

    // Filter based on preferences
    let filtered = sampleCars;
    
    if (carType) {
      filtered = filtered.filter(car => car.category === carType);
    }
    
    if (budget) {
      const budgetRanges = {
        low: { min: 0, max: 4000 },
        medium: { min: 4000, max: 7000 },
        high: { min: 7000, max: 10000 },
        luxury: { min: 10000, max: Infinity }
      };
      const range = budgetRanges[budget];
      if (range) {
        filtered = filtered.filter(car => car.price >= range.min && car.price <= range.max);
      }
    }
    
    if (brand) {
      filtered = filtered.filter(car => car.brand === brand);
    }

    // Sort by rating and return top 3
    return filtered
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map(car => ({
        ...car,
        description: this.generateCarDescription(car),
        reasonsToChoose: this.generateReasons(car, preferences)
      }));
  },

  // Generate car description
  generateCarDescription: function(car) {
    const category = this.categories[car.category];
    return `${car.name} is a ${category.name.toLowerCase()} with excellent rating of ${car.rating}/5. Known for ${car.features.join(' and ')}.`;
  },

  // Generate reasons to choose
  generateReasons: function(car, preferences) {
    const reasons = [];
    if (car.rating >= 4.5) reasons.push('High customer satisfaction');
    if (car.price < 5000) reasons.push('Great value for money');
    if (car.features.includes('electric')) reasons.push('Eco-friendly option');
    if (car.features.includes('spacious')) reasons.push('Perfect for families');
    return reasons;
  }
};