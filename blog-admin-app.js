class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Blog admin app error:', error, errorInfo);
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

function BlogAdminApp() {
    try {
        const [user, setUser] = React.useState(() => {
            const saved = localStorage.getItem('currentUser');
            return saved ? JSON.parse(saved) : null;
        });

        React.useEffect(() => {
            if (!user || user.role !== 'admin') {
                window.location.href = 'login.html';
            }
        }, [user]);

        if (!user || user.role !== 'admin') {
            return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
                React.createElement('div', { className: 'text-center' },
                    React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Admin access required'),
                    React.createElement('a', { href: 'login.html', className: 'btn-primary' }, 'Login')
                )
            );
        }

        return React.createElement('div', { className: 'min-h-screen bg-[var(--bg-primary)]' },
            React.createElement(Header, { user, setUser }),
            React.createElement(BlogAdminPanel, { user })
        );
    } catch (error) {
        console.error('BlogAdminApp component error:', error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    React.createElement(ErrorBoundary, null,
        React.createElement(BlogAdminApp)
    )
);