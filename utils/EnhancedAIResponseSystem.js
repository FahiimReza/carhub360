// Enhanced AI Response System with Real Car Database Integration
const EnhancedAIResponseSystem = {
  // Initialize the system
  initialize: function() {
    this.responseCache = new Map();
    this.userContextCache = new Map();
  },

  // Generate intelligent response with real data
  generateResponse: async function(userMessage, conversationState) {
    const cacheKey = `${userMessage}_${JSON.stringify(conversationState?.user?.preferences || {})}`;
    
    // Check cache first
    if (this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
        return cached.response;
      }
    }

    // Generate new response
    const response = await this.processMessage(userMessage, conversationState);
    
    // Cache the response
    this.responseCache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });

    return response;
  },

  // Process message and generate response
  processMessage: async function(message, conversationState) {
    const lowerMessage = message.toLowerCase();
    const userPreferences = conversationState?.user?.preferences || {};
    const conversationStage = conversationState?.conversation?.stage || 'greeting';
    
    let response = {
      text: '',
      suggestions: [],
      carData: null,
      actionRequired: false,
      confidence: 0.5
    };

    // Handle different message types
    if (this.isGreeting(lowerMessage)) {
      response = this.handleGreeting(conversationState);
    } else if (this.isRentalInquiry(lowerMessage)) {
      response = await this.handleRentalInquiry(lowerMessage, userPreferences);
    } else if (this.isPurchaseInquiry(lowerMessage)) {
      response = await this.handlePurchaseInquiry(lowerMessage, userPreferences);
    } else if (this.isComparisonRequest(lowerMessage)) {
      response = await this.handleComparisonRequest(lowerMessage, userPreferences);
    } else if (this.isSpecificCarInquiry(lowerMessage)) {
      response = await this.handleSpecificCarInquiry(lowerMessage, userPreferences);
    } else if (this.isFeatureInquiry(lowerMessage)) {
      response = await this.handleFeatureInquiry(lowerMessage, userPreferences);
    } else if (this.isPricingInquiry(lowerMessage)) {
      response = await this.handlePricingInquiry(lowerMessage, userPreferences);
    } else if (this.isAvailabilityInquiry(lowerMessage)) {
      response = await this.handleAvailabilityInquiry(lowerMessage, userPreferences);
    } else {
      response = this.handleGeneralInquiry(lowerMessage, conversationState);
    }

    // Enhance response with contextual suggestions
    response.suggestions = this.enhanceSuggestions(response.suggestions, conversationState, userPreferences);
    
    return response;
  },

  // Handle greeting messages
  handleGreeting: function(conversationState) {
    const hasHistory = conversationState?.user?.history?.previousQueries?.length > 0;
    
    if (hasHistory) {
      return {
        text: "Welcome back! I remember you were interested in cars. Would you like to continue where we left off, or start fresh?",
        suggestions: [
          { text: 'Continue previous search', action: 'continue_search' },
          { text: 'Start fresh', action: 'reset_conversation' },
          { text: 'View saved cars', action: 'view_saved' },
          { text: 'New search', action: 'new_search' }
        ],
        confidence: 0.9
      };
    } else {
      return {
        text: "👋 Welcome to CarHub360! I'm your intelligent car assistant. I can help you find the perfect car for rent or purchase, compare models, check availability, and more. What are you looking for today?",
        suggestions: [
          { text: 'I want to rent a car', action: 'set_intent', value: 'rental' },
          { text: 'I want to buy a car', action: 'set_intent', value: 'purchase' },
          { text: 'Compare car models', action: 'set_intent', value: 'comparison' },
          { text: 'Browse available cars', action: 'browse_inventory' }
        ],
        confidence: 0.9
      };
    }
  },

  // Handle rental inquiries with real data
  handleRentalInquiry: async function(message, userPreferences) {
    try {
      // Simulate API call to get available cars
      const cars = await this.getAvailableCars(userPreferences);
      
      if (cars.length === 0) {
        return {
          text: "I don't see any available cars matching your current preferences. Would you like to broaden your search criteria or check different dates?",
          suggestions: [
            { text: 'Expand search criteria', action: 'expand_search' },
            { text: 'Change dates', action: 'change_dates' },
            { text: 'Show all available', action: 'show_all' },
            { text: 'Contact support', action: 'contact_support' }
          ],
          confidence: 0.7
        };
      }

      const topCars = cars.slice(0, 3);
      const priceRange = this.calculatePriceRange(topCars);
      
      return {
        text: `Great! I found ${cars.length} cars available for rent. Prices range from ৳${priceRange.min}/day to ৳${priceRange.max}/day. Here are the best options:\n\n${this.formatCarList(topCars)}`,
        carData: topCars,
        suggestions: [
          { text: 'View car details', action: 'view_details' },
          { text: 'Compare selected', action: 'compare_cars' },
          { text: 'Filter by price', action: 'filter_price' },
          { text: 'See more options', action: 'more_options' }
        ],
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error handling rental inquiry:', error);
      return {
        text: "I'm having trouble finding rental cars right now. Would you like me to try a different approach?",
        suggestions: [
          { text: 'Try different search', action: 'different_search' },
          { text: 'Browse all cars', action: 'browse_all' },
          { text: 'Contact support', action: 'contact_support' }
        ],
        confidence: 0.5
      };
    }
  },

  // Handle purchase inquiries with real data
  handlePurchaseInquiry: async function(message, userPreferences) {
    try {
      const cars = await this.getCarsForSale(userPreferences);
      
      if (cars.length === 0) {
        return {
          text: "I don't see any cars for sale matching your current preferences. Would you like to adjust your budget or explore different categories?",
          suggestions: [
            { text: 'Adjust budget', action: 'adjust_budget' },
            { text: 'Different category', action: 'change_category' },
            { text: 'Show all cars', action: 'show_all' },
            { text: 'Get financing help', action: 'financing_help' }
          ],
          confidence: 0.7
        };
      }

      const topCars = cars.slice(0, 3);
      const priceRange = this.calculatePriceRange(topCars);
      
      return {
        text: `Excellent! I found ${cars.length} cars for purchase. Prices range from ৳${priceRange.min} to ৳${priceRange.max}. Here are the best options:\n\n${this.formatCarList(topCars)}`,
        carData: topCars,
        suggestions: [
          { text: 'View car details', action: 'view_details' },
          { text: 'Calculate financing', action: 'calculate_financing' },
          { text: 'Schedule test drive', action: 'schedule_test_drive' },
          { text: 'See more options', action: 'more_options' }
        ],
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error handling purchase inquiry:', error);
      return {
        text: "I'm having trouble finding cars for purchase right now. Would you like me to try a different approach?",
        suggestions: [
          { text: 'Try different search', action: 'different_search' },
          { text: 'Browse all cars', action: 'browse_all' },
          { text: 'Contact support', action: 'contact_support' }
        ],
        confidence: 0.5
      };
    }
  },

  // Handle comparison requests
  handleComparisonRequest: async function(message, userPreferences) {
    const carsToCompare = this.extractCarsForComparison(message, userPreferences);
    
    if (carsToCompare.length < 2) {
      return {
        text: "To compare cars, I need at least 2 models. Which cars would you like to compare?",
        suggestions: [
          { text: 'Show popular cars', action: 'show_popular' },
          { text: 'Compare by category', action: 'compare_category' },
          { text: 'Compare by price', action: 'compare_price' },
          { text: 'Help me choose', action: 'help_choose' }
        ],
        confidence: 0.6
      };
    }

    try {
      const comparison = await this.compareCars(carsToCompare);
      
      return {
        text: `Here's your comparison:\n\n${this.formatComparison(comparison)}`,
        carData: comparison,
        suggestions: [
          { text: 'View detailed comparison', action: 'detailed_comparison' },
          { text: 'Select favorite', action: 'select_favorite' },
          { text: 'Add more cars', action: 'add_more_cars' },
          { text: 'Book selected car', action: 'book_selected' }
        ],
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error handling comparison request:', error);
      return {
        text: "I'm having trouble comparing these cars right now. Would you like to try different ones?",
        suggestions: [
          { text: 'Try different cars', action: 'different_cars' },
          { text: 'Browse popular models', action: 'browse_popular' },
          { text: 'Get help choosing', action: 'help_choose' }
        ],
        confidence: 0.5
      };
    }
  },

  // Handle specific car inquiries
  handleSpecificCarInquiry: async function(message, userPreferences) {
    const carModel = this.extractCarModel(message);
    
    if (!carModel) {
      return {
        text: "I'm not sure which car model you're asking about. Could you be more specific?",
        suggestions: [
          { text: 'Show car brands', action: 'show_brands' },
          { text: 'Show car categories', action: 'show_categories' },
          { text: 'Popular models', action: 'popular_models' },
          { text: 'Search by feature', action: 'search_feature' }
        ],
        confidence: 0.4
      };
    }

    try {
      const carDetails = await this.getCarDetails(carModel);
      const similarCars = await this.getSimilarCars(carModel, userPreferences);
      
      return {
        text: `Here are the details for ${carModel}:\n\n${this.formatCarDetails(carDetails)}\n\nWould you like to see similar cars or proceed with booking?`,
        carData: { details: carDetails, similar: similarCars },
        suggestions: [
          { text: 'Book this car', action: 'book_car', value: carModel },
          { text: 'View similar cars', action: 'view_similar' },
          { text: 'Check availability', action: 'check_availability', value: carModel },
          { text: 'Ask questions', action: 'ask_questions', value: carModel }
        ],
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error handling specific car inquiry:', error);
      return {
        text: `I'm having trouble finding information about ${carModel}. Would you like to try a different search?`,
        suggestions: [
          { text: 'Try different model', action: 'different_model' },
          { text: 'Browse all cars', action: 'browse_all' },
          { text: 'Get help', action: 'get_help' }
        ],
        confidence: 0.5
      };
    }
  },

  // Handle general inquiries
  handleGeneralInquiry: function(message, conversationState) {
    return {
      text: "I'm here to help you find the perfect car! You can ask me about:\n• Car rentals and purchases\n• Specific car models and features\n• Pricing and availability\n• Comparisons between cars\n• Booking and financing options\n\nWhat would you like to know?",
      suggestions: [
        { text: 'Show car categories', action: 'show_categories' },
        { text: 'Browse inventory', action: 'browse_inventory' },
        { text: 'Check prices', action: 'check_prices' },
        { text: 'Get help', action: 'get_help' }
      ],
      confidence: 0.5
    };
  },

  // Helper methods for message analysis
  isGreeting: function(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'welcome'];
    return greetings.some(greeting => message.includes(greeting));
  },

  isRentalInquiry: function(message) {
    const rentalKeywords = ['rent', 'rental', 'hire', 'lease', 'borrow'];
    return rentalKeywords.some(keyword => message.includes(keyword));
  },

  isPurchaseInquiry: function(message) {
    const purchaseKeywords = ['buy', 'purchase', 'own', 'finance', 'loan'];
    return purchaseKeywords.some(keyword => message.includes(keyword));
  },

  isComparisonRequest: function(message) {
    const comparisonKeywords = ['compare', 'difference', 'versus', 'vs', 'better'];
    return comparisonKeywords.some(keyword => message.includes(keyword));
  },

  isSpecificCarInquiry: function(message) {
    const brands = ['toyota', 'honda', 'bmw', 'tesla', 'mercedes', 'audi', 'nissan', 'hyundai'];
    const models = ['corolla', 'civic', 'camry', 'rav4', 'model 3', 'x5', 'accord'];
    return brands.some(brand => message.includes(brand)) || 
           models.some(model => message.includes(model));
  },

  isFeatureInquiry: function(message) {
    const featureKeywords = ['feature', 'spec', 'specification', 'safety', 'fuel', 'efficiency'];
    return featureKeywords.some(keyword => message.includes(keyword));
  },

  isPricingInquiry: function(message) {
    const priceKeywords = ['price', 'cost', 'budget', 'afford', 'cheap', 'expensive'];
    return priceKeywords.some(keyword => message.includes(keyword));
  },

  isAvailabilityInquiry: function(message) {
    const availabilityKeywords = ['available', 'availability', 'when', 'dates', 'schedule'];
    return availabilityKeywords.some(keyword => message.includes(keyword));
  },

  // Data extraction methods
  extractCarModel: function(message) {
    const brands = ['toyota', 'honda', 'bmw', 'tesla', 'mercedes', 'audi', 'nissan', 'hyundai'];
    const models = ['corolla', 'civic', 'camry', 'rav4', 'model 3', 'x5', 'accord', 'cr-v'];
    
    for (const brand of brands) {
      if (message.includes(brand)) {
        for (const model of models) {
          if (message.includes(model)) {
            return `${brand} ${model}`;
          }
        }
        return brand;
      }
    }
    
    for (const model of models) {
      if (message.includes(model)) {
        return model;
      }
    }
    
    return null;
  },

  extractCarsForComparison: function(message, userPreferences) {
    const cars = [];
    const model = this.extractCarModel(message);
    
    if (model) {
      cars.push(model);
    }
    
    // Add user's previously viewed cars
    if (userPreferences.history?.viewedCars) {
      cars.push(...userPreferences.history.viewedCars.slice(0, 2));
    }
    
    return cars;
  },

  // Data formatting methods
  formatCarList: function(cars) {
    return cars.map((car, index) => 
      `${index + 1}. ${car.name} - ৳${car.price}/day\n   ${car.description || 'Great option for your needs'}\n   Rating: ${car.rating || '4.5'}/5`
    ).join('\n\n');
  },

  formatCarDetails: function(car) {
    return `• Price: ৳${car.price || '5000'}/day\n• Category: ${car.category || 'Sedan'}\n• Seats: ${car.seats || '5'}\n• Fuel: ${car.fuel || 'Petrol'}\n• Transmission: ${car.transmission || 'Automatic'}\n• Features: ${car.features?.join(', ') || 'Modern features'}\n• Rating: ${car.rating || '4.5'}/5`;
  },

  formatComparison: function(comparison) {
    return comparison.map(car => 
      `${car.name}:\n• Price: ৳${car.price}/day\n• Rating: ${car.rating || '4.5'}/5\n• Best for: ${car.bestFor || 'Daily driving'}`
    ).join('\n\n');
  },

  calculatePriceRange: function(cars) {
    const prices = cars.map(car => car.price || 5000);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  },

  // Enhance suggestions based on context
  enhanceSuggestions: function(baseSuggestions, conversationState, userPreferences) {
    const enhanced = [...baseSuggestions];
    
    // Add personalized suggestions
    if (userPreferences.carType) {
      enhanced.push({
        text: `More ${userPreferences.carType} options`,
        action: 'more_category',
        value: userPreferences.carType
      });
    }
    
    if (userPreferences.budget) {
      enhanced.push({
        text: 'Adjust budget',
        action: 'adjust_budget'
      });
    }
    
    // Add contextual suggestions based on conversation stage
    if (conversationState?.conversation?.stage === 'comparing') {
      enhanced.push({
        text: 'View comparison',
        action: 'view_comparison'
      });
    }
    
    return enhanced.slice(0, 6); // Limit to 6 suggestions
  },

  // Mock API methods (in real implementation, these would make actual API calls)
  async getAvailableCars(preferences) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data based on preferences
    const mockCars = [
      { id: 1, name: 'Toyota Corolla', price: 3500, rating: 4.5, category: 'sedan', description: 'Reliable and comfortable' },
      { id: 2, name: 'Honda CR-V', price: 5500, rating: 4.7, category: 'suv', description: 'Spacious and family-friendly' },
      { id: 3, name: 'BMW 3 Series', price: 8000, rating: 4.8, category: 'sedan', description: 'Luxury and performance' }
    ];
    
    if (preferences.carType) {
      return mockCars.filter(car => car.category === preferences.carType);
    }
    
    return mockCars;
  },

  async getCarsForSale(preferences) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for purchase
    const mockCars = [
      { id: 4, name: 'Toyota Camry', price: 1800000, rating: 4.6, category: 'sedan', description: 'Comfortable family sedan' },
      { id: 5, name: 'Honda CR-V', price: 2500000, rating: 4.7, category: 'suv', description: 'Versatile SUV' },
      { id: 6, name: 'Tesla Model 3', price: 4500000, rating: 4.9, category: 'electric', description: 'Modern electric sedan' }
    ];
    
    if (preferences.carType) {
      return mockCars.filter(car => car.category === preferences.carType);
    }
    
    return mockCars;
  },

  async getCarDetails(carModel) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock car details
    return {
      name: carModel,
      price: 5000,
      rating: 4.5,
      category: 'sedan',
      seats: 5,
      fuel: 'Petrol',
      transmission: 'Automatic',
      features: ['Air conditioning', 'Bluetooth', 'GPS']
    };
  },

  async getSimilarCars(carModel, preferences) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock similar cars
    return [
      { id: 7, name: 'Similar Car 1', price: 4500, rating: 4.4 },
      { id: 8, name: 'Similar Car 2', price: 5500, rating: 4.6 }
    ];
  },

  async compareCars(cars) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock comparison data
    return cars.map(car => ({
      name: car,
      price: 5000,
      rating: 4.5,
      bestFor: 'Daily commuting and family use'
    }));
  }
};

// Initialize the system
EnhancedAIResponseSystem.initialize();