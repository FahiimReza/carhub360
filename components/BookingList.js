function BookingList() {
  try {
    const [bookings, setBookings] = React.useState([]);
    const [carBookings, setCarBookings] = React.useState([]);
    const [serviceBookings, setServiceBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');
    const [currentUser, setCurrentUser] = React.useState(null);

    React.useEffect(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!user.id) {
        window.location.href = 'login.html';
        return;
      }
      setCurrentUser(user);
    }, []);

    React.useEffect(() => {
      if (currentUser) {
        loadBookings();
      }
    }, [currentUser]);

    const loadBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = 'login.html';
          return;
        }

        const userId = currentUser.id;
        const isAdmin = currentUser.role === 'admin';

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch car bookings
        let carUrl = '/api/bookings';
        if (isAdmin) {
          carUrl = '/api/bookings/admin';
        }
        const carResponse = await fetch(carUrl, { headers });
        if (!carResponse.ok) {
          if (carResponse.status === 401 || carResponse.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
          }
          throw new Error('Failed to fetch car bookings');
        }
        const carData = await carResponse.json();
        let fetchedCarBookings = carData.bookings || [];

        fetchedCarBookings = fetchedCarBookings.map(booking => {
          const status = booking.booking_status || booking.status || 'pending';
          return {
            id: booking.id,
            name: booking.car_name || `${booking.brand_name || ''} ${booking.model || ''}`.trim() || 'N/A',
            type: booking.booking_type || 'rental',
            status: status,
            startDate: booking.rental_start_date ? new Date(booking.rental_start_date).toISOString().split('T')[0] : null,
            endDate: booking.rental_end_date ? new Date(booking.rental_end_date).toISOString().split('T')[0] : null,
            customerName: isAdmin ? (booking.user_name || 'N/A') : `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'N/A',
            customerEmail: isAdmin ? (booking.user_email || 'N/A') : (currentUser?.email || 'N/A'),
            customerPhone: isAdmin ? null : (currentUser?.phone || 'N/A'),
            totalPrice: booking.total_amount,
            notes: booking.special_requests || booking.notes,
            createdAt: booking.created_at,
            isService: false,
            category: null,
            serviceName: null
          };
        });

        setCarBookings(fetchedCarBookings);

        // Fetch service bookings (assuming similar auth needed; adjust if services route is different)
        let serviceUrl = '/api/services/bookings';
        if (isAdmin) {
          serviceUrl = '/api/services/bookings/admin';
        }
        const serviceResponse = await fetch(serviceUrl, { headers });
        if (!serviceResponse.ok) {
          if (serviceResponse.status === 401 || serviceResponse.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
          }
          throw new Error('Failed to fetch service bookings');
        }
        const serviceData = await serviceResponse.json();
        let fetchedServiceBookings = serviceData.bookings || [];

        fetchedServiceBookings = fetchedServiceBookings.map(booking => ({
          id: booking.id,
          name: booking.service_name,
          type: 'service',
          status: booking.service_status || 'scheduled',
          startDate: booking.scheduled_date ? new Date(booking.scheduled_date).toISOString().split('T')[0] : null,
          endDate: null, // Services don't have end date
          customerName: isAdmin ? booking.user_name : currentUser?.first_name + ' ' + currentUser?.last_name,
          customerEmail: isAdmin ? booking.user_email : currentUser?.email,
          customerPhone: isAdmin ? booking.user_phone : currentUser?.phone,
          totalPrice: booking.total_amount,
          notes: booking.customer_notes,
          createdAt: booking.created_at,
          isService: true,
          category: booking.category,
          serviceName: booking.service_name
        }));

        setServiceBookings(fetchedServiceBookings);

        // Combine for filtering/display
        const allBookings = [...fetchedCarBookings, ...fetchedServiceBookings];
        
        // Remove duplicates based on booking ID
        const uniqueBookings = [];
        const seenIds = new Set();
        
        for (const booking of allBookings) {
          if (!seenIds.has(booking.id)) {
            seenIds.add(booking.id);
            uniqueBookings.push(booking);
          }
        }
        
        setBookings(uniqueBookings);

      } catch (error) {
        console.error('Error loading bookings:', error);
      }
      setLoading(false);
    };



    const updateBookingStatus = async (bookingId, newStatus, booking) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = 'login.html';
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        let url, body;
        if (booking.isService) {
          url = `/api/services/bookings/${bookingId}`;
          body = JSON.stringify({
            service_status: newStatus,
            payment_status: newStatus === 'completed' ? 'paid' : 'pending'
          });
        } else {
          url = `/api/bookings/${bookingId}`;
          body = JSON.stringify({
            status: newStatus,
            payment_status: newStatus === 'confirmed' ? 'paid' : 'pending'
          });
        }

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: body,
        });
        if (!response.ok) {
          throw new Error('Failed to update booking');
        }

        loadBookings();
        alert(`Booking ${newStatus} successfully!`);
      } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update booking status');
      }
    };

    const deleteBooking = async (bookingId, booking) => {
      const isOwner = currentUser && booking.customerEmail === currentUser.email;
      const isAdmin = currentUser && currentUser.role === 'admin';
      const canDelete = isOwner || isAdmin;

      const isPending = booking.status === 'pending' || (booking.isService && booking.status === 'scheduled');
      if (!canDelete || !isPending) {
        alert('You can only delete pending/scheduled bookings');
        return;
      }

      if (!confirm('Are you sure you want to delete this booking? This will cancel it.')) {
        return;
      }

      try {
        await updateBookingStatus(bookingId, 'cancelled', booking);
        loadBookings();
      } catch (error) {
        alert('Failed to delete booking');
      }
    };

    const filteredBookings = React.useMemo(() => {
      // Create a Set to track unique booking IDs and prevent duplicates
      const uniqueBookingIds = new Set();
      const result = [];
      
      for (const booking of bookings) {
        // Skip if we've already processed this booking ID
        if (uniqueBookingIds.has(booking.id)) {
          continue;
        }
        
        uniqueBookingIds.add(booking.id);
        
        // Map statuses for consistency in filtering
        let normalizedStatus = booking.status.toLowerCase();
        if (booking.isService && normalizedStatus === 'scheduled') normalizedStatus = 'pending';
        if (normalizedStatus === 'in_progress') normalizedStatus = 'active';
        if (normalizedStatus === 'no_show') normalizedStatus = 'cancelled';
        
        if (filter === 'all') {
          if (normalizedStatus !== 'cancelled') {
            result.push(booking);
          }
        } else if (normalizedStatus === filter) {
          result.push(booking);
        }
      }
      
      return result;
    }, [bookings, filter]);

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'confirmed':
        case 'completed':
          return 'text-green-400';
        case 'pending':
        case 'scheduled':
          return 'text-yellow-400';
        case 'cancelled':
        case 'no_show':
          return 'text-red-400';
        case 'in_progress':
        case 'active':
          return 'text-blue-400';
        default:
          return 'text-[var(--text-secondary)]';
      }
    };

    // No need for !currentUser check since we redirect in useEffect

    return (
      <div className="pt-20 px-6 min-h-screen" data-name="booking-list" data-file="components/BookingList.js">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Booking Management</h1>
              <p className="text-[var(--text-secondary)]">Manage all car bookings and rental requests</p>
            </div>
            {currentUser && (
              <div className="flex items-center space-x-3 glass-card p-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{currentUser.first_name} {currentUser.last_name}</p>
                  <p className="text-sm text-[var(--text-secondary)] capitalize">{currentUser.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-4 mb-8">
            <div className="flex space-x-4">
              {['all', 'pending', 'confirmed', 'cancelled'].map(status => {
                const count = bookings.filter(b => {
                  let normalizedStatus = b.status.toLowerCase();
                  if (b.isService && normalizedStatus === 'scheduled') normalizedStatus = 'pending';
                  if (normalizedStatus === 'in_progress') normalizedStatus = 'active';
                  if (normalizedStatus === 'no_show') normalizedStatus = 'cancelled';
                  
                  if (status === 'all') return normalizedStatus !== 'cancelled';
                  return normalizedStatus === status;
                }).length;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      filter === status ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="icon-inbox text-6xl text-[var(--text-secondary)] mb-4"></div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Bookings Found</h3>
              <p className="text-[var(--text-secondary)]">No bookings match the current filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={`${booking.id}-${booking.type}-${booking.createdAt}`} className="glass-card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">
                        {booking.isService ? booking.serviceName : booking.name}
                        {booking.isService && booking.category && (
                          <span className="text-sm text-[var(--text-secondary)] block">({booking.category})</span>
                        )}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">{booking.customerName}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{booking.customerPhone || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Type</p>
                      <p className="font-semibold text-[var(--text-primary)] capitalize">{booking.type}</p>
                      {booking.startDate && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          {booking.isService
                            ? `Scheduled: ${booking.startDate}`
                            : `${booking.startDate} - ${booking.endDate || 'TBD'}`
                          }
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Status</p>
                      <p className={`font-semibold capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {currentUser && currentUser.role === 'admin' && (
                        <>
                          {((!booking.isService && booking.status === 'pending') ||
                            (booking.isService && booking.status === 'scheduled')) && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, booking.isService ? 'in_progress' : 'confirmed', booking)}
                                className="btn-primary text-sm"
                              >
                                <div className="icon-check mr-1"></div>
                                {booking.isService ? 'Start Service' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled', booking)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                              >
                                <div className="icon-x mr-1"></div>
                                Cancel
                              </button>
                            </>
                          )}
                          {((!booking.isService && booking.status === 'confirmed') ||
                            (booking.isService && booking.status === 'in_progress')) && (
                            <>
                              {booking.isService && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'completed', booking)}
                                  className="btn-primary text-sm"
                                >
                                  <div className="icon-check mr-1"></div>
                                  Complete
                                </button>
                              )}
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled', booking)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                              >
                                <div className="icon-x mr-1"></div>
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.isService && (booking.status === 'completed' || booking.status === 'active') && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled', booking)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                              <div className="icon-x mr-1"></div>
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                      
                      {currentUser && (
                        ((booking.customerEmail === currentUser.email) || (currentUser.role === 'admin')) && (
                          <button
                            onClick={() => deleteBooking(booking.id, booking)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                          >
                            <div className="icon-trash-2 mr-1"></div>
                            Delete
                          </button>
                        )
                      )}
                      
                      {(!currentUser || currentUser.role !== 'admin') && (
                        <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                          Status: <span className={`font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  } catch (error) {
    console.error('BookingList component error:', error);
    return null;
  }
}