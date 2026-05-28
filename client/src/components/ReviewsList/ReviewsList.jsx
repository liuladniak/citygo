import { useEffect, useState } from "react";
import axios from "axios";
import ReviewCard from "../ReviewCard/ReviewCard";
import ReviewPhotos from "../ReviewPhotos/ReviewPhotos";
import ReviewForm from "../ReviewForm/ReviewForm";
import StarRating from "../StarRating/StarRating";
import "./ReviewsList.scss";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClient";

const ReviewsList = ({ tourId }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/reviews/tour/${tourId}`,
        {
          params: { page, sort, limit: 8 },
        },
      );
      setReviews(data.reviews);
      setSummary(data.summary);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEligibleBookings = async () => {
    if (!isLoggedIn) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await axios.get(`${API_URL}/api/reviews/user/eligible`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const tourEligible = data.filter((b) => b.tour_id === tourId);
      setEligibleBookings(tourEligible);
      if (tourEligible.length > 0) {
        setSelectedBookingId(tourEligible[0].booking_id);
      }
    } catch (err) {
      console.error("Failed to fetch eligible bookings:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tourId, page, sort]);

  useEffect(() => {
    fetchEligibleBookings();
  }, [isLoggedIn, tourId]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    setEligibleBookings([]);
    fetchReviews(); // refresh
  };

  const sortOptions = [
    { value: "recent", label: "Most recent" },
    { value: "highest", label: "Highest rated" },
    { value: "lowest", label: "Lowest rated" },
  ];

  return (
    <section className="reviews" id="reviews">
      <div className="reviews__header">
        <h3 className="reviews__heading">Reviews</h3>

        {summary?.review_count > 0 && (
          <div className="reviews__summary">
            <StarRating rating={summary.avg_rating} mode="display" size="md" />
            <span className="reviews__avg">{summary.avg_rating}</span>
            <span className="reviews__count">
              ({summary.review_count} reviews)
            </span>
          </div>
        )}
      </div>

      {eligibleBookings.length > 0 && !showForm && (
        <div className="reviews__write-cta">
          <p>You've completed this tour. Share your experience.</p>
          <button
            className="reviews__write-btn"
            onClick={() => setShowForm(true)}
          >
            Write a review
          </button>
        </div>
      )}
      {showForm && selectedBookingId && (
        <ReviewForm
          bookingId={selectedBookingId}
          tourName={eligibleBookings[0]?.tour_name}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {reviews.length > 0 && (
        <div className="reviews__controls">
          <span className="reviews__sort-label">Sort by</span>
          <div className="reviews__sort-options">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                className={`reviews__sort-btn ${sort === opt.value ? "reviews__sort-btn--active" : ""}`}
                onClick={() => {
                  setSort(opt.value);
                  setPage(1);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="reviews__loading">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p className="reviews__empty">
          No reviews yet. Be the first to review this tour.
        </p>
      ) : (
        <>
          <ReviewPhotos reviews={reviews} />
          <div className="reviews__grid">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="reviews__pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="reviews__page-btn"
          >
            Previous
          </button>
          <span className="reviews__page-info">
            {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="reviews__page-btn"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ReviewsList;
