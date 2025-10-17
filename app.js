class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [activeTab, setActiveTab] = React.useState('rent');
    const [selectedFilters, setSelectedFilters] = React.useState({
      type: 'all',
      fuel: 'all',
      transmission: 'all',
      budget: 'all',
      sortBy: 'created'
    });
    const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
      // Initialize global cursor effects
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

      // Ensure OLED dark theme is applied
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');

      document.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    return (
      <div className="min-h-screen" data-name="app" data-file="app.js">

        
        <Header />
        <Hero activeTab={activeTab} setActiveTab={setActiveTab} />
        <CarGrid
          activeTab={activeTab}
          filters={selectedFilters}
          setFilters={setSelectedFilters}
        />
        <Features />
        <Games />
        <Footer />
        <ChatBot />
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
