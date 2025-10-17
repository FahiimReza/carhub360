function UserReviewsSection({ reviewableType = 'car', reviewableId, carModel }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [refreshReviews, setRefreshReviews] = React.useState(0);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [formRating, setFormRating] = React.useState(5);
  const [formTitle, setFormTitle] = React.useState('');
  const [formContent, setFormContent] = React.useState('');
  const [formPros, setFormPros] = React.useState('');
  const [formCons, setFormCons] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const reviewsPerPage = 5;

  React.useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadReviews();
  }, [reviewableType, reviewableId, currentPage, refreshReviews]);

  const loadReviews = async () => {
    if (!reviewableId || isNaN(Number(reviewableId))) {
      setLoading(false);
      setReviews([]);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const idNum = Number(reviewableId);
      const params = new URLSearchParams({
        reviewable_type: reviewableType,
        reviewable_id: idNum,
        status: 'approved',
        limit: reviewsPerPage,
        offset: (currentPage - 1) * reviewsPerPage
      });

      const response = await fetch(`/api/reviews?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setRefreshReviews(prev => prev + 1);
    setFormRating(5);
    setFormTitle('');
    setFormContent('');
    setFormPros('');
    setFormCons('');
    
    // Trigger a custom event to notify other components that a review was submitted
    window.dispatchEvent(new CustomEvent('reviewSubmitted', {
      detail: {
        reviewableType,
        reviewableId,
        rating: formRating
      }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('You must be logged in to write a review.');
      return;
    }

    if (!reviewableId || isNaN(Number(reviewableId))) {
      setFormError('Invalid review target.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const idNum = Number(reviewableId);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          reviewable_type: reviewableType,
          reviewable_id: idNum,
          rating: formRating,
          title: formTitle,
          content: formContent,
          pros: formPros,
          cons: formCons,
          verified_purchase: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review submitted:', result);

      handleReviewSubmitted();
      alert('Review submitted successfully! It will be visible after admin approval.');
    } catch (err) {
      setFormError(err.message);
      console.error('Error submitting review:', err);
    } finally {
      setFormLoading(false);
    }
  };

  if (!reviewableId || isNaN(Number(reviewableId))) {
    return null;
  }

  if (loading) {
    return (
      <div className="glass-card p-8 mb-16">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 mb-16 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Customer Reviews ({reviews.length})
        </h2>
        {currentUser && currentUser.role !== 'admin' ? (
          <button 
            onClick={() => setShowReviewForm(true)}
            className="btn-primary hover:scale-105 transform transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,212,255,0.25)]"
          >
            <div className="icon-plus text-lg mr-2"></div>
            Write Review
          </button>
        ) : !currentUser ? (
          <a href="login.html" className="btn-primary">
            <div className="icon-user text-lg mr-2"></div>
            Login to Review
          </a>
        ) : null}
      </div>

      {showReviewForm && currentUser && (
        <div className="glass-card p-6 rounded-xl mb-6 border-t border-white/10">
          <h3 className="text-xl font-semibold mb-5 text-[var(--text-primary)]">Write a Review</h3>
          {formError && <div className="text-red-400 mb-4 p-3 bg-red-500/20 rounded border border-red-400">{formError}</div>}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Rating (1-5 Stars)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    aria-label={`Rate ${star} star`}
                    className={`text-2xl ${
                      star <= formRating ? 'text-yellow-400 drop-shadow' : 'text-gray-500'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Summarize your experience..."
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Review
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Share your thoughts on this car/service..."
                rows="4"
                className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Pros
                </label>
                <textarea
                  value={formPros}
                  onChange={(e) => setFormPros(e.target.value)}
                  placeholder="What you liked..."
                  rows="2"
                  className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Cons
                </label>
                <textarea
                  value={formCons}
                  onChange={(e) => setFormCons(e.target.value)}
                  placeholder="What could be improved..."
                  rows="2"
                  className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full py-4 mt-2 disabled:opacity-50 hover:shadow-[0_8px_24px_rgba(0,212,255,0.25)] hover:scale-[1.01] transition-transform"
            >
              {formLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-500/10 rounded-lg text-red-400 mb-6">
          Error loading reviews: {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {review.rating}/5
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                  {review.title}
                </h4>
              )}

              <p className="text-[var(--text-primary)] mb-3 leading-relaxed">
                {review.content}
              </p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  {review.pros && (
                    <div>
                      <span className="font-medium text-green-400">Pros:</span>
                      <p className="text-[var(--text-primary)]">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div>
                      <span className="font-medium text-red-400">Cons:</span>
                      <p className="text-[var(--text-primary)]">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>
                  {review.first_name} {review.last_name}
                </span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        try {
                          const response = await fetch(`/api/reviews/${review.id}`, {
                            method: 'DELETE',
                          });
                          if (!response.ok) {
                            throw new Error('Failed to delete review');
                          }
                          setRefreshReviews(prev => prev + 1);
                          alert('Review deleted successfully');
                        } catch (err) {
                          alert('Error deleting review: ' + err.message);
                        }
                      }
                    }}
                    className="ml-2 text-red-400 hover:text-red-600"
                    title="Delete Review"
                  >
                    <div className="icon-trash text-sm"></div>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/10 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-[var(--text-primary)]">
            Page {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={reviews.length < reviewsPerPage}
            className="px-3 py-2 bg-white/10 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
