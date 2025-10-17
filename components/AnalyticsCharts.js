function AnalyticsCharts() {
  try {
    const [dateRange, setDateRange] = React.useState('7days');
    const [analyticsData, setAnalyticsData] = React.useState({
      labels: [],
      dailyLogins: [],
      dailyBookings: [],
      bookingStatuses: { labels: [], data: [] }
    });
    const [loading, setLoading] = React.useState(true);
    const chartRefs = {
      userLogins: React.useRef(null),
      bookingTrends: React.useRef(null),
      bookingStatus: React.useRef(null)
    };
    const [charts, setCharts] = React.useState({});

    React.useEffect(() => {
      loadAnalytics();
      
      const interval = setInterval(() => {
        loadAnalytics();
      }, 10000);
      
      return () => clearInterval(interval);
    }, [dateRange]);

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to empty data
        setAnalyticsData({
          labels: [],
          dailyLogins: [],
          dailyBookings: [],
          bookingStatuses: { labels: [], data: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    React.useEffect(() => {
      if (analyticsData.labels.length > 0) {
        initializeCharts();
      }
      return () => {
        // Cleanup charts on unmount
        Object.values(charts).forEach(chart => {
          if (chart) chart.destroy();
        });
      };
    }, [dateRange, analyticsData]);


    const initializeCharts = () => {
      const { labels, dailyLogins, dailyBookings, bookingStatuses } = analyticsData;
      
      if (labels.length === 0) return; // No data yet
      
      // Destroy existing charts
      Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
      });

      // User Logins Chart
      if (chartRefs.userLogins.current) {
        const ctx1 = chartRefs.userLogins.current.getContext('2d');
        const loginChart = new ChartJS(ctx1, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Daily Logins',
              data: dailyLogins,
              borderColor: 'rgb(0, 212, 255)',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#b0b0b0' }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#b0b0b0' }
              }
            }
          }
        });
        setCharts(prev => ({ ...prev, userLogins: loginChart }));
      }

      // Booking Trends Chart
      if (chartRefs.bookingTrends.current) {
        const ctx2 = chartRefs.bookingTrends.current.getContext('2d');
        const bookingChart = new ChartJS(ctx2, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Bookings',
              data: dailyBookings,
              backgroundColor: 'rgba(255, 64, 129, 0.8)',
              borderColor: 'rgb(255, 64, 129)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#b0b0b0' }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#b0b0b0' }
              }
            }
          }
        });
        setCharts(prev => ({ ...prev, bookingTrends: bookingChart }));
      }

      // Booking Status Pie Chart
      if (chartRefs.bookingStatus.current) {
        const ctx3 = chartRefs.bookingStatus.current.getContext('2d');
        const statusChart = new ChartJS(ctx3, {
          type: 'doughnut',
          data: {
            labels: bookingStatuses.labels,
            datasets: [{
              data: bookingStatuses.data,
              backgroundColor: [
                'rgba(76, 175, 80, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(244, 67, 54, 0.8)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#b0b0b0', padding: 20 }
              }
            }
          }
        });
        setCharts(prev => ({ ...prev, bookingStatus: statusChart }));
      }
    };

    return (
      <div className="mb-8" data-name="analytics-charts" data-file="components/AnalyticsCharts.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analytics Overview</h2>
          <div className="flex space-x-2">
            {['7days', '30days'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  dateRange === range
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-white/10 text-[var(--text-secondary)] hover:bg-white/20'
                }`}
              >
                {range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">User Logins</h3>
              <canvas ref={chartRefs.userLogins} width="400" height="200"></canvas>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Booking Trends</h3>
              <canvas ref={chartRefs.bookingTrends} width="400" height="200"></canvas>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Booking Status</h3>
              <canvas ref={chartRefs.bookingStatus} width="400" height="200"></canvas>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('AnalyticsCharts component error:', error);
    return null;
  }
}