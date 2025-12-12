// CreateCafe.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaSignOutAlt, FaUpload, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { Coffee } from 'lucide-react';

export default function CreateCafe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address_line: '',
    district: '',           
    city: '',
    description: '',
    phone_contact: '',      
    website_url: '',        
    opening_time: '',
    closing_time: '',
    avg_price_min: '',      
    avg_price_max: '',      
    has_wifi: false,
    has_outlet: false,
    has_ac: false,          
    has_parking: false,     
    is_quiet: false,        
    allow_smoking: false,   
    allow_pets: false,      
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/signin';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = [];
    const validPreviews = [];
    
    for (let file of files) {
      // Check file type
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: PNG, JPG, WEBP のみ対応しています`);
        continue;
      }
      
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: ファイルサイズは5MB以下にしてください`);
        continue;
      }
      
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('カフェ名を入力してください');
      return false;
    }
    if (!formData.address_line.trim()) {
      toast.error('住所を入力してください');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('市区町村を入力してください');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('説明文を入力してください');
      return false;
    }
    if (!formData.opening_time) {
      toast.error('開店時間を入力してください');
      return false;
    }
    if (!formData.closing_time) {
      toast.error('閉店時間を入力してください');
      return false;
    }
    if (formData.opening_time >= formData.closing_time) {
      toast.error('閉店時間は開店時間より後にしてください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address_line', formData.address_line);
      submitData.append('district', formData.district); 
      submitData.append('city', formData.city);
      submitData.append('description', formData.description);
      submitData.append('phone_contact', formData.phone_contact); 
      submitData.append('website_url', formData.website_url); 
      submitData.append('opening_time', formData.opening_time);
      submitData.append('closing_time', formData.closing_time);
      submitData.append('avg_price_min', formData.avg_price_min); 
      submitData.append('avg_price_max', formData.avg_price_max); 
      submitData.append('has_wifi', formData.has_wifi);
      submitData.append('has_outlet', formData.has_outlet);
      submitData.append('has_ac', formData.has_ac); 
      submitData.append('has_parking', formData.has_parking); 
      submitData.append('is_quiet', formData.is_quiet); 
      submitData.append('allow_smoking', formData.allow_smoking); 
      submitData.append('allow_pets', formData.allow_pets); 
      
      // Append images
      images.forEach((image) => {
        submitData.append('photos', image);
      });
      
      await api.post('/owner/shops/create', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('カフェを登録しました！');
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create cafe:', error);
      toast.error(`登録に失敗しました: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/owner/dashboard');
  };

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
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#8b1a1a] mb-2">新規カフェ登録</h1>
          <p className="text-gray-600">カフェの基本情報と設備を入力してください</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-[#f3e0dc] p-8">
          {/* ========== SECTION 1: 基本情報 ========== */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6 pb-2 border-b border-[#f3e0dc]">
              基本情報
            </h2>
            
            {/* Cafe Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カフェ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例：カフェ モダン"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                required
              />
            </div>

            {/* Address Line */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住所（番地） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address_line"
                value={formData.address_line}
                onChange={handleInputChange}
                placeholder="例：1-2-3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                required
              />
            </div>

            {/* District & City - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  区/郡
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="例：渋谷区"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  市区町村 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="例：東京都"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明文 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="カフェの説明を入力してください"
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          {/* ========== SECTION 2: 連絡先情報 ========== */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6 pb-2 border-b border-[#f3e0dc]">
              連絡先情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone_contact"
                  value={formData.phone_contact}
                  onChange={handleInputChange}
                  placeholder="例：03-1234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ウェブサイト
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  placeholder="例：https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ========== SECTION 3: 営業時間と価格帯 ========== */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6 pb-2 border-b border-[#f3e0dc]">
              営業時間と価格帯
            </h2>

            {/* Opening Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  営業時間 - 開店 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  営業時間 - 閉店 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低価格（円）
                </label>
                <input
                  type="number"
                  name="avg_price_min"
                  value={formData.avg_price_min}
                  onChange={handleInputChange}
                  placeholder="例：300"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最高価格（円）
                </label>
                <input
                  type="number"
                  name="avg_price_max"
                  value={formData.avg_price_max}
                  onChange={handleInputChange}
                  placeholder="例：1000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ========== SECTION 4: 設備・サービス ========== */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6 pb-2 border-b border-[#f3e0dc]">
              設備・サービス
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WiFi Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Wi-Fi</p>
                  <p className="text-xs text-gray-500">無料Wi-Fiが利用可能</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_wifi"
                    checked={formData.has_wifi}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* AC Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">エアコン</p>
                  <p className="text-xs text-gray-500">冷暖房完備</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={formData.has_ac}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* Outlet Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">電源コンセント</p>
                  <p className="text-xs text-gray-500">コンセントが利用可能</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_outlet"
                    checked={formData.has_outlet}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* Parking Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">駐車場</p>
                  <p className="text-xs text-gray-500">駐車スペースあり</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* Quiet Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">静かな環境</p>
                  <p className="text-xs text-gray-500">落ち着いた雰囲気</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_quiet"
                    checked={formData.is_quiet}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* Smoking Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">喫煙可</p>
                  <p className="text-xs text-gray-500">喫煙スペースあり</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_smoking"
                    checked={formData.allow_smoking}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>

              {/* Pets Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">ペット可</p>
                  <p className="text-xs text-gray-500">ペット同伴OK</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_pets"
                    checked={formData.allow_pets}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d0574b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a8201a]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* ========== SECTION 5: 写真アップロード ========== */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8b1a1a] mb-6 pb-2 border-b border-[#f3e0dc]">
              写真アップロード
            </h2>
            
            {/* Upload Area */}
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#a8201a] transition cursor-pointer bg-gray-50">
                  <FaUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-700 mb-2">クリックまたはドラッグ＆ドロップで画像をアップロード</p>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP (最大 5MB)</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== Action Buttons ========== */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#a8201a] hover:bg-[#901a15] text-white rounded-lg transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
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