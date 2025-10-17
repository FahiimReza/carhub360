function UserDashboard() {
  try {
    const [activeTab, setActiveTab] = React.useState('profile');
    const [currentUser, setCurrentUser] = React.useState(null);
    const [userBookings, setUserBookings] = React.useState([]);
    const [userReviews, setUserReviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadUserData();
    }, []);

    const loadUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);

        // Load user bookings from API
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/bookings', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const apiBookings = data.bookings || [];
            
            // Transform API bookings to match expected format
            const formattedBookings = apiBookings.map(booking => ({
              objectId: booking.id,
              objectData: {
                carModel: booking.car_name || booking.model_name || 'N/A',
                type: booking.booking_type || 'rental',
                status: booking.booking_status || 'pending',
                startDate: booking.rental_start_date ? new Date(booking.rental_start_date).toISOString().split('T')[0] : null,
                endDate: booking.rental_end_date ? new Date(booking.rental_end_date).toISOString().split('T')[0] : null,
                carId: booking.car_id,
                totalPrice: booking.total_amount
              },
              createdAt: booking.created_at
            }));
            
            setUserBookings(formattedBookings);
          }
        }

        // Load user reviews
        const reviews = await trickleListObjects('review', 100, true);
        const userSpecificReviews = reviews.items.filter(
          review => review.objectData.userEmail === user.email
        );
        setUserReviews(userSpecificReviews);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      setLoading(false);
    };

    if (loading) {
      return (
        <div className="pt-20 px-6 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="pt-32 px-6 min-h-screen" data-name="user-dashboard" data-file="components/UserDashboard.js">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Welcome, {currentUser?.objectData?.name}!
            </h1>
            <p className="text-[var(--text-secondary)]">Manage your profile, bookings, and reviews</p>
          </div>

          {/* Tab Navigation */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-wrap space-x-4">
              {['profile', 'bookings', 'notifications', 'reviews', 'purchases'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg capitalize font-semibold transition-colors ${
                    activeTab === tab ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && <ProfileSection currentUser={currentUser} onUpdate={setCurrentUser} />}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && <BookingsSection bookings={userBookings} />}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && <NotificationPanel />}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && <ReviewsSection reviews={userReviews} onReviewAdded={loadUserData} />}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && <PurchasesSection bookings={userBookings} />}
        </div>
      </div>
    );
  } catch (error) {
    console.error('UserDashboard component error:', error);
    return null;
  }
}

function ProfileSection({ currentUser, onUpdate }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    first_name: currentUser.first_name || '',
    last_name: currentUser.last_name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  if (isEditing) {
    return (
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Edit Profile</h2>
          <button
            onClick={() => setIsEditing(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                required
              />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border border-white/20 rounded-lg text-[var(--text-secondary)] hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Profile Information</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="btn-secondary hover-shine"
        >
          Edit Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[var(--text-secondary)] mb-2">Full Name</label>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            {fullName || 'N/A'}
          </div>
        </div>
        <div>
          <label className="block text-[var(--text-secondary)] mb-2">Email</label>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            {formData.email || 'N/A'}
          </div>
        </div>
        <div>
          <label className="block text-[var(--text-secondary)] mb-2">Phone</label>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            {formData.phone || 'N/A'}
          </div>
        </div>
        <div>
          <label className="block text-[var(--text-secondary)] mb-2">Member Since</label>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsSection({ bookings }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-[var(--text-secondary)]';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="icon-calendar text-6xl text-[var(--text-secondary)] mb-4"></div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Bookings Yet</h3>
          <p className="text-[var(--text-secondary)]">Start exploring our car collection!</p>
          <a href="index.html#cars" className="btn-primary mt-4">Browse Cars</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.objectId} className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{booking.objectData.carModel}</h3>
                  <p className="text-sm text-[var(--text-secondary)] capitalize">{booking.objectData.type}</p>
                  {booking.objectData.startDate && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      {booking.objectData.startDate} - {booking.objectData.endDate}
                    </p>
                  )}
                </div>
                <div>
                  <p className={`font-semibold capitalize ${getStatusColor(booking.objectData.status)}`}>
                    {booking.objectData.status}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Booked: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end">
                  <a href={`car-details.html?id=${booking.objectData.carId}`} 
                     className="text-[var(--primary-color)] hover:underline">
                    View Car Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsSection({ reviews, onReviewAdded }) {
  const [showAddReview, setShowAddReview] = React.useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Reviews</h2>
        <button 
          onClick={() => setShowAddReview(true)}
          className="btn-primary hover:scale-105 transform transition-all duration-300"
        >
          <div className="icon-plus text-lg mr-2"></div>
          Write Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="icon-star text-6xl text-[var(--text-secondary)] mb-4"></div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Reviews Yet</h3>
          <p className="text-[var(--text-secondary)] mb-4">Share your experience with our cars!</p>
          <button 
            onClick={() => setShowAddReview(true)}
            className="btn-primary"
          >
            Write Your First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.objectId} className="glass-card p-6 hover-glow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-[var(--text-primary)] text-lg">{review.objectData.carModel}</h3>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`icon-star text-lg ${i < review.objectData.rating ? 'text-[var(--accent-color)]' : 'text-gray-400'}`}></div>
                  ))}
                  <span className="ml-2 text-[var(--text-secondary)]">({review.objectData.rating}/5)</span>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] mb-3 leading-relaxed">{review.objectData.comment}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <button className="text-[var(--primary-color)] hover:underline text-sm">
                  Edit Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddReview && (
        <AddReviewModal 
          onClose={() => setShowAddReview(false)} 
          onReviewAdded={onReviewAdded} 
        />
      )}
    </div>
  );
}

function PurchasesSection({ bookings }) {
  const [cars, setCars] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCarsData();
  }, []);

  const loadCarsData = async () => {
    try {
      const result = await trickleListObjects('cars', 100, true);
      setCars(result.items);
    } catch (error) {
      console.error('Error loading cars:', error);
    }
    setLoading(false);
  };

  const purchasedCars = bookings.filter(booking => 
    booking.objectData.type === 'buy' && booking.objectData.status === 'confirmed'
  );

  const getCarDetails = (carId) => {
    return cars.find(car => car.objectId === carId);
  };

  const getWarrantyStatus = (purchaseDate, warrantyPeriod) => {
    const purchase = new Date(purchaseDate);
    const warranty = parseInt(warrantyPeriod?.replace(/\D/g, '')) || 3;
    const expiryDate = new Date(purchase);
    expiryDate.setFullYear(purchase.getFullYear() + warranty);
    
    const today = new Date();
    const isExpired = today > expiryDate;
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    return { isExpired, daysLeft, expiryDate, warrantyYears: warranty };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Purchases</h2>
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Purchases</h2>
        <div className="text-[var(--text-secondary)]">
          {purchasedCars.length} car{purchasedCars.length !== 1 ? 's' : ''} owned
        </div>
      </div>

      {purchasedCars.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="icon-shopping-bag text-6xl text-[var(--text-secondary)] mb-4"></div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Purchases Yet</h3>
          <p className="text-[var(--text-secondary)] mb-4">Browse our premium car collection and find your perfect match!</p>
          <a href="index.html#cars" className="btn-primary">Browse Cars for Purchase</a>
        </div>
      ) : (
        <div className="space-y-6">
          {purchasedCars.map((purchase) => {
            const carDetails = getCarDetails(purchase.objectData.carId);
            const warranty = getWarrantyStatus(purchase.createdAt, carDetails?.objectData?.warranty);
            const purchasePrice = carDetails ? `৳${(carDetails.objectData.priceMin / 100000).toFixed(1)}L - ${(carDetails.objectData.priceMax / 100000).toFixed(1)}L` : 'N/A';
            
            return (
              <div key={purchase.objectId} className="glass-card p-6 hover-glow">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Car Image & Basic Info */}
                  <div className="flex items-center space-x-4">
                    {carDetails && (
                      <img 
                        src={carDetails.objectData.imageUrl} 
                        alt={purchase.objectData.carModel}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">
                        {purchase.objectData.carModel}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Purchased: {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-[var(--primary-color)] font-semibold">
                        Price: {purchasePrice}
                      </p>
                    </div>
                  </div>

                  {/* Car Specifications */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[var(--text-primary)]">Specifications</h4>
                    {carDetails ? (
                      <div className="text-sm text-[var(--text-secondary)] space-y-1">
                        <div className="flex justify-between">
                          <span>Engine:</span>
                          <span className="text-[var(--text-primary)]">{carDetails.objectData.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel:</span>
                          <span className="text-[var(--text-primary)]">{carDetails.objectData.fuelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="text-[var(--text-primary)]">{carDetails.objectData.category}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">Details not available</p>
                    )}
                  </div>

                  {/* Warranty Information */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[var(--text-primary)]">Warranty Status</h4>
                    <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      warranty.isExpired 
                        ? 'bg-red-500/20 text-red-400' 
                        : warranty.daysLeft < 90 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {warranty.isExpired 
                        ? 'WARRANTY EXPIRED' 
                        : warranty.daysLeft < 30
                        ? `${warranty.daysLeft} days remaining`
                        : warranty.daysLeft < 365
                        ? `${Math.ceil(warranty.daysLeft / 30)} months left`
                        : `${Math.ceil(warranty.daysLeft / 365)} years left`}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] space-y-1">
                      <div>Coverage: {warranty.warrantyYears} years</div>
                      <div>Expires: {warranty.expiryDate.toLocaleDateString()}</div>
                      {carDetails?.objectData?.warranty && (
                        <div>Terms: {carDetails.objectData.warranty}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3">
                    <a href={`car-details.html?id=${purchase.objectData.carId}`} 
                       className="btn-primary text-center text-sm hover:scale-105 transform transition-all">
                      <div className="icon-eye mr-2"></div>
                      View Details
                    </a>
                    {!warranty.isExpired && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                        <div className="icon-wrench mr-2"></div>
                        Service Request
                      </button>
                    )}
                    <button className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                      <div className="icon-file-text mr-2"></div>
                      Documents
                    </button>
                  </div>
                </div>

                {/* Additional Details */}
                {carDetails?.objectData?.keyFeatures && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h5 className="font-semibold text-[var(--text-primary)] mb-2">Key Features</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {carDetails.objectData.keyFeatures.split(',').slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-[var(--text-secondary)]">
                          <div className="icon-check text-green-400 mr-2"></div>
                          {feature.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddReviewModal({ onClose, onReviewAdded }) {
  const [formData, setFormData] = React.useState({
    carModel: '',
    rating: 5,
    comment: ''
  });
  const [cars, setCars] = React.useState([]);

  React.useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const result = await trickleListObjects('cars', 50, true);
      setCars(result.items);
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      await trickleCreateObject('review', {
        ...formData,
        userEmail: currentUser.email,
        userName: currentUser.name,
        createdAt: new Date().toISOString()
      });
      onReviewAdded();
      onClose();
    } catch (error) {
      alert('Failed to add review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Add Review</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)]">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            value={formData.carModel}
            onChange={(e) => setFormData({...formData, carModel: e.target.value})}
            required
          >
            <option value="">Select Car</option>
            {cars.map(car => (
              <option key={car.objectId} value={car.objectData.model}>
                {car.objectData.model}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-[var(--text-secondary)] mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className={`text-2xl ${star <= formData.rating ? 'text-[var(--accent-color)]' : 'text-gray-400'}`}
                >
                  <div className="icon-star"></div>
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
            placeholder="Write your review..."
            rows="4"
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            required
          />

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex-1">
              Submit Review
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-white/20 rounded-lg text-[var(--text-secondary)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
