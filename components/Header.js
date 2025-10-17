function Header() {
  try {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    // Get current page name from URL
    const getCurrentPage = () => {
      const path = window.location.pathname;
      const filename = path.split('/').pop();
      return filename || 'index.html';
    };
    
    const currentPage = getCurrentPage();

    return (
      <header className="fixed top-0 w-full z-50 glass-card border-b border-white/10 animate-slide-up backdrop-blur-2xl" data-name="header" data-file="components/Header.js">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo on the left */}
          <div className="flex items-center space-x-2 hover-glow cursor-pointer transition-all duration-300" onClick={() => window.location.href = 'index.html'}>
            <div className="w-10 h-10 bg-[var(--primary-color)] rounded-lg flex items-center justify-center relative overflow-hidden car-logo-container animate-pulse-scale hover:rotate-12 transition-transform duration-300">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Animated road lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-30 transform -translate-y-1/2">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 border-l-2 border-dashed border-white opacity-50 animate-road-move"></div>
                </div>
              </div>
              
              {/* Custom Animated Car Icon SVG */}
              <svg className="w-6 h-6 text-white relative z-10 animate-car-hover" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path className="animate-pulse-glow" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <div className="icon-car text-xl text-white absolute opacity-0"></div>
              
              {/* Speed lines animation */}
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-0.5 bg-white opacity-60 animate-speed-line-1"></div>
                  <div className="w-3 h-0.5 bg-white opacity-40 animate-speed-line-2"></div>
                  <div className="w-4 h-0.5 bg-white opacity-20 animate-speed-line-3"></div>
                </div>
              </div>
            </div>
            <span className="text-2xl font-semibold text-[var(--text-primary)] bg-gradient-to-r from-[var(--primary-color)] to-white bg-clip-text text-transparent animate-logo-text">CarHub360</span>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <a href="index.html#cars" className={`${currentPage === 'index.html' || currentPage === '' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Cars
              {currentPage === 'index.html' || currentPage === '' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            <a href="compare.html" className={`${currentPage === 'compare.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Compare
              {currentPage === 'compare.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            <a href="blog.html" className={`${currentPage === 'blog.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Blog
              {currentPage === 'blog.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            {(() => {
              const currentUser = localStorage.getItem('currentUser');
              if (currentUser) {
                const user = JSON.parse(currentUser);
                if (user.role === 'admin') {
                  return <a href="configurator.html" className={`${currentPage === 'configurator.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
                    Configurator
                    {currentPage === 'configurator.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
                  </a>;
                }
              }
              return null;
            })()}
            <a href="services.html" className={`${currentPage === 'services.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Services
              {currentPage === 'services.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            <a href="locations.html" className={`${currentPage === 'locations.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Locations
              {currentPage === 'locations.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            <a href="booking.html" className={`${currentPage === 'booking.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              Bookings
              {currentPage === 'booking.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            {(() => {
              const currentUser = localStorage.getItem('currentUser');
              if (currentUser) {
                return <a href="messages.html" className={`${currentPage === 'messages.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
                  Messages
                  {currentPage === 'messages.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
                </a>;
              } else {
                return <a href="guest-contact.html" className={`${currentPage === 'guest-contact.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
                  Contact
                  {currentPage === 'guest-contact.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
                </a>;
              }
            })()}
            <a href="about.html" className={`${currentPage === 'about.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
              About
              {currentPage === 'about.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
            </a>
            {(() => {
              const currentUser = localStorage.getItem('currentUser');
              if (currentUser) {
                const user = JSON.parse(currentUser);
                if (user.role === 'admin') {
                  return <a href="admin.html" className={`${currentPage === 'admin.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-all duration-300 hover:scale-110 magnetic-effect font-semibold relative`}>
                    Admin
                    {currentPage === 'admin.html' ? <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-color)] rounded-full"></span> : null}
                  </a>;
                }
              }
              return null;
            })()}
          </nav>

          {/* CTA buttons on the right */}
          <div className="flex items-center space-x-4">
            {(() => {
              const currentUser = localStorage.getItem('currentUser');
              if (currentUser) {
                const user = JSON.parse(currentUser);
                return (
                  <div className="flex items-center space-x-3">
                    <a href="dashboard.html" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="icon-user text-lg absolute opacity-0"></div>
                    </a>
                    <button
                      onClick={() => {
                        localStorage.removeItem('currentUser');
                        window.location.href = 'index.html';
                      }}
                      className="text-[var(--text-secondary)] hover:text-red-400 transition-all duration-300"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <div className="icon-log-out text-lg absolute opacity-0"></div>
                    </button>
                  </div>
                );
              } else {
                return (
                  <a href="login.html" className="btn-primary hover-shine hover-lift px-4 py-2 rounded-full text-sm font-semibold">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="icon-user text-lg mr-2 absolute opacity-0"></div>
                    Login
                  </a>
                );
              }
            })()}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-primary)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            <div className={`icon-${isMenuOpen ? 'x' : 'menu'} text-2xl absolute opacity-0`}></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card border-t border-white/10 backdrop-blur-2xl">
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[var(--text-primary)] font-semibold">Menu</span>
              </div>
              
              <a href="index.html#cars" className={`${currentPage === 'index.html' || currentPage === '' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Cars
              </a>
              <a href="compare.html" className={`${currentPage === 'compare.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Compare
              </a>
              <a href="blog.html" className={`${currentPage === 'blog.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Blog
              </a>
              {(() => {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                  const user = JSON.parse(currentUser);
                  if (user.role === 'admin') {
                    return <a href="configurator.html" className={`${currentPage === 'configurator.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                      Configurator
                    </a>;
                  }
                }
                return null;
              })()}
              <a href="services.html" className={`${currentPage === 'services.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Services
              </a>
              <a href="locations.html" className={`${currentPage === 'locations.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Locations
              </a>
              <a href="booking.html" className={`${currentPage === 'booking.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                Bookings
              </a>
              {(() => {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                  return <a href="messages.html" className={`${currentPage === 'messages.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                    Messages
                  </a>;
                } else {
                  return <a href="guest-contact.html" className={`${currentPage === 'guest-contact.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                    Contact
                  </a>;
                }
              })()}
              <a href="about.html" className={`${currentPage === 'about.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                About
              </a>
              {(() => {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                  const user = JSON.parse(currentUser);
                  if (user.role === 'admin') {
                    return <a href="admin.html" className={`${currentPage === 'admin.html' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} block py-2 hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold`}>
                      Admin
                    </a>;
                  }
                }
                return null;
              })()}

              <div className="pt-3 mt-3 border-t border-white/10">
                {(() => {
                  const currentUser = localStorage.getItem('currentUser');
                  if (currentUser) {
                    const user = JSON.parse(currentUser);
                    return (
                      <div className="space-y-3">
                        <a href="dashboard.html" className="flex items-center py-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors duration-300 font-semibold">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {user.name || 'User'}
                        </a>
                        <button
                          onClick={() => {
                            localStorage.removeItem('currentUser');
                            window.location.href = 'index.html';
                          }}
                          className="flex items-center w-full py-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    );
                  } else {
                    return <a href="login.html" className="btn-primary w-full block text-center py-2 font-semibold">Login</a>;
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}