// Simplified Car Viewer Main App
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Viewer error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
                    <div className="glass-card p-8 text-center max-w-md">
                        <div className="icon-alert-triangle text-6xl text-[var(--warning-color)] mb-4"></div>
                        <h2 className="text-2xl font-bold mb-4">Viewer Error</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Unable to load the car viewer. Please refresh the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-full"
                        >
                            Reload Viewer
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function CarViewerApp() {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <Viewport3D />
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <CarViewerApp />
    </ErrorBoundary>
);