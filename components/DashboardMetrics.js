function DashboardMetrics() {
  try {
    const [metrics, setMetrics] = React.useState({
      totalUsers: 0,
      activeCars: 0,
      todayBookings: 0,
      pendingApprovals: 0,
      todayRevenue: 0,
      monthRevenue: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadMetrics();
      const intervalId = setInterval(loadMetrics, 60000); // Refresh every 60 seconds
      return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const loadMetrics = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('/api/admin/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setMetrics({
          totalUsers: data.totalUsers || 0,
          activeCars: data.activeCars || 0,
          todayBookings: data.todayBookings || 0,
          pendingApprovals: data.pendingBookings || 0,
          todayRevenue: data.todayRevenue || 0,
          monthRevenue: data.monthlyRevenue || 0
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
        // Fallback to zero values
        setMetrics({
          totalUsers: 0,
          activeCars: 0,
          todayBookings: 0,
          pendingApprovals: 0,
          todayRevenue: 0,
          monthRevenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    const MetricCard = ({ title, value, icon, color, subtitle, trend }) => (
      <div className="glass-card p-6 hover-glow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[var(--text-secondary)] text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold text-${color} mt-1`}>{loading ? '...' : value}</p>
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-${color}/20 flex items-center justify-center`}>
            <div className={`icon-${icon} text-xl text-${color}`}></div>
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <div className={`icon-trending-up text-green-500 mr-2`}></div>
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8" 
           data-name="dashboard-metrics" data-file="components/DashboardMetrics.js">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon="users"
          color="[var(--primary-color)]"
          trend="+12% this month"
        />
        <MetricCard
          title="Active Cars"
          value={metrics.activeCars}
          icon="car"
          color="[var(--success-color)]"
          subtitle="Available for rent"
        />
        <MetricCard
          title="Today's Bookings"
          value={metrics.todayBookings}
          icon="calendar"
          color="[var(--accent-color)]"
          trend="+5 from yesterday"
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          icon="clock"
          color="[var(--warning-color)]"
          subtitle="Requires attention"
        />
        <MetricCard
          title="Today's Revenue"
          value={`৳${(metrics.todayRevenue / 1000).toFixed(0)}K`}
          icon="dollar-sign"
          color="[var(--secondary-color)]"
          trend="+8% from yesterday"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`৳${(metrics.monthRevenue / 100000).toFixed(1)}L`}
          icon="trending-up"
          color="[var(--primary-color)]"
          subtitle="This month"
        />
      </div>
    );
  } catch (error) {
    console.error('DashboardMetrics component error:', error);
    return null;
  }
}