function ServicesPortal() {
  const [selectedService, setSelectedService] = React.useState(null);
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Add magnetic effect to buttons and interactive elements
      const magneticElements = document.querySelectorAll('.magnetic-effect');
      magneticElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance < 100) {
          const strength = (100 - distance) / 100;
          el.style.transform = `translate(${x * strength * 0.1}px, ${y * strength * 0.1}px)`;
        } else {
          el.style.transform = 'translate(0px, 0px)';
        }
      });
    };

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelectorAll('.parallax-bg');
      
      parallax.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [serviceCategories, setServiceCategories] = React.useState([]);
  const [loadingServices, setLoadingServices] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        setError(null);

        // Fetch categories
        const categoriesRes = await fetch('/api/services/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.categories || [];

        // Fetch all services and group by category
        const servicesRes = await fetch('/api/services');
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        const services = servicesData.services || [];

        // Group services by category
        const grouped = categories.map(cat => ({
          id: cat.toLowerCase().replace(/\s+/g, '-'),
          title: cat,
          icon: getIconForCategory(cat),
          description: getDescriptionForCategory(cat),
          services: services.filter(s => s.category === cat).map(s => ({
            name: s.service_name,
            price: `৳${s.base_price.toLocaleString()}`,
            duration: formatDuration(s.duration_minutes),
            id: s.id
          }))
        }));

        setServiceCategories(grouped);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const getIconForCategory = (category) => {
    const icons = {
      'Brake Services': 'disc',
      'AC Services': 'wind',
      'Engine Services': 'settings',
      'General Maintenance': 'wrench',
      'Inspection Services': 'search',
      'Emergency Services': 'phone'
    };
    return icons[category] || 'wrench';
  };

  const getDescriptionForCategory = (category) => {
    const descriptions = {
      'Brake Services': 'Professional brake inspection, repair and replacement services',
      'AC Services': 'Complete air conditioning maintenance and repair solutions',
      'Engine Services': 'Expert engine maintenance, repair and diagnostic services',
      'General Maintenance': 'Routine checkups and preventive maintenance services',
      'Inspection Services': 'Comprehensive vehicle inspection and diagnostic services',
      'Emergency Services': '24/7 roadside assistance and emergency repair services'
    };
    return descriptions[category] || 'Professional automotive services';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}-${Math.round((minutes / 60) + 1)} hours`;
    return `${Math.round(minutes / 1440)} day${minutes > 1440 ? 's' : ''}`;
  };

  if (loadingServices) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="icon-alert-triangle text-red-400 text-4xl mb-4 mx-auto"></div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Error Loading Services</h2>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleServiceBooking = (service, category) => {
    setSelectedService({ ...service, category: category.title });
    setShowBookingForm(true);
  };

  return (
    <div className="pt-32 px-6 min-h-screen" data-name="services-portal" data-file="components/ServicesPortal.js">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
            Car Services Portal
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-8">
            Professional automotive services with skilled mechanics and quality parts. 
            Your one-stop solution for all car maintenance and repair needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center glass-card px-4 py-2 rounded-lg">
              <div className="icon-shield-check text-green-400 mr-2"></div>
              <span>Certified Mechanics</span>
            </div>
            <div className="flex items-center glass-card px-4 py-2 rounded-lg">
              <div className="icon-clock text-blue-400 mr-2"></div>
              <span>24/7 Emergency Support</span>
            </div>
            <div className="flex items-center glass-card px-4 py-2 rounded-lg">
              <div className="icon-award text-yellow-400 mr-2"></div>
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Services Grid Section */}
        <section id="services-grid" className="py-20 px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4 animate-slide-up">
              Our Professional Services
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Comprehensive automotive solutions for all your car maintenance and repair needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {serviceCategories.map((category, index) => (
              <ServiceCard 
                key={category.id} 
                category={category} 
                index={index}
                onServiceBook={handleServiceBooking}
              />
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-8">
            Why Choose CarHub360 Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                <div className="icon-users text-white text-2xl"></div>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Expert Technicians</h3>
              <p className="text-[var(--text-secondary)] text-sm">Certified mechanics with years of experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--secondary-color)] rounded-full flex items-center justify-center">
                <div className="icon-map-pin text-white text-2xl"></div>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Convenient Locations</h3>
              <p className="text-[var(--text-secondary)] text-sm">Service centers across Bangladesh</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--accent-color)] rounded-full flex items-center justify-center">
                <div className="icon-credit-card text-white text-2xl"></div>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Flexible Payment</h3>
              <p className="text-[var(--text-secondary)] text-sm">Multiple payment options available</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="icon-clock text-white text-2xl"></div>
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Quick Service</h3>
              <p className="text-[var(--text-secondary)] text-sm">Fast turnaround times guaranteed</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <section className="text-center py-20">
          <div className="glass-card p-12 max-w-4xl mx-auto hover-glow">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 animate-slide-up">
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Call our 24/7 helpline or book your service appointment online. Our expert team is ready to help!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="tel:+8801324220357" className="btn-primary text-lg py-4 px-8 hover-lift hover-shine magnetic-effect">
                <div className="icon-phone text-lg mr-3"></div>
                Call Now: +880 1324-220357
              </a>
              <button className="btn-secondary text-lg py-4 px-8 hover-glow magnetic-effect">
                <div className="icon-calendar text-lg mr-3"></div>
                Book Appointment Online
              </button>
            </div>
          </div>
        </section>

        {/* Service Booking Modal */}
        {showBookingForm && (
          <ServiceBookingModal 
            service={selectedService}
            onClose={() => setShowBookingForm(false)}
            onBookingSuccess={() => {
              setShowBookingForm(false);
              setSelectedService(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ServiceCard({ category, index, onServiceBook }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="glass-card p-6 hover-lift hover-glow animate-slide-up transform transition-all duration-500"
      style={{ animationDelay: `${index * 0.2}s` }}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsExpanded(false);
      }}
    >
      <div 
        className="text-center mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse-scale hover:scale-110 transition-all duration-300`}
             style={{ background: `var(--${index % 2 === 0 ? 'primary' : 'secondary'}-color)` }}>
          <div className={`icon-${category.icon} text-white text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-12' : ''}`}></div>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{category.title}</h3>
        <p className="text-[var(--text-secondary)] text-sm">{category.description}</p>
        <div className={`icon-chevron-down text-[var(--primary-color)] mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
          {category.services.map((service, idx) => (
            <div key={idx} className="group hover:bg-white/5 p-2 rounded-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text-primary)] text-sm group-hover:text-[var(--primary-color)] transition-colors">
                    {service.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{service.duration}</p>
                </div>
                <div className="text-[var(--primary-color)] font-bold text-sm">{service.price}</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceBook(service, category);
                }}
                className="w-full px-3 py-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg text-xs font-semibold hover:bg-[var(--primary-color)] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <div className="icon-calendar text-xs mr-1"></div>
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full btn-primary text-sm hover-shine hover:scale-105 transform transition-all duration-300"
        >
          <div className="icon-eye text-sm mr-2"></div>
          {isExpanded ? 'Hide Services' : 'View Services'}
        </button>
      </div>
    </div>
  );
}

function ServiceBookingModal({ service, onClose, onBookingSuccess }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    carModel: '',
    carYear: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const steps = [
    { id: 1, title: 'Personal Information', icon: 'user' },
    { id: 2, title: 'Vehicle Information', icon: 'car' },
    { id: 3, title: 'Appointment Details', icon: 'calendar' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return formData.name && formData.phone && formData.email;
    }
    if (currentStep === 2) {
      return formData.carModel;
    }
    if (currentStep === 3) {
      return formData.preferredDate && formData.preferredTime && formData.address;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    try {
      const currentUser = window.getCurrentUser();
      if (!currentUser) {
        alert('Please log in to book service.');
        return;
      }

      const scheduled_date = formData.preferredDate + ' ' + formData.preferredTime + ':00';
      const total_price = parseFloat(service.price.replace('৳', '').replace(/,/g, ''));
      const customer_notes = `Name: ${formData.name}, Phone: ${formData.phone}, Email: ${formData.email}, Car Model: ${formData.carModel}, Year: ${formData.carYear}, Address: ${formData.address}, Notes: ${formData.notes}`;

      const response = await fetch('/api/services/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          service_id: service.id,
          car_id: null,
          scheduled_date,
          total_price,
          service_location: formData.address,
          customer_notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book service');
      }

      const result = await response.json();
      alert('Service booked successfully! We will contact you within 24 hours to confirm your appointment.');
      onBookingSuccess();
    } catch (error) {
      console.error('Service booking error:', error);
      alert('Failed to submit booking. Please try again or call our helpline.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-2xl w-full max-h-[95vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Book Service</h3>
              <p className="text-[var(--text-secondary)]">{service.name} - {service.price}</p>
            </div>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-[var(--primary-color)] text-white' 
                    : 'bg-white/10 text-[var(--text-secondary)]'
                }`}>
                  <div className={`icon-${step.icon} text-sm`}></div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step.id ? 'bg-[var(--primary-color)]' : 'bg-white/20'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-[var(--text-secondary)] text-sm">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-96 overflow-y-auto">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-right">
              <h4 className="text-xl font-semibold text-[var(--text-primary)] flex items-center mb-4">
                <div className="icon-user text-[var(--primary-color)] mr-3 text-xl"></div>
                Personal Information
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-slide-right">
              <h4 className="text-xl font-semibold text-[var(--text-primary)] flex items-center mb-4">
                <div className="icon-car text-[var(--secondary-color)] mr-3 text-xl"></div>
                Vehicle Information
              </h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Car Model (e.g., Toyota Corolla) *"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  value={formData.carModel}
                  onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Manufacturing Year (e.g., 2020)"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  value={formData.carYear}
                  onChange={(e) => setFormData({...formData, carYear: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-right">
              <h4 className="text-xl font-semibold text-[var(--text-primary)] flex items-center mb-4">
                <div className="icon-calendar text-[var(--accent-color)] mr-3 text-xl"></div>
                Appointment Details
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <select
                    className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                  >
                    <option value="">Select Time *</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                <textarea
                  placeholder="Service Address *"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300 resize-none"
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <textarea
                  placeholder="Additional Notes (Optional)"
                  className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300 resize-none"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          {/* Service Summary */}
          <div className="glass-card p-4 mb-4 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[var(--text-primary)]">{service.name}</span>
              <span className="font-bold text-[var(--primary-color)] text-lg">{service.price}</span>
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">Duration: {service.duration}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 text-[var(--text-secondary)] rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
            >
              <div className="icon-arrow-left mr-2"></div>
              Previous
            </button>
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateCurrentStep()}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-all duration-300"
              >
                Next
                <div className="icon-arrow-right ml-2"></div>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateCurrentStep() || isSubmitting}
                className="btn-primary px-6 py-3 disabled:opacity-50 hover:scale-105 transform transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="icon-loader mr-2 animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <div className="icon-check mr-2"></div>
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
