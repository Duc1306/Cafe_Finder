import { useState, useEffect } from 'react';
import { getCafeDetail, getCafeReviews, addFavorite, removeFavorite, postReview } from '../../services/cafeService';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, Phone, Wifi, Wind, Volume2, Car, Dog, Cigarette } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

export default function CafeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cafe, setCafe] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        loadCafeData();
    }, [id]);

    const loadCafeData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [cafeData, reviewsData] = await Promise.all([
                getCafeDetail(id),
                getCafeReviews(id, 1, 5)
            ]);

            console.log('Cafe API Response:', cafeData);
            console.log('Reviews API Response:', reviewsData);

            // Handle response format - backend might return { data: {...} } or just {...}
            const cafe = cafeData.data || cafeData;
            const reviews = reviewsData.data || reviewsData.reviews || [];

            setCafe(cafe);
            setReviews(reviews);
        } catch (err) {
            console.error('Load cafe error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        // Favorite functionality disabled
        return;
    };

    const handleOpenReviewModal = () => {
        setShowReviewModal(true);
        setReviewForm({ rating: 5, comment: '' });
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: '' });
    };

    const handleSubmitReview = async () => {
        if (!reviewForm.comment.trim()) {
            toast.info('コメントを入力してください');
            return;
        }

        setSubmittingReview(true);
        try {
            await postReview(id, {
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim()
            });
            toast.success('レビューを投稿しました！');
            handleCloseReviewModal();
            loadCafeData(); // Reload to show new review
        } catch (err) {
            toast.info('レビューの投稿に失敗しました: ' + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error || !cafe) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        エラー: {error || 'カフェが見つかりません'}
                    </div>
                    <button
                        onClick={() => navigate('/user/cafes/search')}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        検索に戻る
                    </button>
                </div>
            </div>
        );
    }

    const amenities = [
        { icon: Wifi, label: 'Wi-Fi', value: cafe.hasWifi },
        { icon: Wind, label: 'エアコン', value: cafe.hasAc },
        { icon: Volume2, label: '静か', value: cafe.isQuiet },
        { icon: Car, label: '駐車場', value: cafe.hasParking },
        { icon: Dog, label: 'ペット可', value: cafe.allowPets },
        { icon: Cigarette, label: '喫煙可', value: cafe.allowSmoking },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← 戻る
                    </button>
                    <button
                        onClick={handleToggleFavorite}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
                    >
                        <Heart className={`w-5 h-5 ${cafe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        {cafe.isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
                    </button>
                </div>

                {/* Cover Image */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <img
                        src={cafe.coverUrl || '/placeholder-cafe.jpg'}
                        alt={cafe.name}
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{cafe.name}</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xl font-bold">{cafe.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-600">({cafe.reviewsCount} レビュー)</span>
                                <span className="text-gray-600">• {cafe.favoritesCount} お気に入り</span>
                            </div>

                            <div className="space-y-3 text-gray-700">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{cafe.addressLine}, {cafe.district}, {cafe.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{cafe.openTime} - {cafe.closeTime}</span>
                                </div>
                                {cafe.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5" />
                                        <span>{cafe.phoneNumber}</span>
                                    </div>
                                )}
                            </div>

                            {cafe.description && (
                                <div className="mt-4 pt-4 border-t">
                                    <h3 className="font-bold mb-2">説明</h3>
                                    <p className="text-gray-700">{cafe.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">設備・サービス</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {amenities.map((amenity, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-2 p-3 rounded-lg ${amenity.value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                                            }`}
                                    >
                                        <amenity.icon className="w-5 h-5" />
                                        <span>{amenity.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">レビュー</h2>
                                <button className="text-red-600 hover:text-red-700 font-medium">
                                    すべて見る →
                                </button>
                            </div>

                            {reviews.length === 0 ? (
                                <p className="text-gray-500">まだレビューがありません</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        {review.userName?.[0] || 'U'}
                                                    </div>
                                                    <span className="font-medium">{review.userName}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span>{review.rating}</span>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-700">{review.comment}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold mb-3">価格帯</h3>
                            <div className="text-2xl font-bold text-red-600">
                                {cafe.avgPriceMin?.toLocaleString()}đ - {cafe.avgPriceMax?.toLocaleString()}đ
                            </div>
                        </div>

                        {/* Photos */}
                        {cafe.photos && cafe.photos.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="font-bold mb-3">写真</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {cafe.photos.slice(0, 4).map((photo, idx) => (
                                        <img
                                            key={idx}
                                            src={photo.url}
                                            alt={`Photo ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                            <button
                                onClick={handleOpenReviewModal}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                レビューを書く
                            </button>
                            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                                地図で見る
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                レビューを書く
                            </h3>

                            {/* Rating */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    評価
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= reviewForm.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-lg font-medium">{reviewForm.rating}.0</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    コメント
                                </label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="このカフェについての感想を書いてください..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCloseReviewModal}
                                    disabled={submittingReview}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                                >
                                    {submittingReview ? '投稿中...' : '投稿する'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer position="top-right" autoClose={2000} />
        </div>
    );
}
