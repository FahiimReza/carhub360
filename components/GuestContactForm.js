function GuestContactForm() {
  try {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      subject: '',
      content: '',
      category: 'general',
      priority: 'normal'
    });
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(false);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.content.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        setSending(true);
        
        await window.sendMessage({
          senderType: 'guest',
          senderName: formData.name.trim(),
          senderEmail: formData.email.trim(),
          subject: formData.subject.trim(),
          content: formData.content.trim(),
          category: formData.category,
          priority: formData.priority,
          recipientType: 'admin'
        });

        setSent(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          content: '',
          category: 'general',
          priority: 'normal'
        });
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    };

    if (sent) {
      return (
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card p-12">
              <div className="icon-check-circle text-6xl text-[var(--success-color)] mb-6"></div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-[var(--text-secondary)] mb-8">
                Thank you for contacting us. We've received your message and our team will review it. 
                Please note that as a guest user, you won't receive direct replies to this message.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setSent(false)}
                  className="btn-primary"
                >
                  Send Another Message
                </button>
                <a href="index.html" className="btn-secondary">
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Contact Us
            </h1>
            <p className="text-[var(--text-secondary)]">
              Send us a message and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-2">
                  Message *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Please describe your inquiry in detail..."
                  required
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="icon-info text-yellow-500 text-xl mt-0.5"></div>
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Guest Message Notice</p>
                    <p className="text-yellow-300 text-sm">
                      As a guest user, this message will be sent to our support team for review. 
                      You will not receive direct replies. For ongoing conversations, please create an account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 px-6 py-3 rounded-lg border border-white/20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              Already have an account? 
              <a href="login.html" className="text-[var(--primary-color)] hover:underline ml-1">
                Sign in to start a conversation
              </a>
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <div className="icon-phone text-[var(--primary-color)]"></div>
                +880 1700-000000
              </div>
              <div className="flex items-center gap-2">
                <div className="icon-mail text-[var(--primary-color)]"></div>
                hello@carhub360.com
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('GuestContactForm component error:', error);
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <p className="text-red-500">Error loading contact form</p>
        </div>
      </div>
    );
  }
}