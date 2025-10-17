function Testimonials() {
  try {
    const testimonials = [
      {
        id: 1,
        name: 'Fahim Reza',
        location: 'Dhaka',
        rating: 5,
        text: 'Amazing experience! Rented a BMW X5 for my wedding. The car was pristine and the service was exceptional. Will definitely use CarHub360 again.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 2,
        name: 'Tahsin Mostofa',
        location: 'Chittagong',
        rating: 5,
        text: 'Bought my first car through CarHub360. The process was smooth, transparent pricing, and excellent customer support throughout.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: 3,
        name: 'Rubayet Muntasir',
        location: 'Sylhet',
        rating: 5,
        text: 'Great selection of cars and competitive prices. The team helped me find exactly what I needed within my budget.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
      }
    ];

    return (
      <section className="py-20 px-6 bg-gradient-to-b from-[var(--secondary-color)]/20 to-transparent" data-name="testimonials" data-file="components/Testimonials.js">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Don't just take our word for it. Here's what real customers have to say about their experience
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className="glass-card p-6 hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.3}s` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) rotateY(5deg) rotateX(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px) rotateY(0deg) rotateX(0deg)';
                }}
              >
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="icon-star text-[var(--accent-color)] text-lg"></div>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="text-[var(--text-primary)] font-semibold">{testimonial.name}</h4>
                    <p className="text-[var(--text-secondary)] text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Ready to Join Thousands of Happy Customers?
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Start your journey today and experience the CarHub360 difference
              </p>
              <button className="btn-primary text-lg">
                <div className="icon-arrow-right text-lg mr-2"></div>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Testimonials component error:', error);
    return null;
  }
}