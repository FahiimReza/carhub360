function ReviewForm({ reviewableType, reviewableId, user, onReviewSubmitted }) {
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [pros, setPros] = React.useState('');
  const [cons, setCons] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to write a review.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          reviewable_type: reviewableType,
          reviewable_id: reviewableId,
          rating,
          title,
          content,
          pros,
          cons,
          verified_purchase: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review submitted:', result);

      setRating(5);
      setTitle('');
      setContent('');
      setPros('');
      setCons('');

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      alert('Review submitted successfully! It will be visible after admin approval.');
    } catch (err) {
      setError(err.message);
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-white/5 rounded-lg">
        <p className="text-[var(--text-secondary)]">Please log in to write a review.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Write a Review</h3>
      {error && <div className="text-red-400 mb-4 p-2 bg-red-500/10 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Rating (1-5 Stars)
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-400'
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            className="w-full input-field p-3 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Review
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this car/service..."
            rows="4"
            className="w-full input-field p-3 rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Pros
            </label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="What you liked..."
              rows="2"
              className="w-full input-field p-3 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Cons
            </label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="What could be improved..."
              rows="2"
              className="w-full input-field p-3 rounded-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}