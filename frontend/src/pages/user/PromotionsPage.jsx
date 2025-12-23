import { useState, useEffect } from 'react';
import { getPromotions } from '../../services/cafeService';
import { Search, Tag, Calendar, Percent, DollarSign, MapPin, Store, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PromotionsPage() {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Filter states
    const [filters, setFilters] = useState({
        keyword: '',
        discountType: '',
        cafeName: '',
        city: '',
        district: '',
        status: 'active',
        sortBy: 'end_date',
        sortOrder: 'ASC',
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        handleSearch();
    }, [pagination.page, filters.sortBy, filters.sortOrder]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
            };
            const data = await getPromotions(params);
            setPromotions(data.data || []);
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

    const handleSortChange = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '無期限';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getDiscountDisplay = (type, value) => {
        if (type === 'PERCENT') {
            return `${value}% OFF`;
        }
        return `${Number(value).toLocaleString()}đ OFF`;
    };

    const getStatusBadge = (promo) => {
        const today = new Date().toISOString().split('T')[0];
        if (promo.endDate && promo.endDate < today) {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">終了</span>;
        }
        if (promo.startDate && promo.startDate > today) {
            return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">予定</span>;
        }
        if (promo.isActive) {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">有効</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">無効</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">プロモーション検索</h1>
                    <p className="text-gray-600 mt-2">お得なキャンペーン・割引を見つけよう</p>
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
                                    placeholder="タイトル、説明で検索"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                割引タイプ
                            </label>
                            <select
                                value={filters.discountType}
                                onChange={(e) => handleFilterChange('discountType', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="">すべて</option>
                                <option value="PERCENT">パーセント (%)</option>
                                <option value="FIXED_AMOUNT">固定金額</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ステータス
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="active">有効中</option>
                                <option value="upcoming">予定</option>
                                <option value="expired">終了</option>
                                <option value="all">すべて</option>
                            </select>
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

                    {/* Advanced Filters - Cafe, Area, Sort Options */}
                    {showFilters && (
                        <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            {/* Cafe and Area Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Cafe Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Store className="w-4 h-4 inline mr-1" />
                                        カフェ名
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.cafeName}
                                        onChange={(e) => handleFilterChange('cafeName', e.target.value)}
                                        placeholder="カフェ名で検索"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        都市
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        placeholder="例: Hanoi, Ho Chi Minh"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        地区
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.district}
                                        onChange={(e) => handleFilterChange('district', e.target.value)}
                                        placeholder="例: Cau Giay, Quan 1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        並び替え
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="end_date">終了日</option>
                                        <option value="start_date">開始日</option>
                                        <option value="discount_value">割引額</option>
                                        <option value="created_at">作成日</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        順序
                                    </label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="ASC">昇順 (早い順)</option>
                                        <option value="DESC">降順 (遅い順)</option>
                                    </select>
                                </div>
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

                {/* Sort Quick Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                        <ArrowUpDown className="w-4 h-4" /> クイックソート:
                    </span>
                    <button
                        onClick={() => handleSortChange('end_date')}
                        className={`px-3 py-1 text-sm rounded-full border ${filters.sortBy === 'end_date'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        終了日 {filters.sortBy === 'end_date' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSortChange('discount_value')}
                        className={`px-3 py-1 text-sm rounded-full border ${filters.sortBy === 'discount_value'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        割引額 {filters.sortBy === 'discount_value' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSortChange('start_date')}
                        className={`px-3 py-1 text-sm rounded-full border ${filters.sortBy === 'start_date'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        開始日 {filters.sortBy === 'start_date' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        エラー: {error}
                    </div>
                )}

                {/* Results Count */}
                <p className="text-gray-600 mb-4">{pagination.total}件のプロモーション</p>

                {/* Promotions List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">プロモーションが見つかりませんでした</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promotions.map((promo) => (
                            <div
                                key={promo.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                {/* Discount Badge */}
                                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {promo.discountType === 'PERCENT' ? (
                                                <Percent className="w-6 h-6" />
                                            ) : (
                                                <DollarSign className="w-6 h-6" />
                                            )}
                                            <span className="text-2xl font-bold">
                                                {getDiscountDisplay(promo.discountType, promo.discountValue)}
                                            </span>
                                        </div>
                                        {getStatusBadge(promo)}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{promo.title}</h3>
                                    {promo.description && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{promo.description}</p>
                                    )}

                                    {/* Date Range */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {formatDate(promo.startDate)} ~ {formatDate(promo.endDate)}
                                        </span>
                                    </div>

                                    {/* Cafe Info */}
                                    {promo.cafe && (
                                        <div
                                            onClick={() => navigate(`/cafes/${promo.cafe.id}`)}
                                            className="mt-3 pt-3 border-t border-gray-100 cursor-pointer hover:bg-gray-50 rounded -mx-2 px-2 py-1"
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                <Store className="w-4 h-4 text-red-500" />
                                                <span className="font-medium text-gray-900">{promo.cafe.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{promo.cafe.district}, {promo.cafe.city}</span>
                                            </div>
                                        </div>
                                    )}
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
