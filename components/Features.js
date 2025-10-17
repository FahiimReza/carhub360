function Features() {
  try {
    return (
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--secondary-color)]/20" data-name="features" data-file="components/Features.js">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose CarHub360?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Trusted dealers, flexible payments, and 24/7 support
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ background: 'var(--gradient-primary)' }}>
                <div className="icon-shield-check text-xl text-white"></div>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Verified Dealers</h3>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%)' }}>
                <div className="icon-credit-card text-xl text-white"></div>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Flexible Payment</h3>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--success-color) 0%, var(--primary-color) 100%)' }}>
                <div className="icon-headphones text-xl text-white"></div>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">24/7 Support</h3>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Features component error:', error);
    return null;
  }
}

