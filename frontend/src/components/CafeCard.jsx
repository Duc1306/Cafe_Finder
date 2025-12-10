import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CafeCard({ cafe, showFavoriteButton = false, onRemoveFavorite }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            {/* Image */}
            <div className="relative">
                <img
                    src={cafe.coverUrl || '/placeholder-cafe.jpg'}
                    alt={cafe.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/cafes/${cafe.id}`)}
                />
                {showFavoriteButton && onRemoveFavorite && (
                    <button
                        onClick={() => onRemoveFavorite(cafe.id)}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white shadow-md"
                    >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3
                    className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/cafes/${cafe.id}`)}
                >
                    {cafe.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{cafe.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                        ({cafe.favoritesCount || 0} お気に入り)
                    </span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cafe.addressLine}, {cafe.district}, {cafe.city}</span>
                </div>

                {/* Hours */}
                {cafe.openTime && cafe.closeTime && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{cafe.openTime} - {cafe.closeTime}</span>
                    </div>
                )}

                {/* Price */}
                {cafe.avgPriceMin && cafe.avgPriceMax && (
                    <div className="text-sm text-gray-600 mb-3">
                        価格: {cafe.avgPriceMin.toLocaleString()}đ - {cafe.avgPriceMax.toLocaleString()}đ
                    </div>
                )}

                {/* View Details Button */}
                <button
                    onClick={() => navigate(`/cafes/${cafe.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    詳細を見る
                </button>
            </div>
        </div>
    );
}
