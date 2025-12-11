import React, { useState } from 'react';
import { Star, MapPin, Clock, Heart, Info, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import defaultPlaceholder from '@/assets/placeholder.jpg';

/**
 * カフェ情報カードコンポーネント (Component Thẻ quán Cafe)
 */
export default function CafeCard({
    cafe,
    showFavoriteButton = false,
    onRemoveFavorite,
    showDistance = false
}) {
    const navigate = useNavigate();

    // State quản lý ảnh
    const [imageSrc, setImageSrc] = useState(cafe.thumbnail || cafe.coverUrl || defaultPlaceholder);

    const goToDetail = () => {
        navigate(`/cafes/${cafe.id}`);
    };

    const handleImageError = () => {
        setImageSrc(defaultPlaceholder);
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">

            {/* --- ẢNH BÌA --- */}
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={goToDetail}>
                <img
                    src={imageSrc}
                    alt={cafe.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Nút Tim (Favorite) */}
                {showFavoriteButton && onRemoveFavorite && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(cafe.id);
                        }}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full shadow-sm h-8 w-8 z-10"
                    >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </Button>
                )}

                {/* Badge Khoảng cách (Tiếng Nhật) */}
                {showDistance && cafe.distance && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center backdrop-blur-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {cafe.distance}
                        {cafe.walking_time && (
                            <span className="flex items-center ml-1 opacity-90">
                                <Footprints className="w-3 h-3 mx-1" />
                                {cafe.walking_time.replace('phút', '分')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* --- NỘI DUNG --- */}
            <div className="p-4 flex flex-col flex-1">
                <h3
                    className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 line-clamp-1"
                    onClick={goToDetail}
                >
                    {cafe.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 border border-yellow-100">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-bold text-xs">{cafe.rating || 0}</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                        ({cafe.review_count || cafe.reviewsCount || 0}件のレビュー)
                    </span>
                </div>

                {/* Địa chỉ & Giờ */}
                <div className="text-gray-500 text-sm space-y-1 mb-4 flex-1">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="line-clamp-2">
                            {cafe.address || `${cafe.addressLine || ''}, ${cafe.district || ''}`}
                        </span>
                    </div>
                    {cafe.openTime && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            <span className="text-xs">
                                {cafe.openTime.slice(0, 5)} - {cafe.closeTime.slice(0, 5)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t flex justify-between items-center mt-auto">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {cafe.price_range
                            ? (cafe.price_range.includes('đ') || cafe.price_range.includes('¥')
                                ? cafe.price_range
                                : `${cafe.price_range} VNĐ`) // Nếu chưa có đơn vị thì thêm 'đ'
                            : (cafe.avgPriceMin
                                ? `${cafe.avgPriceMin.toLocaleString()}đ - ${cafe.avgPriceMax?.toLocaleString()}đ`
                                : "価格情報なし") // "Chưa có giá"
                        }
                    </span>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToDetail}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 h-8 text-xs px-3"
                        >
                            <Info className="w-3 h-3 mr-1" /> 詳細
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}