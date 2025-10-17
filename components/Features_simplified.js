function Features() {
  try {
    const features = [
      {
        icon: 'shield-check',
        title: 'Verified Dealers',
        description: 'All our partner dealers are verified and trusted'
      },
      {
        icon: 'credit-card',
        title: 'Flexible Payment',
        description: 'Multiple payment options including EMI'
      },
      {
        icon: 'headphones',
        title: '24/7 Support',
        description: 'Round-the-clock customer support'
      }
    ];

    return (
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--secondary-color)]/20" data-name="features" data-file="components/Features.js">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose DriveHub BD?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Experience the future of car rental and buying with our premium services
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-8 text-center group hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;
                  e.currentTarget.style.transform = `perspective(500px) rotateY(${x * 0.02}deg) rotateX(${-y * 0.02}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg)';
                }}
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:animate-pulse-scale animate-glow transition-all duration-300" 
                     style={{ 
                       background: index % 3 === 0 ? 'var(--gradient-primary)' : 
                                  index % 3 === 1 ? `linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%)` :
                                  `linear-gradient(135deg, var(--success-color) 0%, var(--primary-color) 100%)`
                     }}>
                  <div className={`icon-${feature.icon} text-2xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Features component error:', error);
    return null;
  }
}