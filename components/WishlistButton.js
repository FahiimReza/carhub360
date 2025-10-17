function WishlistButton({ car, className = '' }) {
  try {
    const [isWishlisted, setIsWishlisted] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState(null);

    React.useEffect(() => {
      const user = localStorage.getItem('currentUser');
      if (user) {
        setCurrentUser(JSON.parse(user));
        checkWishlistStatus(JSON.parse(user).objectData.email);
      }
    }, [car]);

    const checkWishlistStatus = (userEmail) => {
      const wishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`) || '[]');
      setIsWishlisted(wishlist.some(item => item.carId === car.objectId));
    };

    const toggleWishlist = (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (!currentUser) {
        alert('Please login to add cars to your wishlist');
        window.location.href = 'login.html';
        return;
      }

      const userEmail = currentUser.objectData.email;
      const wishlistKey = `wishlist_${userEmail}`;
      const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');

      if (isWishlisted) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter(item => item.carId !== car.objectId);
        localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        const wishlistItem = {
          carId: car.objectId,
          carModel: car.objectData?.model || car.name,
          carImage: car.objectData?.imageUrl || car.image,
          carPrice: car.objectData?.rentPricePerDay || 0,
          addedAt: new Date().toISOString()
        };
        wishlist.push(wishlistItem);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        setIsWishlisted(true);
      }
    };

    return (
      <button
        onClick={toggleWishlist}
        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
          isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/10 text-[var(--text-secondary)] hover:bg-red-500 hover:text-white'
        } ${className}`}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        data-name="wishlist-button"
        data-file="components/WishlistButton.js"
      >
        <div className={`icon-heart text-lg ${isWishlisted ? 'animate-pulse' : ''}`}></div>
      </button>
    );
  } catch (error) {
    console.error('WishlistButton component error:', error);
    return null;
  }
}