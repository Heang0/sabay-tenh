import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { fetchProductReviews, submitReview, deleteReview } from '../services/api';
import { Star, Trash2, User } from 'lucide-react';

const ReviewSection = ({ productId }) => {
    const { user, isLoggedIn } = useUser();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await fetchProductReviews(productId);
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/user-login');
            return;
        }

        try {
            setSubmitting(true);
            await submitReview({
                productId,
                rating,
                comment,
                userName: user.fullName
            });
            setComment('');
            setRating(5);
            loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const renderStars = (count, size = 16, interactive = false) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type={interactive ? 'button' : undefined}
                        onClick={interactive ? () => setRating(star) : undefined}
                        onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
                        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
                        className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
                        disabled={!interactive}
                    >
                        <Star
                            size={size}
                            className={`${star <= (interactive ? (hoveredStar || rating) : count)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                } transition-colors`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="border-t mt-6 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold text-gray-800 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ការវាយតម្លៃ' : 'Reviews'}
                </h2>
                {totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                        {renderStars(Math.round(averageRating))}
                        <span className="text-sm font-bold text-gray-700 font-sans">{averageRating}</span>
                        <span className="text-sm text-gray-500 font-sans">({totalReviews})</span>
                    </div>
                )}
            </div>

            {/* Add Review Form */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className={`text-sm font-medium text-gray-700 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'សរសេរការវាយតម្លៃ' : 'Write a Review'}
                </h3>
                {isLoggedIn ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div>
                            <label className={`text-xs text-gray-500 mb-1 block ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                {language === 'km' ? 'ផ្កាយ' : 'Rating'}
                            </label>
                            {renderStars(rating, 24, true)}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={language === 'km' ? 'សរសេរមតិយោបល់...' : 'Write your comment...'}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm font-sans focus:ring-2 focus:ring-[#005E7B] focus:border-transparent outline-none resize-none"
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-4 py-2 bg-[#005E7B] text-white rounded-lg text-sm hover:bg-[#004b63] transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                            {submitting
                                ? (language === 'km' ? 'កំពុងបញ្ជូន...' : 'Submitting...')
                                : (language === 'km' ? 'បញ្ជូនការវាយតម្លៃ' : 'Submit Review')}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-3">
                        <p className={`text-sm text-gray-500 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'ចូលគណនីដើម្បីសរសេរការវាយតម្លៃ' : 'Sign in to write a review'}
                        </p>
                        <button
                            onClick={() => navigate('/user-login')}
                            className={`px-4 py-2 bg-[#005E7B] text-white rounded-lg text-sm hover:bg-[#004b63] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                            {language === 'km' ? 'ចូលគណនី' : 'Sign In'}
                        </button>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-[#005E7B] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            ) : reviews.length === 0 ? (
                <p className={`text-center text-sm text-gray-400 py-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'មិនទាន់មានការវាយតម្លៃ' : 'No reviews yet. Be the first!'}
                </p>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 font-sans">{review.userName}</p>
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating, 12)}
                                            <span className="text-xs text-gray-400 font-sans ml-1">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isLoggedIn && user?.id === review.userId && (
                                    <button
                                        onClick={() => handleDeleteReview(review._id)}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-600 mt-2 font-sans">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
