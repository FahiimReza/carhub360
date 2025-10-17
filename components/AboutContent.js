function AboutContent() {
  try {
    const [activeSection, setActiveSection] = React.useState(0);
    const [isVisible, setIsVisible] = React.useState({});
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const [isHoveringProfile, setIsHoveringProfile] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      }, observerOptions);

      document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      const handleMouseMove = (e) => {
        if (isHoveringProfile) {
          const profileCard = document.getElementById('profile-card');
          if (profileCard) {
            const rect = profileCard.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            setMousePosition({ x: x * 20, y: y * 20 });
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isHoveringProfile]);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % 2);
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    const teamMembers = [
      {
        name: 'Md. Fahim Reza',
        role: 'Frontend, Backend & Database Specialist',
        images: [
          'assets/Dev/Md. Fahim Reza/485145643_3936559359938245_4024434681486919283_n.jpg',
          'assets/Dev/Md. Fahim Reza/484066456_3930002577260590_42228310998745580_n.jpg'
        ],
        bio: 'Sole developer responsible for the entire CarHub360 platform from concept to deployment'
      }
    ];

    const achievements = [
      { icon: 'code', count: '12', label: 'Weeks Development', color: 'text-[var(--primary-color)]' },
      { icon: 'layers', count: '50+', label: 'Components Built', color: 'text-[var(--secondary-color)]' },
      { icon: 'database', count: '10', label: 'Database Tables', color: 'text-[var(--accent-color)]' },
      { icon: 'git-branch', count: '100+', label: 'Git Commits', color: 'text-green-400' }
    ];

    const values = [
      {
        icon: 'shield',
        title: 'Trust & Security',
        description: 'Every transaction is protected with bank-level security and transparent processes.',
        gradient: 'from-blue-500 to-cyan-400'
      },
      {
        icon: 'star',
        title: 'Premium Quality',
        description: 'Handpicked vehicles meeting the highest standards of safety and performance.',
        gradient: 'from-purple-500 to-pink-400'
      },
      {
        icon: 'users',
        title: 'Customer First',
        description: 'Your satisfaction drives everything we do, from service to support.',
        gradient: 'from-green-500 to-teal-400'
      },
      {
        icon: 'rocket',
        title: 'Innovation',
        description: 'Cutting-edge technology making car ownership simple and smart.',
        gradient: 'from-orange-500 to-red-400'
      }
    ];

    return (
      <div className="pt-16 min-h-screen overflow-hidden" data-name="about-content" data-file="components/AboutContent.js">
        
        {/* Hero Section with Animated Background */}
        <section className="relative min-h-screen flex items-center justify-center px-6" id="hero" data-animate>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 via-[var(--secondary-color)]/5 to-[var(--accent-color)]/5"></div>
          
          <div className={`max-w-4xl mx-auto text-center z-10 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-full mb-8">
              <span className="text-[var(--primary-color)] font-semibold">Jul 2025 - Oct 2025 • Student Project Showcase</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8">
              <span className="bg-gradient-to-r from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                CarHub360
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-[var(--text-primary)] mb-8 font-light">
              Revolutionizing automotive experiences with 
              <span className="font-bold text-[var(--secondary-color)]"> passion</span>, 
              <span className="font-bold text-[var(--primary-color)]"> innovation</span>, and 
              <span className="font-bold text-[var(--accent-color)]"> excellence</span>
            </p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="btn-primary transform hover:scale-105 transition-all duration-300">
                Our Journey
              </button>
              <button className="btn-secondary transform hover:scale-105 transition-all duration-300">
                Join the Revolution
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Interactive Timeline */}
          <section className="py-20" id="timeline" data-animate>
            <div className={`transition-all duration-1000 ${isVisible.timeline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-5xl font-bold text-center mb-16">
                <span className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
                  Our Revolutionary Journey
                </span>
              </h2>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[var(--primary-color)] to-[var(--secondary-color)]"></div>
                
                {[
                  { year: 'Jul 22, 2025', title: 'Project Conception', desc: 'Brainstormed the idea for a comprehensive car rental and services platform as part of my academic project' },
                  { year: 'Aug 5, 2025', title: 'Planning Phase', desc: 'Planned the architecture, designed wireframes, and outlined the database schema and API structure as a solo developer' },
                  { year: 'Sep 10, 2025', title: 'Design & Architecture', desc: 'Created the complete UI/UX design and planned the full-stack architecture including frontend, backend, and database' },
                  { year: 'Oct 1, 2025', title: 'Implementation Phase', desc: 'Developed all frontend components, backend services, and implemented the database with real-time functionality' },
                  { year: 'Oct 15, 2025', title: 'Problem Solving', desc: 'Overcame technical challenges including responsive design issues, API optimization, and database performance independently' },
                  { year: 'Oct 18, 2025', title: 'Project Completion', desc: 'Successfully deployed the complete CarHub360 platform with all features working and documentation completed' }
                ].map((milestone, index) => (
                  <div key={index} className={`flex items-center mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-5/12">
                      <div className={`glass-card p-8 transform transition-all duration-500 hover:scale-105 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                        <div className="text-3xl font-bold text-[var(--primary-color)] mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{milestone.title}</h3>
                        <p className="text-[var(--text-secondary)]">{milestone.desc}</p>
                      </div>
                    </div>
                    <div className="w-2/12 flex justify-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full border-4 border-[var(--bg-primary)] z-10"></div>
                    </div>
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Values Grid */}
          <section className="py-20" id="values" data-animate>
            <div className={`transition-all duration-1000 ${isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-5xl font-bold text-center mb-16">
                <span className="bg-gradient-to-r from-[var(--secondary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                  What Drives Us
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="glass-card p-8 group hover:border-[var(--primary-color)]/50 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.gradient} flex items-center justify-center mr-6 group-hover:rotate-12 transition-transform duration-300`}>
                        <div className={`icon-${value.icon} text-white text-2xl`}></div>
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors duration-300">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Spotlight */}
          <section className="py-20" id="team" data-animate>
            <div className={`transition-all duration-1000 ${isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-5xl font-bold text-center mb-16">
                <span className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] bg-clip-text text-transparent">
                  Meet the Developer
                </span>
              </h2>
              
              <div className="flex justify-center">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    id="profile-card"
                    className="glass-card p-8 text-center max-w-md group hover:border-[var(--secondary-color)]/50 transition-all duration-300 transform-gpu"
                    style={{
                      transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                    onMouseEnter={() => setIsHoveringProfile(true)}
                    onMouseLeave={() => {
                      setIsHoveringProfile(false);
                      setMousePosition({ x: 0, y: 0 });
                    }}
                  >
                    <div className="relative mb-6 overflow-hidden rounded-full">
                      <div className={`absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] rounded-full opacity-75 ${isVisible.team ? 'animate-spin-slow' : ''}`}></div>
                      <div className="relative p-1">
                        <img
                          src={member.images[currentImageIndex]}
                          alt={member.name}
                          className={`w-40 h-40 rounded-full mx-auto object-cover ${isVisible.team ? 'animate-fade-in-up' : 'opacity-0'} transition-opacity duration-500`}
                          style={{ animationDelay: '0.3s', animationDuration: '1s' }}
                        />
                      </div>
                      <div className="absolute inset-0 w-40 h-40 rounded-full mx-auto bg-gradient-to-r from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 group-hover:opacity-0 transition-opacity duration-300"></div>
                    </div>
                    <h4 className={`text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--secondary-color)] transition-colors duration-300 ${isVisible.team ? 'animate-fade-in-up' : 'opacity-0'}`}
                        style={{ animationDelay: '0.4s', animationDuration: '1s' }}>
                      {member.name}
                    </h4>
                    <p className={`text-[var(--primary-color)] font-semibold mb-3 ${isVisible.team ? 'animate-fade-in-up' : 'opacity-0'}`}
                        style={{ animationDelay: '0.5s', animationDuration: '1s' }}>{member.role}</p>
                    <p className={`text-[var(--text-secondary)] ${isVisible.team ? 'animate-fade-in-up' : 'opacity-0'}`}
                        style={{ animationDelay: '0.6s', animationDuration: '1s' }}>{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Animated Achievement Counter */}
          <section className="py-20" id="stats" data-animate>
            <div className={`transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="glass-card p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 via-[var(--secondary-color)]/5 to-[var(--accent-color)]/5"></div>
                
                <h2 className="text-5xl font-bold mb-16 relative z-10">
                  <span className="bg-gradient-to-r from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
                    Impact That Matters
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="group">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className={`icon-${achievement.icon} text-2xl ${achievement.color}`}></div>
                      </div>
                      <div className={`text-4xl md:text-5xl font-black mb-2 ${achievement.color} group-hover:scale-110 transition-transform duration-300`}>
                        {achievement.count}
                      </div>
                      <div className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300">
                        {achievement.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    );
  } catch (error) {
    console.error('AboutContent component error:', error);
    return null;
  }
}
