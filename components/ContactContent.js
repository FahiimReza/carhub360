function ContactContent() {
  try {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitMessage, setSubmitMessage] = React.useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
        await trickleCreateObject('contact_message', {
          ...formData,
          createdAt: new Date().toISOString(),
          status: 'new'
        });
        
        setSubmitMessage('Thank you for contacting us! We will get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } catch (error) {
        setSubmitMessage('Failed to send message. Please try again or call us directly.');
      }
      
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    };

    const contactInfo = [
      {
        icon: 'phone',
        title: 'Phone',
        info: '+880 1700-000000',
        link: 'tel:+8801700000000'
      },
      {
        icon: 'mail',
        title: 'Email',
        info: 'hello@carhub360.com',
        link: 'mailto:hello@carhub360.com'
      },
      {
        icon: 'message-circle',
        title: 'WhatsApp',
        info: '+880 1700-000000',
        link: 'https://wa.me/8801700000000'
      },
      {
        icon: 'map-pin',
        title: 'Address',
        info: 'House 123, Road 45, Gulshan-2, Dhaka 1212',
        link: '#'
      }
    ];

    return (
      <div className="pt-20 px-6 min-h-screen" data-name="contact-content" data-file="components/ContactContent.js">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Have questions about our services? Need assistance with your booking? 
              We're here to help you 24/7.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.link}
                className="glass-card p-6 text-center hover:scale-105 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                  <div className={`icon-${contact.icon} text-white text-xl`}></div>
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{contact.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{contact.info}</p>
              </a>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Contact Form */}
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
                Send Us A Message
              </h2>
              
              {submitMessage && (
                <div className={`p-4 rounded-lg mb-6 ${
                  submitMessage.includes('Thank you') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <select
                    className="input-field"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  >
                    <option value="">Select Subject *</option>
                    <option value="car-rental">Car Rental Inquiry</option>
                    <option value="car-purchase">Car Purchase Inquiry</option>
                    <option value="car-service">Car Service Inquiry</option>
                    <option value="general">General Question</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <textarea
                  placeholder="Your Message *"
                  className="input-field h-32 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="icon-loader mr-2 animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <div className="icon-send mr-2"></div>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Business Hours */}
            <div className="space-y-8">
              <InteractiveMap />

              {/* Business Hours */}
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Business Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Monday - Friday</span>
                    <span className="text-[var(--text-primary)] font-semibold">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Saturday</span>
                    <span className="text-[var(--text-primary)] font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Sunday</span>
                    <span className="text-[var(--text-primary)] font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-secondary)]">Emergency Service</span>
                      <span className="text-green-400 font-semibold">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-2">How can I book a car rental?</h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  You can book online through our website, call us directly, or visit our showroom. 
                  Online booking is available 24/7 with instant confirmation.
                </p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-2">What documents do I need?</h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  You'll need a valid driving license, National ID/Passport, and a credit card 
                  for security deposit. Additional requirements may apply for long-term rentals.
                </p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-2">Do you provide car financing?</h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  Yes, we work with leading banks to provide competitive financing options. 
                  Our team can help you find the best loan terms for your purchase.
                </p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-2">What's included in car service?</h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  Our service packages include inspection, oil change, brake check, and more. 
                  We use genuine parts and provide warranty on all repairs.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    );
  } catch (error) {
    console.error('ContactContent component error:', error);
    return null;
  }
}
