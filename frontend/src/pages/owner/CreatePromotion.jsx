import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { Coffee } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';

export default function CreatePromotion() {
  const navigate = useNavigate();
  const { id } = useParams(); // cafe ID
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'PERCENT',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'プロモーション名は必須です';
    }

    if (!formData.description.trim()) {
      newErrors.description = '説明は必須です';
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value = '割引値は必須です';
    }

    if (formData.discount_type === 'PERCENT' && formData.discount_value > 100) {
      newErrors.discount_value = 'パーセント割引は100以下で入力してください';
    }

    if (!formData.start_date) {
      newErrors.start_date = '開始日は必須です';
    }

    if (!formData.end_date) {
      newErrors.end_date = '終了日は必須です';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = '終了日は開始日より後の日付を指定してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('入力内容を確認してください');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/owner/shops/${id}/promotions`, formData);
      
      if (response.data.success) {
        toast.success('プロモーションを作成しました');
        setTimeout(() => {
          navigate(`/owner/cafes/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Create promotion error:', error);
      toast.error(error.response?.data?.message || 'プロモーションの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/owner/cafes/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/signin');
  };

  const getDiscountText = () => {
    if (!formData.discount_value) return '割引なし';
    
    if (formData.discount_type === 'PERCENT') {
      return `${formData.discount_value}% OFF`;
    } else {
      return `¥${formData.discount_value} OFF`;
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '未設定';
    return dateString;
  };

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#f3e0dc]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className='w-10 h-10 text-[#8b1a1a]'/>
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
        <button
          onClick={handleCancel}
          className="mb-6 text-[#8b1a1a] hover:text-[#a8201a] flex items-center gap-2"
        >
          ← カフェ詳細に戻る
        </button>

        <h1 className="text-3xl font-bold text-[#8b1a1a] mb-8">新規プロモーション作成</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6">基本情報</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Promotion Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロモーション名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8201a] focus:border-transparent"
                  placeholder="例: 春のコーヒー20%OFF"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8201a] focus:border-transparent"
                  placeholder="プロモーションの詳細や条件を記入してください"
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  割引タイプ <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount_type"
                      value="PERCENT"
                      checked={formData.discount_type === 'PERCENT'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    パーセント割引
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount_type"
                      value="FIXED_AMOUNT"
                      checked={formData.discount_type === 'FIXED_AMOUNT'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    固定金額割引
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  割引値 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8201a] focus:border-transparent"
                    placeholder={formData.discount_type === 'PERCENT' ? '例: 20' : '例: 500'}
                  />
                  <span className="text-gray-600">
                    {formData.discount_type === 'PERCENT' ? '%' : '¥'}
                  </span>
                </div>
                {errors.discount_value && <p className="mt-1 text-sm text-red-500">{errors.discount_value}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8201a] focus:border-transparent"
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8201a] focus:border-transparent"
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    作成後すぐに適用する
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#a8201a] text-white rounded-lg hover:bg-[#901a15] transition disabled:bg-gray-400"
                >
                  {loading ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Preview */}
          <div className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6">プレビュー</h2>
            
            <div className="border-2 border-[#a8201a] rounded-lg p-6 bg-[#fffaf9]">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-bold text-[#8b1a1a]">
                  {formData.title || 'プロモーション名'}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  formData.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {formData.is_active ? '適用中' : '無効'}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 min-h-[60px]">
                {formData.description || 'プロモーションの説明がここに表示されます'}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-[#a8201a]">
                  {getDiscountText()}
                </span>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium">実施期間</p>
                  <p>
                    {formatDateForDisplay(formData.start_date)} ~ {formatDateForDisplay(formData.end_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>プレビューについて：</strong> 
                このプレビューは、お客様が見る実際の表示に近い形で表示されています。
              </p>
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
