function ChatBot() {
  try {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([
      {
        id: 1,
        type: 'bot',
        text: '👋 Welcome to CarHub360! I\'m your intelligent car assistant. I can help you find the perfect car, compare models, check availability, and guide you through the entire process. What brings you here today?',
        timestamp: new Date(),
        suggestions: [
          { text: 'I want to rent a car', action: 'set_intent', value: 'rental' },
          { text: 'I want to buy a car', action: 'set_intent', value: 'purchase' },
          { text: 'Compare car models', action: 'set_intent', value: 'comparison' },
          { text: 'Get recommendations', action: 'get_recommendations' }
        ]
      }
    ]);
    const [inputMessage, setInputMessage] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const [conversationState, setConversationState] = React.useState(null);
    const [showCarCards, setShowCarCards] = React.useState(false);
    const [suggestedCars, setSuggestedCars] = React.useState([]);
    const [showComparison, setShowComparison] = React.useState(false);
    const [comparisonData, setComparisonData] = React.useState(null);

    // Initialize conversation on component mount
    React.useEffect(() => {
      const state = ConversationStateManager.initializeConversation();
      setConversationState(state);
    }, []);

    // Handle sending message with enhanced system integration
    const handleSendMessage = async (message, action = null, actionValue = null, actionKey = null) => {
      if (!message.trim() && !action) return;

      // Add user message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: message || (action ? `Clicked: ${action}` : ''),
        timestamp: new Date(),
        action: action,
        actionValue: actionValue,
        actionKey: actionKey
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);

      try {
        // Simulate AI processing time
        setTimeout(async () => {
          const botResponse = await generateIntelligentResponse(message, action, actionValue, actionKey);
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 1500);
      } catch (error) {
        setIsTyping(false);
        console.error('Error generating bot response:', error);
        
        // Fallback response
        const fallbackResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: "I'm having trouble processing your request right now. Please try again or contact our support team for immediate assistance.",
          timestamp: new Date(),
          suggestions: [
            { text: 'Try again', action: 'retry' },
            { text: 'Contact support', action: 'contact_support' },
            { text: 'Start over', action: 'reset_conversation' }
          ]
        };
        setMessages(prev => [...prev, fallbackResponse]);
      }
    };

    // Generate intelligent response using enhanced systems
    const generateIntelligentResponse = async (message, action, actionValue, actionKey) => {
      // Update conversation state
      let currentResponse = { text: '', suggestions: [], carData: null };

      // Handle action-based interactions
      if (action) {
        currentResponse = await handleActionInteraction(action, actionValue, actionKey);
      } else {
        // Use Enhanced AI Response System
        currentResponse = await EnhancedAIResponseSystem.generateResponse(message, conversationState);
      }

      // Update conversation state
      if (conversationState) {
        const updatedState = ConversationStateManager.updateState(message, currentResponse.text);
        setConversationState(updatedState);
        
        // Add follow-up questions
        const followUpIntegration = FollowUpIntegration.integrateFollowUpQuestions(
          currentResponse, 
          updatedState, 
          message
        );
        
        currentResponse = followUpIntegration;
      }

      // Handle car recommendations
      if (currentResponse.carData && currentResponse.carData.length > 0) {
        setSuggestedCars(currentResponse.carData);
        setShowCarCards(true);
      }

      // Handle comparison requests
      if (action === 'compare_cars' || action === 'view_comparison') {
        await handleComparisonRequest();
      }

      return {
        id: Date.now() + 1,
        type: 'bot',
        text: currentResponse.text,
        timestamp: new Date(),
        suggestions: currentResponse.suggestions || [],
        carData: currentResponse.carData,
        hasFollowUp: currentResponse.hasFollowUp || false,
        followUpQuestions: currentResponse.followUpQuestions || []
      };
    };

    // Handle action interactions
    const handleActionInteraction = async (action, actionValue, actionKey) => {
      const state = ConversationStateManager.handleAction(action, actionValue, actionKey);
      setConversationState(state);

      switch (action) {
        case 'set_intent':
          return {
            text: `Great choice! I'll help you find the perfect ${actionValue === 'rental' ? 'rental car' : 'vehicle to purchase'}. Let me ask you a few questions to find the best match for you.`,
            suggestions: [
              { text: 'What\'s your budget?', action: 'ask_budget' },
              { text: 'What type of car?', action: 'ask_car_type' },
              { text: 'Show me options', action: 'show_options' }
            ]
          };

        case 'set_preference':
          if (actionKey === 'carType') {
            const categoryInfo = CarKnowledgeBase.categories[actionValue];
            return {
              text: `Excellent choice! ${categoryInfo.name} are ${categoryInfo.description.toLowerCase()}. ${categoryInfo.name} range from ${categoryInfo.priceRange.rent} for rentals. What's your budget range?`,
              suggestions: [
                { text: 'Budget-friendly', action: 'set_preference', key: 'budget', value: 'low' },
                { text: 'Mid-range', action: 'set_preference', key: 'budget', value: 'medium' },
                { text: 'Premium', action: 'set_preference', key: 'budget', value: 'high' }
              ]
            };
          } else if (actionKey === 'budget') {
            return {
              text: `Perfect! I'll find options within your ${actionValue} budget. Do you have a specific duration in mind?`,
              suggestions: [
                { text: 'Daily rental', action: 'set_preference', key: 'duration', value: 'daily' },
                { text: 'Weekly rental (15% off)', action: 'set_preference', key: 'duration', value: 'weekly' },
                { text: 'Monthly rental (30% off)', action: 'set_preference', key: 'duration', value: 'monthly' }
              ]
            };
          } else if (actionKey === 'duration') {
            // Generate car recommendations
            const recommendations = CarKnowledgeBase.recommendCars(state.user.preferences);
            setSuggestedCars(recommendations);
            setShowCarCards(true);
            
            return {
              text: `Great! Based on your preferences, I found ${recommendations.length} perfect matches for you:`,
              carData: recommendations,
              suggestions: [
                { text: 'View car details', action: 'view_details' },
                { text: 'Compare selected', action: 'compare_cars' },
                { text: 'Check availability', action: 'check_availability' },
                { text: 'See more options', action: 'more_options' }
              ]
            };
          }
          break;

        case 'get_recommendations':
          const recommendations = CarKnowledgeBase.recommendCars(state.user.preferences);
          setSuggestedCars(recommendations);
          setShowCarCards(true);
          
          return {
            text: `Based on your preferences, I recommend these cars for you:`,
            carData: recommendations,
            suggestions: [
              { text: 'Compare these cars', action: 'compare_recommended' },
              { text: 'See more options', action: 'more_options' },
              { text: 'Adjust preferences', action: 'adjust_preferences' }
            ]
          };

        case 'compare_cars':
        case 'compare_recommended':
          await handleComparisonRequest();
          return {
            text: "I'll prepare a detailed comparison for you. This will help you make the best decision!",
            suggestions: [
              { text: 'View detailed comparison', action: 'view_detailed_comparison' },
              { text: 'Add more cars', action: 'add_more_cars' },
              { text: 'Book selected car', action: 'book_selected' }
            ]
          };

        case 'view_details':
          return {
            text: "I'll show you detailed information about the selected car. You can see specifications, features, and pricing.",
            suggestions: [
              { text: 'Book this car', action: 'start_booking' },
              { text: 'Add to comparison', action: 'add_to_comparison' },
              { text: 'Ask questions', action: 'ask_questions' },
              { text: 'Back to list', action: 'back_to_list' }
            ]
          };

        case 'start_booking':
          return {
            text: "Let's start the booking process. I'll need some information from you to complete your reservation.",
            suggestions: [
              { text: 'Proceed with booking', action: 'proceed_booking' },
              { text: 'Check availability first', action: 'check_availability' },
              { text: 'Modify rental period', action: 'modify_period' },
              { text: 'Back to details', action: 'back_to_details' }
            ]
          };

        default:
          return {
            text: "I'm processing your request. Let me find the best information for you.",
            suggestions: [
              { text: 'Show car details', action: 'show_details' },
              { text: 'Check availability', action: 'check_availability' },
              { text: 'Talk to support', action: 'contact_support' }
            ]
          };
      }

      return {
        text: "I'm here to help! What would you like to know?",
        suggestions: [
          { text: 'Car rental prices', action: 'show_pricing' },
          { text: 'Available cars', action: 'show_inventory' },
          { text: 'Contact support', action: 'contact_support' }
        ]
      };
    };

    // Handle comparison request
    const handleComparisonRequest = async () => {
      if (suggestedCars.length >= 2) {
        const carIds = suggestedCars.slice(0, 3).map(car => car.id);
        // For now, we'll create a simple comparison
        const comparison = {
          cars: suggestedCars.slice(0, 2),
          overview: {
            winner: {
              price: suggestedCars[0].name,
              performance: suggestedCars[1].name,
              efficiency: suggestedCars[0].fuel_type === 'Electric' ? suggestedCars[0].name : suggestedCars[1].name
            }
          },
          scoring: suggestedCars.slice(0, 2).map(car => ({
            name: car.name,
            overallScore: car.rating * 20 || 80,
            recommendation: `Great choice for ${car.category.toLowerCase()} users`
          }))
        };
        
        setComparisonData(comparison);
        setShowComparison(true);
      }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
      const message = suggestion.text;
      handleSendMessage(message, suggestion.action, suggestion.value, suggestion.key);
    };

    // Handle car card click
    const handleCarClick = (car) => {
      const message = `Tell me more about ${car.name}`;
      handleSendMessage(message, 'view_details', car.id);
    };

    // Handle car selection for comparison
    const handleSelectForComparison = (carId) => {
      const car = suggestedCars.find(c => c.id === carId);
      if (car) {
        const message = `Add ${car.name} to comparison`;
        handleSendMessage(message, 'add_to_comparison', carId);
      }
    };

    // Handle book car
    const handleBookCar = (car) => {
      const message = `I want to book ${car.name}`;
      handleSendMessage(message, 'start_booking', car.id);
    };

    return (
      <div className="fixed bottom-6 right-6 z-50" data-name="enhanced-chatbot" data-file="components/ChatBot.js">
        {/* Chat Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse-scale relative"
          >
            <div className="icon-message-circle text-2xl"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        )}

        {/* Enhanced Chat Window */}
        {isOpen && (
          <div className="w-96 max-h-[80vh] glass-card flex flex-col animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                  <div className="icon-bot text-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">CarHub360 Assistant</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {conversationState?.conversation.stage === 'greeting' ? 'Online - Ready to help!' : 
                     conversationState?.conversation.stage === 'exploring' ? 'Finding perfect matches...' :
                     conversationState?.conversation.stage === 'comparing' ? 'Comparing your options...' :
                     conversationState?.conversation.stage === 'deciding' ? 'Ready to book!' : 'Online - Ready to help!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="icon-x text-lg"></div>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${
                    message.type === 'user'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white/10 text-[var(--text-primary)]'
                  } rounded-lg p-3`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Car Cards Display */}
              {showCarCards && suggestedCars.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)] font-medium">🎯 Recommended for you:</p>
                  {suggestedCars.map((car) => (
                    <div 
                      key={car.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-12 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                          <div className="icon-car text-white text-xl"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--text-primary)] text-sm">{car.name}</h4>
                          <p className="text-xs text-[var(--text-secondary)]">{car.reasoning || car.description || `Great ${car.category} option`}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-[var(--primary-color)]">৳{car.price || car.rentPricePerDay || 5000}/day</span>
                            <div className="flex items-center space-x-1">
                              <div className="icon-star text-yellow-400 text-xs"></div>
                              <span className="text-xs text-[var(--text-secondary)]">{car.rating || '4.5'}/5</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleCarClick(car)}
                              className="flex-1 text-xs py-1 bg-white/10 text-[var(--text-primary)] rounded hover:bg-white/20 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleSelectForComparison(car.id)}
                              className="flex-1 text-xs py-1 bg-white/10 text-[var(--text-primary)] rounded hover:bg-white/20 transition-colors"
                            >
                              Compare
                            </button>
                            <button
                              onClick={() => handleBookCar(car)}
                              className="flex-1 text-xs py-1 bg-[var(--primary-color)] text-white rounded hover:scale-105 transition-all"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Comparison Display */}
              {showComparison && comparisonData && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-semibold text-[var(--text-primary)] text-sm mb-2">📊 Car Comparison</h4>
                  <div className="space-y-2">
                    {comparisonData.cars.map((car, index) => (
                      <div key={car.id} className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-primary)]">{car.name}</span>
                        <span className="text-xs font-bold text-[var(--primary-color)]">
                          {comparisonData.scoring[index]?.overallScore.toFixed(1)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-[var(--text-secondary)]">
                      🏆 **Winner:** {comparisonData.scoring[0]?.name}
                    </p>
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--secondary-color)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-2 bg-white/20 text-[var(--text-primary)] rounded-full hover:bg-white/30 hover:text-[var(--text-primary)] transition-all duration-200 border border-white/20"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions */}
            {messages.length > 0 && messages[messages.length - 1].hasFollowUp && (
              <div className="px-4 pb-3 border-t border-white/10">
                <p className="text-xs text-[var(--text-secondary)] mb-2">Quick questions:</p>
                <div className="space-y-2">
                  {messages[messages.length - 1].followUpQuestions.map((question, index) => (
                    <div key={question.id} className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-[var(--text-primary)] mb-2">{question.text}</p>
                      <div className="flex flex-wrap gap-1">
                        {question.suggestions.map((suggestion, sIndex) => (
                          <button
                            key={sIndex}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-2 py-1 bg-white/20 text-[var(--text-primary)] rounded hover:bg-white/30 hover:text-[var(--text-primary)] transition-colors"
                          >
                            {suggestion.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Ask me anything about cars..."
                  className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-white/10 rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 bg-[var(--primary-color)] rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                >
                  <div className="icon-send text-sm"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Enhanced ChatBot component error:', error);
    return null;
  }
}