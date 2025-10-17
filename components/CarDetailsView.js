function CarDetailsView() {
  try {
    const [car, setCar] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('rent');
    const [bookingData, setBookingData] = React.useState({
      startDate: '',
      endDate: '',
      name: '',
      phone: '',
      email: ''
    });
    const [couponData, setCouponData] = React.useState({
      code: '',
      isValid: false,
      message: '',
      discount: 0
    });

    React.useEffect(() => {
      loadCarDetails();
    }, []);
    
    React.useEffect(() => {
      // Listen for review submissions to refresh car data
      const handleReviewSubmitted = (event) => {
        // Only refresh if the review is for the current car
        if (event.detail.reviewableId == car?.id && event.detail.reviewableType === 'car') {
          loadCarDetails();
        }
      };
      
      window.addEventListener('reviewSubmitted', handleReviewSubmitted);
      
      return () => {
        window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
      };
    }, [car?.id]);

    const loadCarDetails = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id');
        
        if (carId) {
          const response = await fetch(`/api/cars/${carId}`);
          if (!response.ok) {
            throw new Error('Car not found');
          }
          const carData = await response.json();
          // Adapt API response to expected structure
          const getSizedImageUrl = (baseUrl, size) => {
            if (!baseUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
            // Strip any existing size suffixes and .webp extension from the filename to get the base path
            const filenameWithoutSuffixAndExtension = baseUrl.replace(/(-(\d+))*\.webp$/, '');
            return `${filenameWithoutSuffixAndExtension}-${size}.webp`;
          };

          setCar({
            id: carData.id,
            brand_name: carData.brand_name,
            rating_average: parseFloat(carData.rating_average) || 0,
            rating_count: parseInt(carData.rating_count) || 0,
            objectId: carData.id,
            objectData: {
              model: `${carData.brand_name} ${carData.model_name}`,
              category: carData.category_name,
              fuelType: carData.fuel_type,
              rentPricePerDay: carData.rental_price_daily,
              priceMin: carData.selling_price * 0.8, // Approximate
              priceMax: carData.selling_price,
              imageUrl: getSizedImageUrl(carData.images && carData.images.length > 0 ? carData.images[0] : null, 400),
              keyFeatures: carData.features ? carData.features.map(f => f.name) : [],
              warranty: '1 Year',
              notes: carData.additional_notes
            },
            images: carData.images || [],
            features: carData.features || []
          });
        } else {
          const response = await fetch('/api/cars?limit=1');
          if (!response.ok) {
            throw new Error('Failed to load cars');
          }
          const data = await response.json();
          if (data.cars && data.cars.length > 0) {
            const carData = data.cars[0];
            setCar({
              id: carData.id,
              brand_name: carData.brand_name,
              rating_average: parseFloat(carData.rating_average) || 0,
              rating_count: parseInt(carData.rating_count) || 0,
              objectId: carData.id,
              objectData: {
                model: `${carData.brand_name} ${carData.model_name}`,
                category: carData.category_name,
                fuelType: carData.fuel_type,
                rentPricePerDay: carData.rental_price_daily,
                priceMin: carData.selling_price * 0.8,
                priceMax: carData.selling_price,
                imageUrl: getSizedImageUrl(carData.images && carData.images.length > 0 ? carData.images[0] : null, 400),
                keyFeatures: carData.features ? carData.features.map(f => f.name) : [],
                warranty: '1 Year',
                notes: carData.additional_notes
              },
              images: carData.images || [],
              features: carData.features || []
            });
          }
        }
      } catch (error) {
        console.error('Error loading car details:', error);
      }
      setLoading(false);
    };

    const handleBooking = async (e) => {
      e.preventDefault();
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          alert('Please log in to make a booking.');
          return;
        }
        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.id;
        if (!userId) {
          alert('Please log in to make a booking.');
          return;
        }

        // Use coupon if valid (only for buy tab)
        if (activeTab === 'buy' && couponData.isValid && couponData.code) {
          try {
            await fetch(`/api/coupons/use/${couponData.code}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: parseInt(userId),
                order_id: `booking_${Date.now()}`
              }),
            });
          } catch (couponError) {
            console.error('Error applying coupon:', couponError);
            // Continue with booking even if coupon application fails
          }
        }

        const bookingDataToSend = {
          user_id: parseInt(userId),
          car_id: car.id || car.objectId,
          booking_type: activeTab === 'rent' ? 'rental' : 'purchase',
          rental_start_date: bookingData.startDate,
          rental_end_date: bookingData.endDate,
          pickup_location: 'Default Pickup',
          dropoff_location: 'Default Dropoff',
          special_requests: `Customer: ${bookingData.name}, Phone: ${bookingData.phone}, Email: ${bookingData.email}${couponData.isValid ? `, Coupon: ${couponData.code}` : ''}`,
          discount_amount: couponData.discount || 0
        };

        if (activeTab !== 'rent') {
          // For purchase inquiry, remove date fields and adjust
          delete bookingDataToSend.rental_start_date;
          delete bookingDataToSend.rental_end_date;
          delete bookingDataToSend.pickup_location;
          delete bookingDataToSend.dropoff_location;
        }

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingDataToSend),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Booking failed');
        }

        const result = await response.json();
        alert(`${activeTab === 'rent' ? 'Rental' : 'Purchase'} request submitted successfully! Booking ID: ${result.bookingId}`);
        
        // Reset coupon after successful booking
        setCouponData({ code: '', isValid: false, message: '', discount: 0 });
      } catch (error) {
        console.error('Booking error:', error);
        alert('Booking failed. Please try again.');
      }
    };

    if (loading) {
      return (
        <div className="pt-20 px-6 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading car details...</p>
          </div>
        </div>
      );
    }

    if (!car || !car.objectData) {
      return (
        <div className="pt-20 px-6 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Car Not Found</h2>
            <a href="index.html" className="btn-primary">Back to Home</a>
          </div>
        </div>
      );
    }

    const formatPrice = (price) => `৳${(price / 100000).toFixed(1)}L`;

    // Helper to calculate days between dates
    const calculateDays = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    };

    // Calculate discounted price (only for buy tab)
    const getDiscountedPrice = () => {
      if (!couponData.isValid || !couponData.discount || activeTab !== 'buy') return null;
      
      const basePrice = car.objectData.priceMin;
      return Math.max(0, basePrice - couponData.discount);
    };

    return (
      <div className="pt-20 px-6 min-h-screen" data-name="car-details-view" data-file="components/CarDetailsView.js">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <nav className="text-sm">
              <a href="index.html" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)]">Home</a>
              <span className="mx-2 text-[var(--text-secondary)]">/</span>
              <span className="text-[var(--primary-color)]">{car.objectData.model || 'Unknown Model'}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <CarImageGallery car={car} />
              <AICarSuggestions currentCar={car} />
            </div>

            <div className="space-y-8">
              <CarBasicInfo car={car} />
              <CarPricing car={car} activeTab={activeTab} setActiveTab={setActiveTab} formatPrice={formatPrice} discountedPrice={getDiscountedPrice()} />
              <CarFeatures car={car} />
              <CarBookingForm
                car={car}
                activeTab={activeTab}
                bookingData={bookingData}
                setBookingData={setBookingData}
                handleBooking={handleBooking}
                couponData={couponData}
                setCouponData={setCouponData}
                discountedPrice={getDiscountedPrice()}
              />
            </div>
          </div>

          <CarSpecifications car={car} />
          <UserReviewsSection
            reviewableType="car"
            reviewableId={car.id}
            carModel={car.objectData.model || 'Unknown'}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('CarDetailsView component error:', error);
    return null;
  }
}