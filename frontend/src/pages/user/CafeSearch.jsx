import { useState, useEffect } from 'react';
import { searchCafes } from '../../services/cafeService';
import { Search, MapPin, Star, Clock, Heart, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CafeSearchPage() {
    const navigate = useNavigate();
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Filter states
    const [filters, setFilters] = useState({
        keyword: '',
        city: '',
        district: '',
        priceMin: '',
        priceMax: '',
        rating: '',
        openNow: false,
        hasWifi: undefined,
        hasAc: undefined,
        isQuiet: undefined,
        hasParking: undefined,
        allowPets: undefined,
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        handleSearch();
    }, [pagination.page]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
            };
            const data = await searchCafes(params);
            setCafes(data.data || []);
            setPagination(prev => ({ ...prev, total: data.total || 0 }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">カフェ検索</h1>
                    <p className="text-gray-600 mt-2">お気に入りのカフェを見つけよう</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                キーワード
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={filters.keyword}
                                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                    placeholder="カフェ名、住所で検索"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                都市
                            </label>
                            <input
                                type="text"
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                placeholder="例: Hanoi"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* District */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                地区
                            </label>
                            <input
                                type="text"
                                value={filters.district}
                                onChange={(e) => handleFilterChange('district', e.target.value)}
                                placeholder="例: Cau Giay"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
                    </button>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    最低価格
                                </label>
                                <input
                                    type="number"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    placeholder="20000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    最高価格
                                </label>
                                <input
                                    type="number"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    placeholder="100000"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    最低評価
                                </label>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">すべて</option>
                                    <option value="4">4★ 以上</option>
                                    <option value="3">3★ 以上</option>
                                </select>
                            </div>

                            {/* Open Now */}
                            <div className="flex items-center pt-8">
                                <input
                                    type="checkbox"
                                    id="openNow"
                                    checked={filters.openNow}
                                    onChange={(e) => handleFilterChange('openNow', e.target.checked)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="openNow" className="ml-2 text-sm text-gray-700">
                                    営業中のみ
                                </label>
                            </div>

                            {/* Amenities */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="hasWifi"
                                    checked={filters.hasWifi === true}
                                    onChange={(e) => handleFilterChange('hasWifi', e.target.checked ? true : undefined)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="hasWifi" className="ml-2 text-sm text-gray-700">
                                    Wi-Fi有り
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="hasAc"
                                    checked={filters.hasAc === true}
                                    onChange={(e) => handleFilterChange('hasAc', e.target.checked ? true : undefined)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="hasAc" className="ml-2 text-sm text-gray-700">
                                    エアコン有り
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isQuiet"
                                    checked={filters.isQuiet === true}
                                    onChange={(e) => handleFilterChange('isQuiet', e.target.checked ? true : undefined)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="isQuiet" className="ml-2 text-sm text-gray-700">
                                    静か
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="hasParking"
                                    checked={filters.hasParking === true}
                                    onChange={(e) => handleFilterChange('hasParking', e.target.checked ? true : undefined)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="hasParking" className="ml-2 text-sm text-gray-700">
                                    駐車場有り
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="allowPets"
                                    checked={filters.allowPets === true}
                                    onChange={(e) => handleFilterChange('allowPets', e.target.checked ? true : undefined)}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="allowPets" className="ml-2 text-sm text-gray-700">
                                    ペット可
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                    >
                        {loading ? '検索中...' : '検索'}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        エラー: {error}
                    </div>
                )}

                {/* Results Count */}
                <p className="text-gray-600 mb-4">{pagination.total}件の結果</p>

                {/* Cafe List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                ) : cafes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">カフェが見つかりませんでした</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cafes.map((cafe) => (
                            <div
                                key={cafe.id}
                                onClick={() => navigate(`/cafes/${cafe.id}`)}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex"
                            >
                                <img
                                    src={cafe.coverUrl || '/placeholder-cafe.jpg'}
                                    alt={cafe.name}
                                    className="w-48 h-48 object-cover"
                                />
                                <div className="flex-1 p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{cafe.name}</h3>

                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{cafe.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Heart className="w-4 h-4" />
                                            <span>{cafe.favoritesCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{cafe.addressLine}, {cafe.district}, {cafe.city}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{cafe.openTime} - {cafe.closeTime}</span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        価格: {cafe.avgPriceMin?.toLocaleString()}đ - {cafe.avgPriceMax?.toLocaleString()}đ
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > pagination.limit && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            前へ
                        </button>
                        <span className="px-4 py-2">
                            ページ {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            次へ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
