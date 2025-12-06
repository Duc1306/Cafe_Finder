import { useState, useEffect } from 'react';
import { Star, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserReviews() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        avgRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        // TODO: Fetch user's reviews from API
        // For now, using mock data
        setTimeout(() => {
            setReviews([
                {
                    id: 1,
                    cafeId: 1,
                    cafeName: 'Highland Coffee',
                    rating: 5,
                    comment: '素晴らしいカフェです！雰囲気が最高で、コーヒーも美味しかったです。',
                    imageUrl: null,
                    createdAt: '2024-01-15',
                },
                {
                    id: 2,
                    cafeId: 2,
                    cafeName: 'The Coffee House',
                    rating: 4,
                    comment: '良いカフェですが、少し混雑していました。',
                    imageUrl: null,
                    createdAt: '2024-01-10',
                },
            ]);
            setStats({
                total: 2,
                avgRating: 4.5,
                ratingDistribution: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 }
            });
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">あなたのレビュー</h1>
                    <p className="text-gray-600 mt-2">投稿したレビューを管理</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            {/* Overall Stats */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-lg mb-4">統計</h2>

                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-red-600 mb-2">
                                        {stats.avgRating.toFixed(1)}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= Math.round(stats.avgRating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm">平均評価</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-700">{stats.total} レビュー</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="font-bold mb-4">評価分布</h3>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="text-sm w-8">{rating}★</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{
                                                        width: `${stats.total > 0 ? (stats.ratingDistribution[rating] / stats.total) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-8">
                                                {stats.ratingDistribution[rating]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-2">
                            {reviews.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg mb-4">
                                        まだレビューがありません
                                    </p>
                                    <button
                                        onClick={() => navigate('/user/cafes/search')}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        カフェを探す
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                                        >
                                            {/* Cafe Name */}
                                            <div
                                                className="flex items-center justify-between mb-4 cursor-pointer"
                                                onClick={() => navigate(`/user/cafes/${review.cafeId}`)}
                                            >
                                                <h3 className="text-lg font-bold text-gray-900 hover:text-red-600">
                                                    {review.cafeName}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold">{review.rating}</span>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className="text-gray-700 mb-4">{review.comment}</p>
                                            )}

                                            {/* Image */}
                                            {review.imageUrl && (
                                                <img
                                                    src={review.imageUrl}
                                                    alt="Review"
                                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                                />
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="text-red-600 hover:text-red-700 font-medium">
                                                        編集
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-700 font-medium">
                                                        削除
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
