// Conversation State Manager for Smart ChatBot
const ConversationStateManager = {
  // Initialize conversation state
  initialState: {
    // User profile and preferences
    user: {
      id: null,
      name: null,
      preferences: {
        carType: null,
        budget: null,
        brand: null,
        features: [],
        location: null,
        duration: null
      },
      history: {
        previousQueries: [],
        viewedCars: [],
        comparedCars: [],
        bookedCars: []
      }
    },
    
    // Conversation flow state
    conversation: {
      stage: 'greeting', // greeting, exploring, comparing, deciding, booking
      intent: null, // rental, purchase, comparison, information
      context: {
        lastQuestion: null,
        lastResponse: null,
        suggestedCars: [],
        currentTopic: null
      },
      flags: {
        hasAskedBudget: false,
        hasAskedCarType: false,
        hasAskedDuration: false,
        hasShownRecommendations: false,
        needsClarification: false
      }
    },
    
    // Session information
    session: {
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      satisfactionScore: null
    }
  },

  // Current conversation state (will be updated during conversation)
  currentState: null,

  // Initialize or reset conversation
  initializeConversation: function(userId = null) {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    if (userId) {
      this.currentState.user.id = userId;
      this.loadUserPreferences(userId);
    }
    return this.currentState;
  },

  // Load user preferences from storage
  loadUserPreferences: function(userId) {
    try {
      const savedPreferences = localStorage.getItem(`userPreferences_${userId}`);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        this.currentState.user.preferences = { ...this.currentState.user.preferences, ...preferences };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  },

  // Save user preferences
  saveUserPreferences: function() {
    if (this.currentState.user.id) {
      try {
        localStorage.setItem(
          `userPreferences_${this.currentState.user.id}`,
          JSON.stringify(this.currentState.user.preferences)
        );
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  },

  // Update conversation state based on user message
  updateState: function(userMessage, botResponse) {
    const messageLower = userMessage.toLowerCase();
    
    // Update session info
    this.currentState.session.lastActivity = new Date();
    this.currentState.session.messageCount++;
    
    // Add to query history
    this.currentState.user.history.previousQueries.push({
      message: userMessage,
      timestamp: new Date(),
      intent: this.currentState.conversation.intent
    });
    
    // Detect intent
    this.detectIntent(messageLower);
    
    // Update conversation stage
    this.updateConversationStage(messageLower);
    
    // Extract and update preferences
    this.extractPreferences(messageLower);
    
    // Update context
    this.currentState.conversation.context.lastQuestion = userMessage;
    this.currentState.conversation.context.lastResponse = botResponse;
    
    // Update flags
    this.updateFlags(messageLower);
    
    // Save preferences
    this.saveUserPreferences();
    
    return this.currentState;
  },

  // Detect user intent
  detectIntent: function(message) {
    if (message.includes('rent') || message.includes('rental')) {
      this.currentState.conversation.intent = 'rental';
    } else if (message.includes('buy') || message.includes('purchase')) {
      this.currentState.conversation.intent = 'purchase';
    } else if (message.includes('compare') || message.includes('difference')) {
      this.currentState.conversation.intent = 'comparison';
    } else if (message.includes('price') || message.includes('cost')) {
      this.currentState.conversation.intent = 'information';
    }
  },

  // Update conversation stage based on context
  updateConversationStage: function(message) {
    const { stage, intent, flags } = this.currentState.conversation;
    
    // Transition logic
    if (stage === 'greeting' && intent) {
      this.currentState.conversation.stage = 'exploring';
    } else if (stage === 'exploring' && flags.hasAskedBudget && flags.hasAskedCarType) {
      this.currentState.conversation.stage = 'comparing';
    } else if (stage === 'comparing' && message.includes('select') || message.includes('choose')) {
      this.currentState.conversation.stage = 'deciding';
    } else if (stage === 'deciding' && message.includes('book') || message.includes('rent')) {
      this.currentState.conversation.stage = 'booking';
    }
  },

  // Extract preferences from user message
  extractPreferences: function(message) {
    const preferences = this.currentState.user.preferences;
    
    // Extract car type
    const carTypes = ['economy', 'sedan', 'suv', 'luxury', 'electric', 'hybrid'];
    for (const type of carTypes) {
      if (message.includes(type)) {
        preferences.carType = type;
        break;
      }
    }
    
    // Extract budget
    const budgetPatterns = [
      { pattern: /under\s*৳?(\d+)/, range: 'low' },
      { pattern: /below\s*৳?(\d+)/, range: 'low' },
      { pattern: /৳?(\d+)\s*-\s*৳?(\d+)/, range: 'medium' },
      { pattern: /between\s*৳?(\d+)\s*and\s*৳?(\d+)/, range: 'medium' },
      { pattern: /above\s*৳?(\d+)/, range: 'high' },
      { pattern: /over\s*৳?(\d+)/, range: 'high' }
    ];
    
    for (const { pattern, range } of budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        preferences.budget = range;
        break;
      }
    }
    
    // Extract brand
    const brands = ['toyota', 'honda', 'bmw', 'tesla', 'mercedes', 'audi', 'nissan'];
    for (const brand of brands) {
      if (message.includes(brand)) {
        preferences.brand = brand;
        break;
      }
    }
    
    // Extract duration
    if (message.includes('daily') || message.includes('day')) {
      preferences.duration = 'daily';
    } else if (message.includes('weekly') || message.includes('week')) {
      preferences.duration = 'weekly';
    } else if (message.includes('monthly') || message.includes('month')) {
      preferences.duration = 'monthly';
    }
    
    // Extract features
    const features = ['fuel efficient', 'spacious', 'luxury', 'safe', 'automatic', 'manual'];
    for (const feature of features) {
      if (message.includes(feature) && !preferences.features.includes(feature)) {
        preferences.features.push(feature);
      }
    }
  },

  // Update conversation flags
  updateFlags: function(message) {
    const flags = this.currentState.conversation.flags;
    
    if (message.includes('budget') || message.includes('price') || message.includes('cost')) {
      flags.hasAskedBudget = true;
    }
    
    if (message.includes('car') || message.includes('vehicle') || message.includes('model')) {
      flags.hasAskedCarType = true;
    }
    
    if (message.includes('day') || message.includes('week') || message.includes('month')) {
      flags.hasAskedDuration = true;
    }
    
    if (message.includes('recommend') || message.includes('suggest')) {
      flags.hasShownRecommendations = true;
    }
  },

  // Handle user action from suggestions
  handleAction: function(action, value = null, key = null) {
    switch (action) {
      case 'set_intent':
        this.currentState.conversation.intent = value;
        this.currentState.conversation.stage = 'exploring';
        break;
        
      case 'set_preference':
        if (key && value) {
          this.currentState.user.preferences[key] = value;
        }
        break;
        
      case 'view_details':
        // Will be handled by UI component
        break;
        
      case 'compare_cars':
        this.currentState.conversation.stage = 'comparing';
        break;
        
      case 'start_booking':
        this.currentState.conversation.stage = 'booking';
        break;
        
      default:
        console.log('Unknown action:', action);
    }
    
    this.saveUserPreferences();
    return this.currentState;
  },

  // Add car to user history
  addCarToHistory: function(car, action) {
    const history = this.currentState.user.history;
    
    switch (action) {
      case 'viewed':
        if (!history.viewedCars.find(c => c.id === car.id)) {
          history.viewedCars.push(car);
        }
        break;
        
      case 'compared':
        if (!history.comparedCars.find(c => c.id === car.id)) {
          history.comparedCars.push(car);
        }
        break;
        
      case 'booked':
        history.bookedCars.push({ ...car, bookedAt: new Date() });
        break;
    }
  },

  // Get next suggested questions based on state
  getNextSuggestions: function() {
    const { stage, intent, flags, context } = this.currentState.conversation;
    const preferences = this.currentState.user.preferences;
    const suggestions = [];
    
    // Stage-based suggestions
    switch (stage) {
      case 'greeting':
        suggestions.push(
          { text: 'I want to rent a car', action: 'set_intent', value: 'rental' },
          { text: 'I want to buy a car', action: 'set_intent', value: 'purchase' },
          { text: 'Compare car models', action: 'set_intent', value: 'comparison' },
          { text: 'Check pricing', action: 'set_intent', value: 'information' }
        );
        break;
        
      case 'exploring':
        if (!flags.hasAskedCarType) {
          suggestions.push(
            { text: 'Economy cars', action: 'set_preference', key: 'carType', value: 'economy' },
            { text: 'Sedans', action: 'set_preference', key: 'carType', value: 'sedan' },
            { text: 'SUVs', action: 'set_preference', key: 'carType', value: 'suv' },
            { text: 'Luxury cars', action: 'set_preference', key: 'carType', value: 'luxury' }
          );
        } else if (!flags.hasAskedBudget) {
          suggestions.push(
            { text: 'Budget-friendly', action: 'set_preference', key: 'budget', value: 'low' },
            { text: 'Mid-range', action: 'set_preference', key: 'budget', value: 'medium' },
            { text: 'Premium', action: 'set_preference', key: 'budget', value: 'high' }
          );
        } else if (!flags.hasAskedDuration && intent === 'rental') {
          suggestions.push(
            { text: 'Daily rental', action: 'set_preference', key: 'duration', value: 'daily' },
            { text: 'Weekly rental', action: 'set_preference', key: 'duration', value: 'weekly' },
            { text: 'Monthly rental', action: 'set_preference', key: 'duration', value: 'monthly' }
          );
        }
        break;
        
      case 'comparing':
        if (context.suggestedCars.length > 0) {
          suggestions.push(
            { text: 'View details', action: 'view_details' },
            { text: 'Compare selected', action: 'compare_cars' },
            { text: 'Check availability', action: 'check_availability' },
            { text: 'See more options', action: 'more_options' }
          );
        }
        break;
        
      case 'deciding':
        suggestions.push(
          { text: 'Book now', action: 'start_booking' },
          { text: 'Save for later', action: 'save_preference' },
          { text: 'Ask questions', action: 'ask_questions' },
          { text: 'Contact support', action: 'contact_support' }
        );
        break;
        
      case 'booking':
        suggestions.push(
          { text: 'Confirm booking', action: 'confirm_booking' },
          { text: 'Modify dates', action: 'modify_booking' },
          { text: 'Add extras', action: 'add_extras' },
          { text: 'Back to details', action: 'back_to_details' }
        );
        break;
    }
    
    // Add contextual suggestions based on preferences
    if (preferences.carType && !suggestions.find(s => s.text.toLowerCase().includes(preferences.carType))) {
      suggestions.push({
        text: `More ${preferences.carType} options`,
        action: 'more_options',
        value: preferences.carType
      });
    }
    
    return suggestions;
  }
};