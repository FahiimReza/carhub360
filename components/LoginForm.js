function LoginForm() {
  try {
    const [isLogin, setIsLogin] = React.useState(true);
    const [formData, setFormData] = React.useState({
      email: '',
      password: '',
      name: '',
      phone: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
        const submitData = {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          ...(!isLogin && {
            name: formData.name.trim(),
            phone: formData.phone.trim() || '',
            address: '',
            city: ''
          })
        };

        const endpoint = isLogin ? '/api/users/login' : '/api/users/register';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || (isLogin ? 'Invalid email or password. Please check your credentials.' : 'Registration failed. Please try again.'));
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        setMessage(`${isLogin ? 'Login' : 'Registration'} successful! Redirecting...`);

        setTimeout(() => {
          if (isLogin && data.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 1500);

      } catch (error) {
        console.error('Authentication error:', error);
        setMessage(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center px-6" data-name="login-form" data-file="components/LoginForm.js">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                <div className="icon-car text-2xl text-white"></div>
              </div>
              <span className="text-3xl font-bold text-[var(--text-primary)]">CarHub360</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              {isLogin ? 'Welcome back! Sign in to your account' : 'Create your account to get started'}
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-center ${
                  message.includes('successful') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-secondary)]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[var(--primary-color)] hover:underline font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            <div className="mt-6 text-center">
              <a href="index.html" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] text-sm">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('LoginForm component error:', error);
    return null;
  }
}