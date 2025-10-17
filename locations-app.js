class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Locations app error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                    <div className="glass-card p-8 text-center">
                        <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-[var(--text-secondary)] mb-4">Please refresh the page to try again.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn-primary"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function LocationsApp() {
    return (
        <ErrorBoundary>
            <HubLocationsView />
        </ErrorBoundary>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LocationsApp />);