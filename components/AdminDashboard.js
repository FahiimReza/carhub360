function AdminDashboard() {
  try {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [cars, setCars] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [recentActivities, setRecentActivities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingCar, setEditingCar] = React.useState(null);
    const [showExportModal, setShowExportModal] = React.useState(false);
  
    const token = localStorage.getItem('token') || '';

  React.useEffect(() => {
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, carsResponse] = await Promise.all([
        fetch('/api/admin/users?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/cars?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let usersData = [];
      if (usersResponse.ok) {
        const responseJson = await usersResponse.json();
        usersData = responseJson.users || [];
        console.log('Users fetched from API:', usersData); // Debug log
      } else {
        console.error('Failed to fetch users:', usersResponse.status, await usersResponse.text());
      }

      let carsData = [];
      if (carsResponse.ok) {
        const responseJson = await carsResponse.json();
        carsData = responseJson.cars || [];
        console.log('Cars fetched from API:', carsData); // Debug log
      } else {
        console.error('Failed to fetch cars:', carsResponse.status, await carsResponse.text());
      }

      // Fetch recent activities separately to avoid blocking
      try {
        const activitiesResponse = await fetch('/api/admin/recent-activity?limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let activitiesData = [];
        if (activitiesResponse.ok) {
          const responseJson = await activitiesResponse.json();
          activitiesData = responseJson.activities || [];
          console.log('Recent activities fetched:', activitiesData); // Debug log
        } else {
          console.warn('Failed to fetch recent activities:', activitiesResponse.status);
          activitiesData = [];
        }
        setRecentActivities(activitiesData);
      } catch (activityError) {
        console.warn('Recent activities fetch error:', activityError);
        setRecentActivities([]);
      }

      setCars(carsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setCars([]);
      setUsers([]);
      setRecentActivities([]);
    }
    setLoading(false);
  };

    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          loadData();
        } catch (error) {
          console.error('Delete error:', error);
          alert('Failed to delete user account');
        }
      }
    };

    const deleteCar = async (carId) => {
      if (confirm('Are you sure you want to delete this car?')) {
        try {
          const response = await fetch(`/api/admin/cars/${carId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          loadData();
        } catch (error) {
          console.error('Delete error:', error);
          alert('Failed to delete car');
        }
      }
    };

    const toggleCarAvailability = async (carId, currentStatus) => {
      try {
        const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
        const response = await fetch(`/api/admin/cars/${carId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ availability_status: newStatus })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadData();
      } catch (error) {
        console.error('Toggle error:', error);
        alert('Failed to update car availability');
      }
    };

    const formatPrice = (price) => {
      if (!price || isNaN(price)) return '৳0L';
      return `৳${(price / 100000).toFixed(1)}L`;
    };

    return (
      <div className="pt-20 px-6 min-h-screen" data-name="admin-dashboard" data-file="components/AdminDashboard.js">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Admin Dashboard</h1>
                <p className="text-[var(--text-secondary)]">Real-time insights and platform management</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 glass-card px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-[var(--text-secondary)]">System Online</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowExportModal(true)}
                >
                  <div className="icon-download text-lg mr-2"></div>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Overview */}
          <DashboardMetrics />

          {/* Analytics Charts */}
          {activeTab === 'overview' && <AnalyticsCharts />}

          {/* Tab Navigation */}
          <div className="glass-card p-4 mb-8">
            <div className="flex space-x-4 overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview', icon: 'dashboard' },
                { key: 'cars', label: 'Cars', icon: 'car' },
                { key: 'users', label: 'Users', icon: 'users' },
                { key: 'messages', label: 'Messages', icon: 'message-circle' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-[var(--primary-color)] text-white shadow-lg'
                      : 'text-[var(--text-secondary)] hover:bg-white/10'
                  }`}
                >
                  <div className={`icon-${tab.icon} mr-2`}></div>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></div>
                        <span className="text-sm text-[var(--text-secondary)]">{activity.message}</span>
                      </div>
                    ))}
                    {recentActivities.length === 0 && (
                      <div className="text-center py-4 text-[var(--text-secondary)]">
                        No recent activity
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => setActiveTab('cars')} className="p-4 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 rounded-lg text-left hover:bg-[var(--primary-color)]/20 transition-all">
                      <div className="icon-plus text-[var(--primary-color)] mb-2"></div>
                      <div className="font-semibold text-[var(--text-primary)]">Add Car</div>
                      <div className="text-sm text-[var(--text-secondary)]">Add new vehicle</div>
                    </button>
                    <button onClick={() => setActiveTab('messages')} className="p-4 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 rounded-lg text-left hover:bg-[var(--primary-color)]/20 transition-all">
                      <div className="icon-message-circle text-[var(--primary-color)] mb-2"></div>
                      <div className="font-semibold text-[var(--text-primary)]">Manage Messages</div>
                      <div className="text-sm text-[var(--text-secondary)]">View customer inquiries</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Management */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Messages & Inquiries</h2>
              <AdminMessages token={token} onRefresh={loadData} />
            </div>
          )}

          {/* Cars Management */}
          {activeTab === 'cars' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Cars Management</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {cars.length === 0 ? (
                    <div className="glass-card p-12 text-center col-span-full">
                      <div className="icon-car text-6xl text-[var(--text-secondary)] mb-4"></div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Cars Found</h3>
                      <p className="text-[var(--text-secondary)]">No cars available in the database. Please add some cars or check the database connection.</p>
                      <button
                        onClick={() => setEditingCar({ isNew: true })}
                        className="btn-primary mt-4"
                      >
                        <div className="icon-plus text-lg mr-2"></div>
                        Add First Car
                      </button>
                    </div>
                  ) : (
                    cars.map(car => (
                    <div key={car.id} className="glass-card p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="flex items-center space-x-4">
                          <AnimatedCar
                            brand={car.brand_name || car.brand || 'Unknown Brand'}
                            model={car.model_name || car.model || 'Unknown Model'}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">{`${car.brand_name || car.brand || 'Unknown Brand'} ${car.model_name || car.model || 'Unknown Model'} ${car.variant_name || ''}`}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{car.category_name || car.category || 'Unknown Category'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[var(--primary-color)] font-bold">
                            {formatPrice(car.selling_price || 0)}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            ৳{car.rental_price_daily || 0}/day
                          </p>
                        </div>
                        
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            car.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            (car.status === 'rented' || car.status === 'reserved' || car.status === 'maintenance') ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {car.status || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleCarAvailability(car.id, car.status)}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              (car.status || '') === 'available'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            {(car.status || '') === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                          </button>
                          <button 
                            onClick={() => setEditingCar(car)}
                            className="px-3 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteCar(car.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              )}
            </div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Users Management</h2>
              
              <div className="grid gap-4">
                {users.map(user => (
                  <div key={user.id} className="glass-card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                      </div>
                      <p className="text-[var(--text-secondary)]">{user.phone || 'N/A'}</p>
                      <span className={`px-3 py-1 rounded-full text-sm w-fit ${
                        user.role === 'admin' ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' :
                        'bg-white/10 text-[var(--text-secondary)]'
                      }`}>
                        {user.role || 'user'}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                          disabled={user.role === 'admin'}
                        >
                          {user.role === 'admin' ? 'Protected' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Edit Car Modal */}
          {editingCar && (
            <CarEditModal 
              car={editingCar} 
              onClose={() => setEditingCar(null)}
              onSave={() => {
                setEditingCar(null);
                loadData();
              }}
            />
          )}

          {/* Export Modal */}
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('AdminDashboard component error:', error);
    return null;
  }
}


function CarEditModal({ car, onClose, onSave }) {
  const token = localStorage.getItem('token') || '';

  const [formData, setFormData] = React.useState({
    model_id: car.isNew ? '' : car.model_id,
    variant_name: car.isNew ? '' : car.variant_name || '',
    year: car.isNew ? '' : car.year || '',
    fuel_type: car.isNew ? 'petrol' : car.fuel_type || 'petrol',
    transmission: car.isNew ? 'manual' : car.transmission || 'manual',
    rental_price_daily: car.isNew ? '' : car.rental_price_daily || '',
    selling_price: car.isNew ? '' : car.selling_price || '',
    availability_status: car.isNew ? 'available' : car.availability_status || 'available',
    description: car.isNew ? '' : car.description || '',
    image_url: car.isNew ? '' : car.image_url || ''
  });

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.model_id || !formData.variant_name || !formData.year || !formData.rental_price_daily || !formData.selling_price) {
        alert('Please fill in all required fields: Model ID, Variant Name, Year, Rental Price, Selling Price');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (car.isNew) {
        const createBody = {
          model_id: parseInt(formData.model_id),
          variant_name: formData.variant_name,
          year: parseInt(formData.year),
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          rental_price_daily: parseFloat(formData.rental_price_daily),
          selling_price: parseFloat(formData.selling_price),
          availability_status: formData.availability_status,
          description: formData.description
        };

        const response = await fetch('/api/admin/cars', {
          method: 'POST',
          headers,
          body: JSON.stringify(createBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Car created successfully!');
      } else {
        const updateBody = {
          variant_name: formData.variant_name,
          year: parseInt(formData.year),
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          rental_price_daily: parseFloat(formData.rental_price_daily),
          selling_price: parseFloat(formData.selling_price),
          availability_status: formData.availability_status,
          description: formData.description
        };

        const response = await fetch(`/api/admin/cars/${car.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Car updated successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving car:', error);
      alert('Failed to save car. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {car.isNew ? 'Add New Car' : 'Edit Car'}
          </h3>
          <button onClick={onClose} className="text-[var(--text-secondary)]">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Model ID (required for new car)"
            className="input-field"
            value={formData.model_id}
            onChange={(e) => setFormData({...formData, model_id: e.target.value})}
          />
          
          <input
            type="text"
            placeholder="Variant Name"
            className="input-field"
            value={formData.variant_name}
            onChange={(e) => setFormData({...formData, variant_name: e.target.value})}
          />

          <input
            type="number"
            placeholder="Year"
            className="input-field"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />

          <input
            type="number"
            placeholder="Selling Price (BDT)"
            className="input-field"
            value={formData.selling_price}
            onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
          />

          <input
            type="number"
            placeholder="Rental Price Per Day (BDT)"
            className="input-field"
            value={formData.rental_price_daily}
            onChange={(e) => setFormData({...formData, rental_price_daily: e.target.value})}
          />

          <select
            className="input-field"
            value={formData.fuel_type}
            onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
            <option value="cng">CNG</option>
          </select>

          <select
            className="input-field"
            value={formData.transmission}
            onChange={(e) => setFormData({...formData, transmission: e.target.value})}
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="cvt">CVT</option>
          </select>

          <select
            className="input-field"
            value={formData.availability_status}
            onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
          >
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="rented">Rented</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="mt-4 space-y-4">
          <div className="md:col-span-2">
            <input
              type="url"
              placeholder="Image URL"
              className="input-field"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="Preview" className="w-32 h-20 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <textarea
              placeholder="Description"
              className="input-field h-20 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button onClick={handleSave} className="btn-primary">
            {car.isNew ? 'Create Car' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-white/20 rounded-lg text-[var(--text-secondary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}