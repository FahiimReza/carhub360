// Mock Database Functions for Local Development
// Replaces Trickle database API with localStorage-based solutions
// Following 3NF (Third Normal Form) principles for better data structure

// Enhanced error handling and logging
const logError = (operation, error, context = '') => {
  console.error(`Database ${operation} Error:`, {
    error: error.message || error,
    context,
    timestamp: new Date().toISOString()
  });
};

const logSuccess = (operation, context = '') => {
  console.log(`Database ${operation} Success:`, {
    context,
    timestamp: new Date().toISOString()
  });
};

// Initialize sample data for demonstration
const initializeSampleData = () => {
  // Check if sample data already exists
  const existingCars = JSON.parse(localStorage.getItem('cars') || '[]');
  if (existingCars.length === 0) {
    // Add sample cars
    const sampleCars = [
      {
        objectId: 'car_001',
        objectType: 'cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objectData: {
          brand: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          fuelType: 'Petrol',
          transmission: 'Automatic',
          seats: 5,
          rentPricePerDay: 3500,
          sellingPrice: 1800000,
          images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
          description: 'Comfortable and reliable sedan perfect for city driving',
          status: 'available',
          year: 2023,
          enginePower: '2000cc'
        }
      },
      {
        objectId: 'car_002',
        objectType: 'cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objectData: {
          brand: 'Honda',
          model: 'CR-V',
          category: 'SUV',
          fuelType: 'Hybrid',
          transmission: 'Automatic',
          seats: 7,
          rentPricePerDay: 5500,
          sellingPrice: 2500000,
          images: ['https://images.unsplash.com/photo-1549394348-f598835c62c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
          description: 'Spacious SUV with hybrid technology for fuel efficiency',
          status: 'available',
          year: 2023,
          enginePower: '1500cc'
        }
      },
      {
        objectId: 'car_003',
        objectType: 'cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objectData: {
          brand: 'BMW',
          model: 'X5',
          category: 'Luxury SUV',
          fuelType: 'Petrol',
          transmission: 'Automatic',
          seats: 7,
          rentPricePerDay: 12000,
          sellingPrice: 6500000,
          images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
          description: 'Premium luxury SUV with advanced features and comfort',
          status: 'available',
          year: 2024,
          enginePower: '3000cc'
        }
      },
      {
        objectId: 'car_004',
        objectType: 'cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objectData: {
          brand: 'Tesla',
          model: 'Model 3',
          category: 'Electric',
          fuelType: 'Electric',
          transmission: 'Automatic',
          seats: 5,
          rentPricePerDay: 8000,
          sellingPrice: 4500000,
          images: ['https://images.unsplash.com/photo-1554218826-9a8223a0ee7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
          description: 'Futuristic electric sedan with autopilot capabilities',
          status: 'available',
          year: 2024,
          enginePower: 'Electric'
        }
      },
      {
        objectId: 'car_005',
        objectType: 'cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objectData: {
          brand: 'Nissan',
          model: 'Micra',
          category: 'Hatchback',
          fuelType: 'Petrol',
          transmission: 'Manual',
          seats: 5,
          rentPricePerDay: 2500,
          sellingPrice: 1200000,
          images: ['https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
          description: 'Compact hatchback perfect for urban commuting',
          status: 'available',
          year: 2023,
          enginePower: '1200cc'
        }
      }
    ];
    
    localStorage.setItem('cars', JSON.stringify(sampleCars));
    logSuccess('initializeSampleData', 'Sample cars data initialized');
  }
};

// Mock trickleListObjects function
window.trickleListObjects = async (objectType, limit = 100, descent = true) => {
  const data = JSON.parse(localStorage.getItem(objectType) || '[]');
  const items = descent ? data.reverse() : data;
  
  return {
    items: items.slice(0, limit),
    nextPageToken: null
  };
};

// Mock trickleGetObject function
window.trickleGetObject = async (objectType, objectId) => {
  const data = JSON.parse(localStorage.getItem(objectType) || '[]');
  const item = data.find(obj => obj.objectId === objectId);
  
  if (!item) {
    throw new Error('Object not found');
  }
  
  return item;
};

// Enhanced trickleCreateObject function with validation and error handling
window.trickleCreateObject = async (objectType, objectData) => {
  try {
    // Validation
    if (!objectType || typeof objectType !== 'string') {
      throw new Error('Invalid objectType: must be a non-empty string');
    }
    
    if (!objectData || typeof objectData !== 'object') {
      throw new Error('Invalid objectData: must be an object');
    }

    // Email uniqueness check for users
    if (objectType === 'user' && objectData.email) {
      const existingUsers = JSON.parse(localStorage.getItem('user') || '[]');
      const emailExists = existingUsers.some(user =>
        user.objectData.email.toLowerCase() === objectData.email.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error('Email already exists. Please use a different email.');
      }
    }
    
    const data = JSON.parse(localStorage.getItem(objectType) || '[]');
    const newObject = {
      objectId: 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      objectType: objectType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      objectData: {
        ...objectData,
        status: objectData.status || 'active'
      }
    };
    
    data.push(newObject);
    localStorage.setItem(objectType, JSON.stringify(data));
    
    // Trigger real-time updates
    window.triggerDataUpdate(objectType, newObject);
    window.dispatchEvent(new CustomEvent(`${objectType}DataUpdated`, { detail: newObject }));
    
    // Special event dispatching for common types
    if (objectType === 'user') {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    }
    if (objectType.includes('booking')) {
      window.dispatchEvent(new CustomEvent('bookingDataUpdated'));
    }
    
    logSuccess('trickleCreateObject', `Created ${objectType} with ID: ${newObject.objectId}`);
    return newObject;
  } catch (error) {
    logError('trickleCreateObject', error, `objectType: ${objectType}`);
    throw error;
  }
};

// Mock trickleUpdateObject function
window.trickleUpdateObject = async (objectType, objectId, objectData) => {
  try {
    const data = JSON.parse(localStorage.getItem(objectType) || '[]');
    const index = data.findIndex(obj => obj.objectId === objectId);
    
    if (index === -1) {
      throw new Error('Object not found');
    }
    
    data[index].objectData = { ...data[index].objectData, ...objectData };
    data[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem(objectType, JSON.stringify(data));
    
    // Trigger real-time updates
    window.triggerDataUpdate(objectType, data[index]);
    window.dispatchEvent(new CustomEvent(`${objectType}DataUpdated`, { detail: data[index] }));
    
    if (objectType === 'user') {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    }
    
    logSuccess('trickleUpdateObject', `Updated ${objectType} with ID: ${objectId}`);
    return data[index];
  } catch (error) {
    logError('trickleUpdateObject', error, `objectType: ${objectType}, objectId: ${objectId}`);
    throw error;
  }
};

// Mock trickleDeleteObject function
window.trickleDeleteObject = async (objectType, objectId) => {
  try {
    const data = JSON.parse(localStorage.getItem(objectType) || '[]');
    const deletedObject = data.find(obj => obj.objectId === objectId);
    
    if (!deletedObject) {
      throw new Error('Object not found');
    }
    
    const filteredData = data.filter(obj => obj.objectId !== objectId);
    localStorage.setItem(objectType, JSON.stringify(filteredData));
    
    // Trigger real-time updates
    window.triggerDataUpdate(`${objectType}_deleted`, { objectId, deletedObject });
    window.dispatchEvent(new CustomEvent(`${objectType}DataDeleted`, { detail: { objectId, deletedObject } }));
    window.dispatchEvent(new CustomEvent(`${objectType}DataUpdated`));
    
    if (objectType === 'user') {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    }
    
    logSuccess('trickleDeleteObject', `Deleted ${objectType} with ID: ${objectId}`);
  } catch (error) {
    logError('trickleDeleteObject', error, `objectType: ${objectType}, objectId: ${objectId}`);
    throw error;
  }
};

// Enhanced OTP functions with real email sending
const otpStorage = new Map();

window.generateOTP = async (email) => {
  const otp = window.generateSecureOTP();
  const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStorage.set(email, {
    otp: otp,
    expiryTime: expiryTime,
    attempts: 0
  });
  
  // Send OTP via email
  const emailResult = await window.sendOTPEmail(email, otp);
  
  if (!emailResult.success) {
    console.error('Failed to send OTP email:', emailResult.message);
  }
  
  return { otp, emailSent: emailResult.success, message: emailResult.message };
};

window.verifyOTP = (email, inputOtp) => {
  const otpData = otpStorage.get(email);
  
  if (!otpData) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (Date.now() > otpData.expiryTime) {
    otpStorage.delete(email);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (otpData.attempts >= 3) {
    otpStorage.delete(email);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (otpData.otp === inputOtp) {
    otpStorage.delete(email);
    return { success: true, message: 'OTP verified successfully!' };
  } else {
    otpData.attempts += 1;
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }
};



// Enhanced Smart ChatBot Response System
window.invokeAIAgent = async (systemPrompt, userPrompt) => {
  // Smart response database with contextual understanding
  const responses = {
    // Car rental pricing with context awareness
    'car rental prices': {
      text: "Our car rental prices in Bangladesh start from ৳2,500/day for economy cars, ৳4,500/day for sedans, and ৳8,000/day for SUVs. Premium vehicles begin at ৳15,000/day. Weekly bookings get 15% off, and monthly bookings save 30%! Would you like prices for a specific car type or rental period?",
      followUp: ["Economy cars", "Sedan prices", "SUV rates", "Weekly deals", "Monthly discounts"]
    },
    'car prices': {
      text: "For car purchases, we offer competitive pricing with verified dealers. Economy cars start at ৳12 lakh, sedans from ৳18 lakh, SUVs from ৳25 lakh, and luxury vehicles from ৳60 lakh. We also provide easy financing options with as low as 20% down payment. What type of vehicle are you interested in?",
      followUp: ["Economy cars", "Sedan options", "SUV models", "Financing details", "Trade-in options"]
    },
    'pricing': {
      text: "I'd be happy to help with pricing! Are you looking for rental prices or purchase prices? Rental starts at ৳2,500/day, while purchase options begin at ৳12 lakh. Both have flexible payment options and special offers for longer commitments.",
      followUp: ["Rental prices", "Purchase prices", "Special offers", "Payment options"]
    },
    'available locations': {
      text: "CarHub360 operates in all major cities across Bangladesh: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, and Rangpur. We offer home delivery within city limits and have pickup points at airports and train stations. Which location are you interested in?",
      followUp: ["Airport pickup", "Home delivery", "City availability", "Airport locations"]
    },
    'booking process': {
      text: "Booking with CarHub360 is simple: 1) Select dates and location 2) Choose your preferred vehicle 3) Provide driver details 4) Make payment (we accept bKash, Nagad, cards, and cash) 5) Receive instant confirmation. The whole process takes less than 5 minutes! Would you like me to guide you through any specific step?",
      followUp: ["Payment options", "Driver requirements", "Instant confirmation", "Cancellation policy"]
    },
    'how to buy': {
      text: "To buy a car through CarHub360: 1) Browse our verified inventory 2) Schedule a test drive 3) Complete documentation 4) Arrange financing if needed 5) Finalize purchase with transparent pricing. We also provide post-purchase support including insurance and maintenance. What type of car are you considering?",
      followUp: ["Test drive booking", "Financing options", "Documentation needed", "Post-purchase support"]
    },
    'contact support': {
      text: "Our 24/7 support team is ready to help! Call us at +880 1700-000000, email hello@carhub360.com, or use this live chat. For urgent matters, calls are answered immediately. For less urgent queries, emails typically receive responses within 2 hours. How can I assist you right now?",
      followUp: ["Urgent assistance", "Email response time", "Live chat benefits", "Callback request"]
    },
    'requirements': {
      text: "To rent a car, you need: Valid Bangladeshi driving license (at least 1 year old), National ID or Passport, and minimum age of 21 years. For international visitors, we accept valid international driving licenses along with passports. Tourists need additional security deposits. Do you meet these requirements?",
      followUp: ["International visitors", "Security deposits", "License verification", "Age restrictions"]
    },
    'insurance': {
      text: "All our rentals include comprehensive insurance covering third-party liability, own damage, and personal accident for driver and passengers. Additional coverage is available for ৳500/day including zero depreciation and consumables. For purchased vehicles, we assist with first-year insurance setup.",
      followUp: ["Additional coverage", "Zero deductible", "Claim process", "Vehicle purchase insurance"]
    },
    'payment': {
      text: "We accept multiple payment methods: Mobile banking (bKash, Nagad, Rocket), Credit/Debit cards, Bank transfers, and cash. For rentals, 50% advance is required, with the remainder due at pickup. For purchases, flexible payment plans are available with 20% down payment and 5-year financing options.",
      followUp: ["Mobile banking", "Financing options", "Refund policy", "Payment security"]
    }
  };
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Check for exact matches first
  for (const [key, response] of Object.entries(responses)) {
    if (lowerPrompt.includes(key.replace(/\s+/g, '')) ||
        lowerPrompt.includes(key) ||
        key.split(' ').every(word => lowerPrompt.includes(word))) {
      return response.text;
    }
  }
  
  // Check for partial keyword matches
  const keywordMap = {
    'price': ['pricing', 'car rental prices', 'car prices'],
    'rental': ['car rental prices', 'booking process', 'requirements', 'insurance'],
    'buy': ['how to buy', 'car prices', 'payment'],
    'cost': ['pricing', 'car rental prices', 'car prices'],
    'location': ['available locations'],
    'where': ['available locations'],
    'book': ['booking process'],
    'reserve': ['booking process'],
    'support': ['contact support'],
    'help': ['contact support'],
    'pay': ['payment'],
    'payment': ['payment'],
    'insurance': ['insurance'],
    'document': ['requirements'],
    'license': ['requirements'],
    'finance': ['payment', 'how to buy'],
    'loan': ['payment', 'how to buy']
  };
  
  for (const [keyword, keys] of Object.entries(keywordMap)) {
    if (lowerPrompt.includes(keyword)) {
      for (const key of keys) {
        if (responses[key]) {
          return responses[key].text;
        }
      }
    }
  }
  
  // Check for car types mentioned in the query
  const carTypes = ['economy', 'sedan', 'suv', 'luxury', 'premium', 'sports', 'hybrid', 'electric'];
  for (const carType of carTypes) {
    if (lowerPrompt.includes(carType)) {
      return `Great choice! Our ${carType} vehicles offer excellent value and comfort. ${carType === 'economy' ? 'They start at ৳2,500/day for rentals and ৳12 lakh for purchases.' : carType === 'sedan' ? 'They start at ৳4,500/day for rentals and ৳18 lakh for purchases.' : carType === 'suv' ? 'They start at ৳8,000/day for rentals and ৳25 lakh for purchases.' : carType === 'luxury' || carType === 'premium' ? 'They start at ৳15,000/day for rentals and ৳60 lakh for purchases.' : ''} Would you like to see specific ${carType} models available?`;
    }
  }
  
  // Default contextual response based on query length and complexity
  if (lowerPrompt.length < 10) {
    return "I'd be happy to help! Could you provide more details about what you'd like to know? For example, you can ask about rental prices, car purchasing, locations, or booking process.";
  } else if (lowerPrompt.includes('?')) {
    return "That's a great question! While I can provide general information, our support team can give you more specific details. You can reach them at +880 1700-000000 or hello@carhub360.com. Is there anything else I can help with?";
  } else {
    return "Thank you for your inquiry! Based on what you've mentioned, I recommend contacting our expert team at +880 1700-000000 for personalized assistance. They're available 24/7 and can provide detailed information tailored to your needs. Is there something specific about car rental or purchasing I can help with right now?";
  }
};

// Real-time data update system
window.dataUpdateListeners = new Map();

// Add data update listener
window.addDataUpdateListener = (objectType, callback) => {
  if (!window.dataUpdateListeners.has(objectType)) {
    window.dataUpdateListeners.set(objectType, new Set());
  }
  window.dataUpdateListeners.get(objectType).add(callback);
};

// Remove data update listener
window.removeDataUpdateListener = (objectType, callback) => {
  if (window.dataUpdateListeners.has(objectType)) {
    window.dataUpdateListeners.get(objectType).delete(callback);
  }
};

// Trigger data update for listeners
window.triggerDataUpdate = (objectType, data) => {
  if (window.dataUpdateListeners.has(objectType)) {
    window.dataUpdateListeners.get(objectType).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in data update listener:', error);
      }
    });
  }
};

// Authentication helper functions
window.getCurrentUser = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      return JSON.parse(currentUser);
    } catch (error) {
      console.error('Error parsing current user:', error);
      localStorage.removeItem('currentUser');
    }
  }
  return null;
};

window.setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

window.isUserLoggedIn = () => {
  return window.getCurrentUser() !== null;
};

// Booking permission helpers
window.canConfirmBooking = (user) => {
  return user && user.objectData && user.objectData.role === 'admin';
};

window.canDeleteBooking = (user, booking) => {
  if (!user) return false;
  const isAdmin = user.objectData && user.objectData.role === 'admin';
  const isOwner = booking.objectData.customerEmail === user.objectData.email;
  return isAdmin || isOwner;
};

// Initialize on load (no sample data)
initializeSampleData();
