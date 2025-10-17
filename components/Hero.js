function Hero({ activeTab, setActiveTab }) {
  try {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32" data-name="hero" data-file="components/Hero.js">
        {/* Clean Animated Background */}
        <div className="absolute inset-0">
          {/* Smooth gradient orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-[var(--primary-color)] to-transparent opacity-10 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-[var(--secondary-color)] to-transparent opacity-8 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[var(--accent-color)] to-transparent opacity-6 rounded-full blur-3xl animate-pulse-scale" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <div className="animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-[var(--primary-color)] via-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent animate-gradient">
                Rent or Buy
              </span>
              <br />
              <span className="text-[var(--text-primary)] text-5xl md:text-7xl">Your Dream Car</span>
              <br />
              <span className="text-2xl md:text-3xl text-[var(--text-secondary)] font-semibold">in Bangladesh</span>
            </h1>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto font-light leading-relaxed">
              Experience premium cars with verified dealers, instant booking, and competitive prices. 
              Your journey to the perfect ride starts here.
            </p>
            
            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <SearchBar placeholder="Search cars by model, brand, or service..." />
            </div>
          </div>

          {/* Clean Tab Selection */}
          <div className="flex justify-center mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="backdrop-blur-xl bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl">
              <button 
                className={`flex items-center px-8 py-4 rounded-xl font-medium transition-all duration-500 ${
                  activeTab === 'rent' 
                    ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white shadow-lg transform scale-105' 
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('rent')}
              >
                <div className="icon-key text-lg mr-3"></div>
                Rent Cars
              </button>
              <button 
                className={`flex items-center px-8 py-4 rounded-xl font-medium transition-all duration-500 ${
                  activeTab === 'buy' 
                    ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white shadow-lg transform scale-105' 
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('buy')}
              >
                <div className="icon-shopping-cart text-lg mr-3"></div>
                Buy Cars
              </button>
            </div>
          </div>

          {/* Clean CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <button 
              onClick={() => document.getElementById('cars').scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 magnetic-effect"
            >
              <div className="flex items-center justify-center">
                <div className="icon-search text-lg mr-3 group-hover:animate-pulse"></div>
                Explore Cars
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button 
              onClick={() => window.location.href = 'configurator.html'}
              className="group px-8 py-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--secondary-color)] text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 magnetic-effect"
            >
              <div className="flex items-center justify-center">
                <div className="icon-wrench text-lg mr-3 group-hover:animate-pulse"></div>
                Build Your Car
              </div>
            </button>
            <button 
              onClick={() => document.getElementById('cars').scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-[var(--primary-color)] hover:text-white hover:shadow-xl hover:scale-105 magnetic-effect"
            >
              <div className="flex items-center justify-center">
                <div className="icon-zap text-lg mr-3 group-hover:animate-pulse"></div>
                {activeTab === 'rent' ? 'Rent Now' : 'Buy Today'}
              </div>
            </button>
          </div>

          {/* Clean Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10 hover-glow">
              <div className="text-3xl md:text-4xl font-bold text-[var(--primary-color)] mb-2">500+</div>
              <div className="text-[var(--text-secondary)] font-light">Premium Cars</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10 hover-glow">
              <div className="text-3xl md:text-4xl font-bold text-[var(--primary-color)] mb-2">24/7</div>
              <div className="text-[var(--text-secondary)] font-light">Support</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10 hover-glow">
              <div className="text-3xl md:text-4xl font-bold text-[var(--primary-color)] mb-2">15K+</div>
              <div className="text-[var(--text-secondary)] font-light">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* Clean Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-[var(--primary-color)] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[var(--primary-color)] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Hero component error:', error);
    return null;
  }
}
