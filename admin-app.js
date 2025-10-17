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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Something went wrong</h1>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminApp() {
  try {
    const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

    // Check if user is admin
    React.useEffect(() => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        window.location.href = 'login.html';
        return;
      }
      
      const user = JSON.parse(currentUser);
      if (user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
      }
    }, []);

    React.useEffect(() => {
      const handleMouseMove = (e) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
      };

      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }, []);

    return (
      <div className="min-h-screen" data-name="admin-app" data-file="admin-app.js">

        
        <Header />
        <AdminDashboard />
      </div>
    );
  } catch (error) {
    console.error('AdminApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);