import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaStore, FaCheckCircle, FaStar, FaSearch, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const [cafes, setCafes] = useState([]);
  const [stats, setStats] = useState({ cafes: 0, favorites: 0, reviews: 0, avgRating: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is OWNER
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole || userRole !== 'OWNER') {
      toast.error('オーナーとしてログインしてください');
      window.location.href = '/signin';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview stats (ownerId lấy từ token)
      const overviewRes = await api.get('/owner/dashboard/overview');
      setStats(overviewRes.data.totals);

      // Fetch cafes list
      const shopsRes = await api.get('/owner/shops?page=1&limit=10');
      setCafes(shopsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(`データの取得に失敗しました: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/signin';
  };

  const filteredCafes = cafes.filter(cafe => 
    cafe.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] flex items-center justify-center">
        <div className="text-[#8b1a1a] text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#f3e0dc]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
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
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">ダッシュボード</h1>
          <p className="text-gray-600">カフェの管理と統計情報</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Cafes */}
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaStore className="text-2xl text-[#8b1a1a]" />
              <span className="text-sm font-medium text-gray-600">総カフェ数</span>
            </div>
            <p className="text-4xl font-bold text-[#8b1a1a] mb-1">{stats.cafes}</p>
            <p className="text-xs text-gray-500">登録されているカフェ</p>
          </div>

          {/* Active Cafes */}
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="text-2xl text-green-600" />
              <span className="text-sm font-medium text-gray-600">稼働中カフェ数</span>
            </div>
            <p className="text-4xl font-bold text-[#8b1a1a] mb-1">
              {cafes.filter(c => c.status === 'ACTIVE').length}
            </p>
            <p className="text-xs text-gray-500">営業中のカフェ</p>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaStar className="text-2xl text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">レビュー数</span>
            </div>
            <p className="text-4xl font-bold text-[#8b1a1a] mb-1">{stats.reviews}</p>
            <p className="text-xs text-gray-500">全カフェの合計 (平均: {stats.avgRating})</p>
          </div>
        </div>

        {/* Cafe List Section */}
        <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="カフェ名で検索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d0574b]"
              />
            </div>
            <button 
              onClick={() => navigate('/owner/create-cafe')}
              className="ml-4 px-4 py-2 bg-[#a8201a] hover:bg-[#901a15] text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
            >
              <FaPlus />
              <span>新規カフェ作成</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">カフェID</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">カフェ名</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">住所</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">ステータス</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCafes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      カフェが見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredCafes.map((cafe) => (
                    <tr key={cafe.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">#{cafe.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{cafe.name}</td>
                      <td className="px-4 py-3 text-gray-600">{cafe.address_line}, {cafe.city}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          cafe.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : cafe.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cafe.status === 'ACTIVE' ? '営業中' : 
                           cafe.status === 'PENDING' ? '保留中' : '休止中'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="px-3 py-1 text-xs text-white bg-[#8b1a1a] hover:bg-[#a8201a] rounded transition">
                            詳細
                          </button>
                          <button className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition">
                            編集
                          </button>
                          <button className="px-3 py-1 text-xs text-white bg-gray-500 hover:bg-gray-600 rounded transition">
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
