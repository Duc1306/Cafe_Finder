import React, { useState, useEffect, useCallback } from "react";
import { Heart, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { debounce } from "lodash";

// Components
import { Card } from "../../components/ui/card";
import CafeCard from "../../components/CafeCard";

// Services
import favoriteService from "../../services/favoriteService";
import { getAreas } from "../../services/cafeService"; // Import hàm lấy area mới viết

export default function FavoritesPage() {
    const navigate = useNavigate();

    // --- STATE ---
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [areas, setAreas] = useState([]); // Danh sách khu vực động từ DB

    // --- FILTER STATE ---
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterArea, setFilterArea] = useState("");
    const [filterRating, setFilterRating] = useState(0);
    const [sortBy, setSortBy] = useState("newest");

    // 1. Lấy danh sách Area từ DB khi load trang
    useEffect(() => {
        const fetchAreasData = async () => {
            try {
                const res = await getAreas();
                if (res.success && Array.isArray(res.data)) {
                    setAreas(res.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách khu vực", err);
                // Nếu lỗi thì để mảng rỗng hoặc hardcode fallback
            }
        };
        fetchAreasData();
    }, []);

    // 2. Hàm gọi API lấy danh sách yêu thích
    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const params = {
                keyword: searchKeyword,
                area: filterArea === "all" ? "" : filterArea,
                minRating: filterRating,
                sort: sortBy,
                page: 1,
                limit: 100
            };

            const res = await favoriteService.getFavorites(params);
            if (res.success) {
                setFavorites(res.data);
                setTotalCount(res.total || res.data.length);
            }
        } catch (error) {
            toast.error("データの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    // 3. Debounce cho Search Keyword (để không gọi API liên tục khi gõ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(() => {
        fetchFavorites();
    }, 500), [searchKeyword, filterArea, filterRating, sortBy]);

    // 4. Effect tự động chạy khi filter thay đổi
    // (Thay thế cho nút Search thủ công)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFavorites();
        }, 500); // Đợi 0.5s sau khi filter thay đổi mới gọi API
        return () => clearTimeout(timer);
    }, [searchKeyword, filterArea, filterRating, sortBy]);


    // 5. Xử lý nút Xóa Favorite
    const handleRemoveFavorite = async (cafeId) => {
        try {
            const res = await favoriteService.toggleFavorite(cafeId);
            if (res.success && res.status === 'removed') {
                toast.success("お気に入りから削除しました");
                setFavorites(prev => prev.filter(f => f.id !== cafeId));
                setTotalCount(prev => prev - 1);
            }
        } catch (error) {
            toast.error("削除に失敗しました");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">

                {/* HEADER (Đã bỏ nút Back) */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">お気に入り</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        あなたが保存したカフェ一覧 ({totalCount}件)
                    </p>
                </div>

                {/* SEARCH & FILTER BAR (Tự động chạy) */}
                <Card className="p-6 mb-6 bg-white shadow-sm border-none">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Keyword Input */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">キーワード</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="カフェ名..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        {/* Area Select (Dynamic từ DB) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">エリア</label>
                            <select
                                value={filterArea}
                                onChange={(e) => setFilterArea(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">すべて (All Areas)</option>
                                {/* 👇 Render danh sách lấy từ DB */}
                                {areas.map((area, index) => (
                                    <option key={index} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Select */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">評価</label>
                            <select
                                value={filterRating}
                                onChange={(e) => setFilterRating(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="0">すべて</option>
                                <option value="4">4★以上 (High)</option>
                                <option value="3">3★以上 (Mid)</option>
                            </select>
                        </div>

                        {/* Sort Select */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">並び替え</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="newest">最近追加 (Newest)</option>
                                <option value="rating_desc">評価が高い順 (Rating)</option>
                                <option value="name_asc">名前順 (A-Z)</option>
                                <option value="oldest">古い順 (Oldest)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* LIST RESULT */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">読み込み中...</p>
                    </div>
                ) : favorites.length === 0 ? (
                    <Card className="p-12 text-center bg-white shadow-sm border-none">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500 font-medium">お気に入りはまだありません。</p>
                        <p className="text-xs text-gray-400 mt-1">気になるカフェを見つけて、ハートマークを押してみましょう！</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((cafe) => (
                            <CafeCard
                                key={cafe.id}
                                cafe={cafe}
                                showFavoriteButton={true}
                                onRemoveFavorite={handleRemoveFavorite}
                            />
                        ))}
                    </div>
                )}

            </div>
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
        </div>
    );
}