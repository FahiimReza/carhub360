function CarBookingForm({ car, activeTab, bookingData, setBookingData, handleBooking, couponData, setCouponData, discountedPrice }) {
  try {
    const handleCouponChange = async (e) => {
      const couponCode = e.target.value.toUpperCase();
      console.log('Coupon code entered:', couponCode);
      setCouponData({...couponData, code: couponCode, isValid: false, message: '', discount: 0});
      
      // Only validate coupons for buy tab
      if (activeTab === 'buy' && couponCode.length >= 5) {
        console.log('Validating coupon:', couponCode);
        try {
          const response = await fetch(`/api/coupons/validate/${couponCode}`);
          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.valid) {
            // Check minimum order value (only for purchase)
            const basePrice = car.objectData.priceMin;
            console.log('Base price:', basePrice, 'Min order value:', data.coupon.min_order_value);
            
            if (basePrice >= data.coupon.min_order_value) {
              let discountAmount = 0;
              if (data.coupon.discount_type === 'percentage') {
                discountAmount = basePrice * (data.coupon.discount_value / 100);
                if (data.coupon.max_discount_amount && discountAmount > data.coupon.max_discount_amount) {
                  discountAmount = data.coupon.max_discount_amount;
                }
              } else {
                discountAmount = data.coupon.discount_value;
              }
              
              console.log('Discount amount:', discountAmount);
              
              setCouponData({
                ...couponData,
                code: couponCode,
                isValid: true,
                message: `Coupon applied! ${data.coupon.discount_type === 'percentage' ?
                  `${data.coupon.discount_value}% discount` :
                  `৳${data.coupon.discount_value} off`}`,
                discount: discountAmount
              });
            } else {
              setCouponData({
                ...couponData,
                code: couponCode,
                isValid: false,
                message: `Minimum order value of ৳${data.coupon.min_order_value} required`,
                discount: 0
              });
            }
          } else {
            setCouponData({
              ...couponData,
              code: couponCode,
              isValid: false,
              message: data.message || 'Invalid coupon code',
              discount: 0
            });
          }
        } catch (error) {
          console.error('Error validating coupon:', error);
          setCouponData({
            ...couponData,
            code: couponCode,
            isValid: false,
            message: 'Error validating coupon',
            discount: 0
          });
        }
      }
    };

    const handleRemoveCoupon = () => {
      setCouponData({ code: '', isValid: false, message: '', discount: 0 });
    };

    return (
      <div className="glass-card p-6 hover-glow">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
          <div className="icon-calendar text-[var(--primary-color)] mr-3"></div>
          {activeTab === 'rent' ? 'Book Rental' : 'Purchase Inquiry'}
        </h3>
        <form onSubmit={handleBooking} className="space-y-4">
          {activeTab === 'rent' && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                placeholder="Start Date"
                value={bookingData.startDate}
                onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                required
              />
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                placeholder="End Date"
                value={bookingData.endDate}
                onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                required
              />
            </div>
          )}
          
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
            placeholder="Full Name"
            value={bookingData.name}
            onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
            required
          />
          
          <input
            type="tel"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
            placeholder="Phone Number"
            value={bookingData.phone}
            onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
            required
          />
          
          <input
            type="email"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
            placeholder="Email Address"
            value={bookingData.email}
            onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
            required
          />
          
          {activeTab === 'buy' && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none transition-all duration-300"
                  placeholder="Enter coupon code (optional)"
                  value={couponData.code}
                  onChange={handleCouponChange}
                />
                {couponData.code && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <div className="icon-x"></div>
                  </button>
                )}
              </div>
              {couponData.message && (
                <div className={`text-sm ${couponData.isValid ? 'text-green-500' : 'text-red-500'}`}>
                  {couponData.message}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'buy' && discountedPrice !== null && (
            <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-green-500">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Discounted Price:</span>
                <span className="text-xl font-bold text-green-500">
                  ৳{(discountedPrice / 100000).toFixed(1)}L
                </span>
              </div>
              {couponData.discount > 0 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[var(--text-secondary)] text-sm">You saved:</span>
                  <span className="text-sm text-green-500">
                    ৳{(couponData.discount / 100000).toFixed(1)}L
                  </span>
                </div>
              )}
            </div>
          )}
          
          <button type="submit" className="btn-primary w-full text-lg py-4 hover-shine hover-lift flex items-center justify-center">
            <div className={`icon-${activeTab === 'rent' ? 'calendar' : 'send'} mr-3`}></div>
            {activeTab === 'rent' ? 'Book Now' : 'Send Inquiry'}
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('CarBookingForm component error:', error);
    return null;
  }
}