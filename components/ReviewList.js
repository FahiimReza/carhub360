function ReviewList({ reviewableType, reviewableId, user }) {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const reviewsPerPage = 5;

  React.useEffect(() => {
    loadReviews();
  }, [reviewableType, reviewableId, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        reviewable_type: reviewableType,
        reviewable_id: reviewableId,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-lg text-red-400">
        Error loading reviews: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          Customer Reviews ({reviews.length})
        </h3>
        {user && (
          <button className="btn-primary text-sm px-4 py-2">
            Write a Review
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-400'
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