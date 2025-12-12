import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaHeart, FaStar, FaMapMarkerAlt, FaPhone, FaClock, 
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye 
} from 'react-icons/fa';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../services/api';
import { Coffee } from 'lucide-react';

export default function CafeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cafe, setCafe] = useState(null);
  const [stats, setStats] = useState({
    favorites: 0,
    reviews: 0,
    ratingDistribution: []
    // BỎ revenueTrend và weeklyVisitors
  });
  const [promotions, setPromotions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchCafeDetails();
  }, [id]);

  const fetchCafeDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch cafe detail
      const cafeRes = await api.get(`/owner/shops/${id}`);
      setCafe(cafeRes.data.data);
      
      // Fetch stats
      const statsRes = await api.get(`/owner/shops/${id}/stats`);
      setStats(statsRes.data.data);
      
      // Fetch promotions
      const promoRes = await api.get(`/owner/shops/${id}/promotions`);
      setPromotions(promoRes.data.data);
      
      // Fetch reviews
      const reviewsRes = await api.get(`/owner/shops/${id}/reviews?limit=5`);
      setRecentReviews(reviewsRes.data.data);

    } catch (error) {
      console.error('Failed to fetch cafe details:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/signin';
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { text: '営業中', color: 'bg-green-100 text-green-700' },
      PENDING: { text: '保留中', color: 'bg-yellow-100 text-yellow-700' },
      CLOSED: { text: '休止中', color: 'bg-gray-100 text-gray-600' }
    };
    return badges[status] || badges.PENDING;
  };

  const getDiscountText = (promo) => {
    if (promo.discount_type === 'PERCENT') {
      return `${promo.discount_value}% OFF`;
    }
    return `¥${promo.discount_value} OFF`;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] flex items-center justify-center">
        <div className="text-[#8b1a1a] text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-[#fff7f5] flex items-center justify-center">
        <div className="text-gray-600">カフェが見つかりませんでした</div>
      </div>
    );
  }

  const activePromotions = promotions.filter(p => p.is_active);

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#f3e0dc]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl"><Coffee className='w-10 h-10 text-primary text-[#8b1a1a]'/></span>
            <span className="text-2xl font-bold text-[#8b1a1a]">Cafe Finder</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#a8201a] transition"
          >
            <FaSignOutAlt />
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/owner/dashboard')}
          className="mb-6 text-[#8b1a1a] hover:text-[#a8201a] flex items-center gap-2"
        >
          ← ダッシュボードに戻る
        </button>

        {/* Basic Info Section */}
        <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cafe Photo */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                {cafe.cover_url ? (
                  <img src={cafe.cover_url} alt={cafe.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-gray-400 text-sm">CAFE PHOTO</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-[#8b1a1a]">{cafe.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(cafe.status).color}`}>
                  {getStatusBadge(cafe.status).text}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-gray-700">
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                  <span>{cafe.address_line}, {cafe.city}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPhone />
                  <span>{cafe.phone_contact || '未設定'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaClock />
                  <span>{cafe.open_time} - {cafe.close_time}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{cafe.description}</p>
            </div>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-50 rounded-full">
                <FaHeart className="text-3xl text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">お気に入り</p>
                <p className="text-3xl font-bold text-[#8b1a1a]">{stats.favorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-50 rounded-full">
                <FaStar className="text-3xl text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">レビュー</p>
                <p className="text-3xl font-bold text-[#8b1a1a]">{stats.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#8b1a1a] mb-6">パフォーマンス統計</h2>
          
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">レビュー評価の内訳</h3>
            <div className="max-w-md mx-auto">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#8b1a1a] mb-6">最近のレビュー</h2>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.user_avatar ? (
                      <img src={review.user_avatar} alt={review.user_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-medium">{review.user_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{review.user_name}</p>
                        <p className="text-xs text-gray-500">{review.created_at}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion Management */}
        <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">プロモーション管理</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#a8201a] hover:bg-[#901a15] text-white rounded-lg text-sm font-medium transition">
              <FaPlus />
              <span>新規プロモーション作成</span>
            </button>
          </div>

          {/* Active Promotions Cards */}
          {activePromotions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">適用中のプロモーション</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePromotions.slice(0, 2).map((promo) => (
                  <div key={promo.id} className="border-2 border-[#a8201a] rounded-lg p-6 bg-[#fffaf9]">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-bold text-[#8b1a1a]">{promo.title}</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        適用中
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{promo.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-2xl font-bold text-[#a8201a]">{getDiscountText(promo)}</span>
                      <div className="text-right text-gray-600">
                        <p>{promo.start_date} ~ {promo.end_date}</p>
                        <p className="flex items-center gap-1 justify-end mt-1">
                          <FaEye className="text-gray-400" />
                          <span>{promo.views} 閲覧</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Promotions Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">すべてのプロモーションリスト</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">ステータス</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">プロモーション名</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">割引</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">開始日</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">終了日</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-medium">閲覧数</th>
                    <th className="px-4 py-3 text-center text-gray-600 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          promo.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {promo.is_active ? '適用中' : '終了'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{promo.title}</td>
                      <td className="px-4 py-3 text-[#a8201a] font-semibold">{getDiscountText(promo)}</td>
                      <td className="px-4 py-3 text-gray-600">{promo.start_date}</td>
                      <td className="px-4 py-3 text-gray-600">{promo.end_date}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-gray-400" />
                          {promo.views}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                            <FaEdit />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}