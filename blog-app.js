class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Blog app error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
                React.createElement('div', { className: 'text-center' },
                    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Something went wrong'),
                    React.createElement('button', { 
                        className: 'btn-primary', 
                        onClick: () => window.location.reload() 
                    }, 'Reload Page')
                )
            );
        }
        return this.props.children;
    }
}

function BlogApp() {
    try {
        const [user, setUser] = React.useState(() => {
            const saved = localStorage.getItem('currentUser');
            return saved ? JSON.parse(saved) : null;
        });

        return React.createElement('div', { className: 'min-h-screen bg-[var(--bg-primary)]' },
            React.createElement(Header, { user, setUser }),
            React.createElement(BlogFeed, { user })
        );
    } catch (error) {
        console.error('BlogApp component error:', error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(ErrorBoundary, null,
        React.createElement(BlogApp)
    )
);