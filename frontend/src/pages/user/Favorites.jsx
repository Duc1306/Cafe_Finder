import { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../../services/cafeService';
import { Heart, MapPin, Star, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [cafeToRemove, setCafeToRemove] = useState(null);

    useEffect(() => {
        loadFavorites();
    }, [pagination.page]);

    const loadFavorites = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFavorites(pagination.page, pagination.limit);
            setFavorites(data.data || []);
            setPagination(prev => ({ ...prev, total: data.total || 0 }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = (cafeId) => {
        setCafeToRemove(cafeId);
        setShowConfirmModal(true);
    };

    const confirmRemoveFavorite = async () => {
        try {
            await removeFavorite(cafeToRemove);
            setShowConfirmModal(false);
            setCafeToRemove(null);
            // Reload favorites
            loadFavorites();
        } catch (err) {
            alert('削除に失敗しました: ' + err.message);
        }
    };

    const cancelRemoveFavorite = () => {
        setShowConfirmModal(false);
        setCafeToRemove(null);
    };

    const filteredFavorites = favorites.filter(cafe =>
        searchKeyword === '' ||
        cafe.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        cafe.addressLine.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">お気に入りカフェ</h1>
                    <p className="text-gray-600 mt-2">
                        {pagination.total}件のお気に入り
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="カフェ名、住所で検索"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        エラー: {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                ) : filteredFavorites.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {favorites.length === 0
                                ? 'お気に入りがまだありません'
                                : '検索結果が見つかりませんでした'}
                        </p>
                        {favorites.length === 0 && (
                            <button
                                onClick={() => navigate('/user/cafes/search')}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                カフェを探す
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Favorites Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFavorites.map((cafe) => (
                                <div
                                    key={cafe.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                                >
                                    {/* Image */}
                                    <div className="relative">
                                        <img
                                            src={cafe.coverUrl || '/placeholder-cafe.jpg'}
                                            alt={cafe.name}
                                            className="w-full h-48 object-cover cursor-pointer"
                                            onClick={() => navigate(`/user/cafes/${cafe.id}`)}
                                        />
                                        <button
                                            onClick={() => handleRemoveFavorite(cafe.id)}
                                            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white shadow-md"
                                        >
                                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3
                                            className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-red-600"
                                            onClick={() => navigate(`/user/cafes/${cafe.id}`)}
                                        >
                                            {cafe.name}
                                        </h3>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{cafe.rating.toFixed(1)}</span>
                                            </div>
                                            <span className="text-gray-500 text-sm">
                                                ({cafe.favoritesCount} お気に入り)
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{cafe.addressLine}, {cafe.district}, {cafe.city}</span>
                                        </div>

                                        {/* Hours */}
                                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                            <Clock className="w-4 h-4" />
                                            <span>{cafe.openTime} - {cafe.closeTime}</span>
                                        </div>

                                        {/* Price */}
                                        <div className="text-sm text-gray-600 mb-3">
                                            価格: {cafe.avgPriceMin?.toLocaleString()}đ - {cafe.avgPriceMax?.toLocaleString()}đ
                                        </div>

                                        {/* Favorited Date */}
                                        {cafe.favoritedAt && (
                                            <div className="text-xs text-gray-400">
                                                追加日: {new Date(cafe.favoritedAt).toLocaleDateString('ja-JP')}
                                            </div>
                                        )}

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => navigate(`/user/cafes/${cafe.id}`)}
                                            className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                        >
                                            詳細を見る
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total > pagination.limit && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    前へ
                                </button>
                                <span className="px-4 py-2 text-gray-700">
                                    ページ {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    次へ
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            お気に入りから削除しますか？
                        </h3>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelRemoveFavorite}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveFavorite}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
