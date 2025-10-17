// Intelligent Follow-Up Question System for Natural Conversations
const FollowUpQuestionSystem = {
  // Initialize the follow-up system
  initialize: function() {
    this.questionHistory = new Map();
    this.contextualQuestions = new Map();
    this.userResponsePatterns = new Map();
    this.conversationGoals = new Map();
  },

  // Generate intelligent follow-up questions based on context
  generateFollowUpQuestions: function(conversationState, lastResponse, userMessage) {
    const context = this.analyzeContext(conversationState, lastResponse, userMessage);
    const questions = [];

    // Determine the type of follow-up needed
    switch (context.stage) {
      case 'initial_exploration':
        questions.push(...this.getInitialExplorationQuestions(context));
        break;
      case 'preference_gathering':
        questions.push(...this.getPreferenceGatheringQuestions(context));
        break;
      case 'recommendation_shown':
        questions.push(...this.getRecommendationQuestions(context));
        break;
      case 'decision_making':
        questions.push(...this.getDecisionMakingQuestions(context));
        break;
      case 'booking_process':
        questions.push(...this.getBookingQuestions(context));
        break;
      case 'post_recommendation':
        questions.push(...this.getPostRecommendationQuestions(context));
        break;
      default:
        questions.push(...this.getGeneralFollowUpQuestions(context));
    }

    // Personalize questions based on user history
    return this.personalizeQuestions(questions, conversationState);
  },

  // Analyze conversation context
  analyzeContext: function(conversationState, lastResponse, userMessage) {
    const userPreferences = conversationState?.user?.preferences || {};
    const conversationStage = conversationState?.conversation?.stage || 'greeting';
    const messageHistory = conversationState?.user?.history?.previousQueries || [];
    
    return {
      stage: conversationStage,
      userPreferences: userPreferences,
      messageHistory: messageHistory,
      lastResponse: lastResponse,
      userMessage: userMessage,
      hasCarData: lastResponse?.carData?.length > 0,
      missingInfo: this.identifyMissingInformation(userPreferences),
      userIntent: conversationState?.conversation?.intent,
      previousQuestions: this.getPreviousQuestions(conversationState),
      responsePatterns: this.analyzeResponsePatterns(messageHistory)
    };
  },

  // Identify missing information to guide follow-up questions
  identifyMissingInformation: function(preferences) {
    const missing = [];
    
    if (!preferences.carType) missing.push('carType');
    if (!preferences.budget) missing.push('budget');
    if (!preferences.duration && preferences.intent === 'rental') missing.push('duration');
    if (!preferences.location) missing.push('location');
    if (!preferences.features || preferences.features.length === 0) missing.push('features');
    
    return missing;
  },

  // Get initial exploration questions
  getInitialExplorationQuestions: function(context) {
    const questions = [];
    
    if (context.userIntent === 'rental') {
      questions.push({
        text: "What type of trip are you planning? This helps me suggest the perfect car.",
        type: 'trip_purpose',
        options: [
          { text: 'Daily commute', action: 'set_preference', key: 'purpose', value: 'commute' },
          { text: 'Weekend getaway', action: 'set_preference', key: 'purpose', value: 'weekend' },
          { text: 'Family vacation', action: 'set_preference', key: 'purpose', value: 'family' },
          { text: 'Business trip', action: 'set_preference', key: 'purpose', value: 'business' }
        ]
      });
    } else if (context.userIntent === 'purchase') {
      questions.push({
        text: "What's most important to you in your new car?",
        type: 'purchase_priority',
        options: [
          { text: 'Fuel efficiency', action: 'set_preference', key: 'priority', value: 'fuel_efficiency' },
          { text: 'Safety features', action: 'set_preference', key: 'priority', value: 'safety' },
          { text: 'Comfort and space', action: 'set_preference', key: 'priority', value: 'comfort' },
          { text: 'Performance', action: 'set_preference', key: 'priority', value: 'performance' }
        ]
      });
    }
    
    return questions;
  },

  // Get preference gathering questions
  getPreferenceGatheringQuestions: function(context) {
    const questions = [];
    const { missingInfo, userPreferences } = context;
    
    if (missingInfo.includes('carType')) {
      questions.push({
        text: "What type of car suits your needs best?",
        type: 'car_type',
        options: [
          { text: 'Economy - Budget-friendly', action: 'set_preference', key: 'carType', value: 'economy' },
          { text: 'Sedan - Comfortable for families', action: 'set_preference', key: 'carType', value: 'sedan' },
          { text: 'SUV - Spacious and versatile', action: 'set_preference', key: 'carType', value: 'suv' },
          { text: 'Luxury - Premium experience', action: 'set_preference', key: 'carType', value: 'luxury' }
        ]
      });
    }
    
    if (missingInfo.includes('budget')) {
      const budgetContext = userPreferences.carType ? 
        `for ${userPreferences.carType} cars` : 'for your rental';
      
      questions.push({
        text: `What's your daily budget ${budgetContext}?`,
        type: 'budget',
        options: [
          { text: 'Budget-friendly (Under ৳4,000)', action: 'set_preference', key: 'budget', value: 'low' },
          { text: 'Mid-range (৳4,000-7,000)', action: 'set_preference', key: 'budget', value: 'medium' },
          { text: 'Premium (৳7,000-12,000)', action: 'set_preference', key: 'budget', value: 'high' },
          { text: 'Luxury (Above ৳12,000)', action: 'set_preference', key: 'budget', value: 'luxury' }
        ]
      });
    }
    
    if (missingInfo.includes('duration') && context.userIntent === 'rental') {
      questions.push({
        text: "How long do you need the car? Longer rentals have better discounts!",
        type: 'duration',
        options: [
          { text: 'Just for today', action: 'set_preference', key: 'duration', value: 'daily' },
          { text: 'A few days (3-6 days)', action: 'set_preference', key: 'duration', value: 'weekly' },
          { text: 'A week or more', action: 'set_preference', key: 'duration', value: 'weekly' },
          { text: 'Monthly rental', action: 'set_preference', key: 'duration', value: 'monthly' }
        ]
      });
    }
    
    return questions;
  },

  // Get recommendation questions
  getRecommendationQuestions: function(context) {
    const questions = [];
    const { hasCarData, lastResponse } = context;
    
    if (hasCarData) {
      const carCount = lastResponse.carData.length;
      
      questions.push({
        text: `I found ${carCount} perfect matches for you! Would you like to:`,
        type: 'recommendation_action',
        options: [
          { text: 'See detailed comparisons', action: 'compare_cars' },
          { text: 'View car photos', action: 'view_photos' },
          { text: 'Check availability', action: 'check_availability' },
          { text: 'Refine search', action: 'refine_search' }
        ]
      });
      
      if (carCount > 1) {
        questions.push({
          text: "Which of these catches your eye most?",
          type: 'car_preference',
          options: lastResponse.carData.slice(0, 3).map(car => ({
            text: car.name,
            action: 'show_interest',
            value: car.id
          }))
        });
      }
    }
    
    return questions;
  },

  // Get decision making questions
  getDecisionMakingQuestions: function(context) {
    const questions = [];
    
    questions.push({
      text: "Are you ready to make a decision, or would you like more information?",
      type: 'decision_readiness',
      options: [
        { text: "I'm ready to book!", action: 'start_booking' },
        { text: 'Need more details', action: 'more_details' },
        { text: 'Compare with others', action: 'compare_more' },
        { text: 'Save for later', action: 'save_for_later' }
      ]
    });
    
    questions.push({
      text: "What would help you decide?",
      type: 'decision_help',
      options: [
        { text: 'Customer reviews', action: 'show_reviews' },
        { text: 'More photos', action: 'more_photos' },
        { text: 'Insurance details', action: 'insurance_info' },
        { text: 'Total cost calculator', action: 'cost_calculator' }
      ]
    });
    
    return questions;
  },

  // Get booking process questions
  getBookingQuestions: function(context) {
    const questions = [];
    
    questions.push({
      text: "Let's get you booked! What's your preferred pickup location?",
      type: 'pickup_location',
      options: [
        { text: 'Airport delivery', action: 'set_location', value: 'airport' },
        { text: 'City center', action: 'set_location', value: 'city_center' },
        { text: 'Home delivery', action: 'set_location', value: 'home' },
        { text: 'Other location', action: 'set_location', value: 'other' }
      ]
    });
    
    questions.push({
      text: "Do you need any additional services?",
      type: 'additional_services',
      options: [
        { text: 'GPS navigation', action: 'add_service', value: 'gps' },
        { text: 'Child seat', action: 'add_service', value: 'child_seat' },
        { text: 'Additional driver', action: 'add_service', value: 'additional_driver' },
        { text: 'No extras needed', action: 'no_extras' }
      ]
    });
    
    return questions;
  },

  // Get post-recommendation questions
  getPostRecommendationQuestions: function(context) {
    const questions = [];
    
    questions.push({
      text: "How are these recommendations? Would you like me to:",
      type: 'feedback',
      options: [
        { text: 'Show similar options', action: 'similar_options' },
        { text: 'Adjust my preferences', action: 'adjust_preferences' },
        { text: 'Start over', action: 'start_over' },
        { text: 'These look great!', action: 'proceed' }
      ]
    });
    
    questions.push({
      text: "Is there anything specific you'd like to know about these cars?",
      type: 'information_request',
      options: [
        { text: 'Fuel efficiency', action: 'info_fuel' },
        { text: 'Safety ratings', action: 'info_safety' },
        { text: 'Maintenance costs', action: 'info_maintenance' },
        { text: 'Resale value', action: 'info_resale' }
      ]
    });
    
    return questions;
  },

  // Get general follow-up questions
  getGeneralFollowUpQuestions: function(context) {
    const questions = [];
    
    questions.push({
      text: "How can I help you better today?",
      type: 'general_help',
      options: [
        { text: 'Browse all cars', action: 'browse_all' },
        { text: 'Get recommendations', action: 'get_recommendations' },
        { text: 'Check current deals', action: 'check_deals' },
        { text: 'Talk to support', action: 'contact_support' }
      ]
    });
    
    return questions;
  },

  // Personalize questions based on user history and patterns
  personalizeQuestions: function(questions, conversationState) {
    const userHistory = conversationState?.user?.history || {};
    const personalized = [...questions];
    
    // Add personalized questions based on history
    if (userHistory.viewedCars && userHistory.viewedCars.length > 0) {
      const lastViewed = userHistory.viewedCars[userHistory.viewedCars.length - 1];
      personalized.push({
        text: `Would you like to see more cars like the ${lastViewed.name} you viewed earlier?`,
        type: 'similar_to_history',
        options: [
          { text: 'Yes, show similar', action: 'show_similar_history' },
          { text: 'No, thanks', action: 'decline_similar' }
        ]
      });
    }
    
    if (userHistory.comparedCars && userHistory.comparedCars.length > 0) {
      personalized.push({
        text: "Would you like to revisit your previous comparisons?",
        type: 'revisit_comparison',
        options: [
          { text: 'Show comparisons', action: 'show_comparisons' },
          { text: 'Continue new search', action: 'new_search' }
        ]
      });
    }
    
    return personalized;
  },

  // Get previous questions to avoid repetition
  getPreviousQuestions: function(conversationState) {
    const messageHistory = conversationState?.user?.history?.previousQueries || [];
    return messageHistory.map(msg => msg.message).slice(-5); // Last 5 questions
  },

  // Analyze response patterns to adapt questioning style
  analyzeResponsePatterns: function(messageHistory) {
    const patterns = {
      prefersShortAnswers: false,
      prefersDetailedInfo: false,
      priceSensitive: false,
      featureFocused: false
    };
    
    if (messageHistory.length < 3) return patterns;
    
    const recentMessages = messageHistory.slice(-5);
    const shortAnswers = recentMessages.filter(msg => msg.message.length < 20).length;
    const priceMentions = recentMessages.filter(msg => 
      msg.message.toLowerCase().includes('price') || 
      msg.message.toLowerCase().includes('cost')
    ).length;
    const featureMentions = recentMessages.filter(msg => 
      msg.message.toLowerCase().includes('feature') || 
      msg.message.toLowerCase().includes('spec')
    ).length;
    
    patterns.prefersShortAnswers = shortAnswers > recentMessages.length * 0.6;
    patterns.priceSensitive = priceMentions > 0;
    patterns.featureFocused = featureMentions > 0;
    
    return patterns;
  },

  // Generate contextual clarification questions
  generateClarificationQuestions: function(ambiguousMessage, context) {
    const questions = [];
    const lowerMessage = ambiguousMessage.toLowerCase();
    
    if (lowerMessage.includes('good') || lowerMessage.includes('nice')) {
      questions.push({
        text: "When you say 'good', what matters most to you?",
        type: 'clarification_good',
        options: [
          { text: 'Good price', action: 'clarify_price' },
          { text: 'Good fuel economy', action: 'clarify_fuel' },
          { text: 'Good safety rating', action: 'clarify_safety' },
          { text: 'Good for families', action: 'clarify_family' }
        ]
      });
    }
    
    if (lowerMessage.includes('big') || lowerMessage.includes('large')) {
      questions.push({
        text: "What kind of space are you looking for?",
        type: 'clarification_size',
        options: [
          { text: 'Passenger space', action: 'clarify_passengers' },
          { text: 'Cargo space', action: 'clarify_cargo' },
          { text: 'Both passenger and cargo', action: 'clarify_both' },
          { text: 'Just roomy overall', action: 'clarify_roomy' }
        ]
      });
    }
    
    return questions;
  },

  // Generate proactive questions based on user journey stage
  generateProactiveQuestions: function(conversationState) {
    const questions = [];
    const stage = conversationState?.conversation?.stage;
    const userPreferences = conversationState?.user?.preferences || {};
    
    if (stage === 'exploring' && userPreferences.carType && userPreferences.budget) {
      questions.push({
        text: "Great choices! Based on your preferences, would you like to know about any special deals or discounts currently available?",
        type: 'proactive_deals',
        options: [
          { text: 'Show me deals', action: 'show_deals' },
          { text: 'Focus on finding the right car', action: 'focus_search' },
          { text: 'Tell me later', action: 'decline_deals' }
        ]
      });
    }
    
    if (stage === 'deciding' && userPreferences.carType === 'suv') {
      questions.push({
        text: "Since you're interested in SUVs, do you have any specific requirements like 4WD capability or third-row seating?",
        type: 'proactive_suv_features',
        options: [
          { text: 'Need 4WD/AWD', action: 'require_4wd' },
          { text: 'Need 7 seats', action: 'require_7seats' },
          { text: 'Just standard SUV', action: 'standard_suv' },
          { text: 'Show me options', action: 'show_suv_options' }
        ]
      });
    }
    
    return questions;
  },

  // Track question effectiveness
  trackQuestionEffectiveness: function(questionId, userResponse, wasHelpful) {
    if (!this.questionHistory.has(questionId)) {
      this.questionHistory.set(questionId, {
        asked: 0,
        helpful: 0,
        responses: []
      });
    }
    
    const questionData = this.questionHistory.get(questionId);
    questionData.asked++;
    if (wasHelpful) questionData.helpful++;
    questionData.responses.push(userResponse);
  },

  // Get best performing questions
  getBestPerformingQuestions: function(questionType, limit = 3) {
    const questions = Array.from(this.contextualQuestions.entries())
      .filter(([id, data]) => data.type === questionType)
      .sort((a, b) => {
        const aScore = a[1].helpful / a[1].asked;
        const bScore = b[1].helpful / b[1].asked;
        return bScore - aScore;
      })
      .slice(0, limit);
    
    return questions.map(([id, data]) => data.question);
  }
};

// Enhanced Follow-Up Integration with ChatBot
const FollowUpIntegration = {
  // Integrate follow-up questions into chat response
  integrateFollowUpQuestions: function(botResponse, conversationState, userMessage) {
    const followUpQuestions = FollowUpQuestionSystem.generateFollowUpQuestions(
      conversationState, 
      botResponse, 
      userMessage
    );
    
    // Add clarification questions if message is ambiguous
    const clarificationQuestions = FollowUpQuestionSystem.generateClarificationQuestions(
      userMessage, 
      conversationState
    );
    
    // Add proactive questions based on context
    const proactiveQuestions = FollowUpQuestionSystem.generateProactiveQuestions(
      conversationState
    );
    
    // Combine and prioritize questions
    const allQuestions = [
      ...followUpQuestions,
      ...clarificationQuestions,
      ...proactiveQuestions
    ];
    
    // Select the most relevant questions (max 2)
    const selectedQuestions = this.selectMostRelevantQuestions(allQuestions, conversationState);
    
    // Format questions for display
    return this.formatFollowUpQuestions(selectedQuestions, botResponse);
  },
  
  // Select most relevant questions based on context
  selectMostRelevantQuestions: function(questions, conversationState) {
    const stage = conversationState?.conversation?.stage;
    const userPreferences = conversationState?.user?.preferences || {};
    
    // Score questions based on relevance
    const scoredQuestions = questions.map(question => ({
      ...question,
      score: this.calculateQuestionScore(question, stage, userPreferences)
    }));
    
    // Sort by score and return top questions
    return scoredQuestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  },
  
  // Calculate relevance score for questions
  calculateQuestionScore: function(question, stage, userPreferences) {
    let score = 0;
    
    // Base score for question type
    const typeScores = {
      'preference_gathering': 10,
      'recommendation_action': 9,
      'decision_readiness': 8,
      'clarification_good': 7,
      'proactive_deals': 6
    };
    
    score += typeScores[question.type] || 5;
    
    // Boost score based on missing information
    if (question.type === 'preference_gathering') {
      const missingInfo = FollowUpQuestionSystem.identifyMissingInformation(userPreferences);
      score += missingInfo.length * 3;
    }
    
    // Boost score for stage-appropriate questions
    if (this.isStageAppropriate(question.type, stage)) {
      score += 5;
    }
    
    return score;
  },
  
  // Check if question is appropriate for current stage
  isStageAppropriate: function(questionType, stage) {
    const stageMap = {
      'greeting': ['initial_exploration'],
      'exploring': ['preference_gathering', 'clarification_good'],
      'comparing': ['recommendation_action', 'car_preference'],
      'deciding': ['decision_readiness', 'decision_help'],
      'booking': ['booking_process', 'additional_services']
    };
    
    return stageMap[stage]?.includes(questionType) || false;
  },
  
  // Format follow-up questions for display
  formatFollowUpQuestions: function(questions, botResponse) {
    if (questions.length === 0) return botResponse;
    
    const formattedQuestions = questions.map((q, index) => ({
      id: `followup_${Date.now()}_${index}`,
      text: q.text,
      type: 'followup',
      suggestions: q.options.map(option => ({
        text: option.text,
        action: option.action,
        value: option.value,
        key: option.key,
        isFollowUp: true
      }))
    }));
    
    // Add questions to bot response
    return {
      ...botResponse,
      followUpQuestions: formattedQuestions,
      hasFollowUp: true
    };
  }
};

// Initialize the follow-up system
FollowUpQuestionSystem.initialize();