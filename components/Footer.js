function Footer() {
  try {
    return (
      <footer className="bg-[var(--bg-primary)] py-20 px-6" data-name="footer" data-file="components/Footer.js">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[var(--primary-color)] rounded-xl flex items-center justify-center">
                  <div className="icon-car text-xl text-black"></div>
                </div>
                <span className="text-3xl font-bold text-[var(--text-primary)]">CarHub360</span>
              </div>
              <p className="text-[var(--text-secondary)] mb-8 max-w-lg text-lg leading-relaxed">
                Your trusted automotive partner in Bangladesh. Experience seamless car rental, 
                buying, and premium services with verified dealers nationwide.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 glass-card flex items-center justify-center group hover:bg-[var(--primary-color)] transition-all duration-300">
                  <div className="icon-facebook text-xl text-[var(--primary-color)] group-hover:text-black transition-colors"></div>
                </a>
                <a href="#" className="w-12 h-12 glass-card flex items-center justify-center group hover:bg-[var(--primary-color)] transition-all duration-300">
                  <div className="icon-twitter text-xl text-[var(--primary-color)] group-hover:text-black transition-colors"></div>
                </a>
                <a href="#" className="w-12 h-12 glass-card flex items-center justify-center group hover:bg-[var(--primary-color)] transition-all duration-300">
                  <div className="icon-instagram text-xl text-[var(--primary-color)] group-hover:text-black transition-colors"></div>
                </a>
                <a href="#" className="w-12 h-12 glass-card flex items-center justify-center group hover:bg-[var(--primary-color)] transition-all duration-300">
                  <div className="icon-youtube text-xl text-[var(--primary-color)] group-hover:text-black transition-colors"></div>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6">Services</h4>
              <div className="space-y-4">
                <a href="index.html" className="block text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 hover:pl-2">Car Rental</a>
                <a href="index.html" className="block text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 hover:pl-2">Car Buying</a>
                <a href="services.html" className="block text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 hover:pl-2">Maintenance</a>
                <a href="configurator.html" className="block text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 hover:pl-2">Configurator</a>
                <a href="locations.html" className="block text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-200 hover:pl-2">Our Locations</a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-6">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--primary-color)] bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <div className="icon-phone text-lg text-[var(--primary-color)]"></div>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">Call us</p>
                    <p className="text-[var(--text-primary)] font-medium">+880 1324-220357</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--primary-color)] bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <div className="icon-mail text-lg text-[var(--primary-color)]"></div>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">Email us</p>
                    <p className="text-[var(--text-primary)] font-medium">admin@carhub360.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[var(--primary-color)] bg-opacity-20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <div className="icon-map-pin text-lg text-[var(--primary-color)]"></div>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm">Visit us</p>
                    <p className="text-[var(--text-primary)] font-medium">House 123, Road 45<br />Gulshan-2, Dhaka 1212</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <p className="text-[var(--text-secondary)] text-sm">
                  © 2025 CarHub360. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">Privacy Policy</a>
                  <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">Terms of Service</a>
                  <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">Cookie Policy</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-[var(--text-secondary)] text-sm">
                <div className="icon-heart text-[var(--secondary-color)] text-base"></div>
                <span>Made with passion in Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}
