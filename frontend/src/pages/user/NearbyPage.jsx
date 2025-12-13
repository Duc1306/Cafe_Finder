import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, ArrowLeft, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import CafeCard from "../../components/CafeCard";
import nearbyService from "../../services/nearbyService";

// --- CẤU HÌNH ICON ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let BlueIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = BlueIcon;

const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

export default function NearbyPage() {
    const navigate = useNavigate();
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(2);
    const [errorMsg, setErrorMsg] = useState("");

    const getCurrentLocation = () => {
        setLoading(true);
        setErrorMsg("");

        // Toast thông báo đang bắt đầu quét
        toast.info("位置情報を取得中...", { autoClose: 2000 }); // Đang lấy vị trí...

        if (!navigator.geolocation) {
            const msg = "お使いのブラウザは位置情報をサポートしていません。";
            setErrorMsg(msg);
            toast.error(msg); // Báo lỗi Toast
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                //set Time out
                setTimeout(() => {
                    // Toast thành công
                    toast.success("現在地を更新しました！"); // Đã cập nhật vị trí!
                }, 2700
                )

                fetchNearbyCafes(latitude, longitude, radius);
            },
            (error) => {
                console.error("GPS Error:", error);
                const msg = "位置情報を取得できませんでした。GPSをオンにしてください。";
                setErrorMsg(msg);
                toast.error(msg); // Báo lỗi Toast
                setLoading(false);
            }
        );
    };

    const fetchNearbyCafes = async (lat, lng, r) => {
        try {
            setLoading(true);
            const res = await nearbyService.getNearbyCafes(lat, lng, r);
            if (res.success) {
                setCafes(res.data);
            }
        } catch (err) {
            console.error("API Error:", err);
            setErrorMsg("サーバー接続エラーが発生しました。"); // Lỗi server
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (userLocation) {
            fetchNearbyCafes(userLocation.lat, userLocation.lng, newRadius);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">近くのカフェを探す</h1> {/* Tìm quán gần đây */}
                        <p className="text-sm text-gray-500 mt-1">
                            {userLocation
                                ? `現在地: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                                : "位置情報を取得中..."}
                        </p>
                        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
                    </div>
                </div>

                {/* BỘ LỌC */}
                <Card className="p-4 mb-6 bg-white shadow-sm border-none">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="text-sm">検索範囲:</span> {/* Bán kính tìm kiếm */}
                            <div className="flex gap-2">
                                {[1, 2, 5, 10].map((km) => (
                                    <Button
                                        key={km}
                                        variant={radius === km ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleRadiusChange(km)}
                                        className={radius === km ? "bg-red-600 hover:bg-red-700" : ""}
                                    >
                                        {km}km
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={getCurrentLocation}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Navigation className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "スキャン中..." : "現在地を更新"} {/* Đang quét / Làm mới */}
                        </Button>
                    </div>
                    {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
                </Card>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">

                    {/* MAP */}
                    <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-md border relative h-full min-h-[400px]">
                        {userLocation ? (
                            <MapContainer
                                center={[userLocation.lat, userLocation.lng]}
                                zoom={14}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />

                                <Marker position={[userLocation.lat, userLocation.lng]}>
                                    <Popup>現在地 (Bạn đang ở đây)</Popup>
                                </Marker>

                                {cafes.map((cafe) => (
                                    <Marker
                                        key={cafe.id}
                                        position={[cafe.lat, cafe.lng]}
                                        icon={RedIcon}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <b className="block mb-1">{cafe.name}</b>
                                                <span className="text-gray-500">{cafe.distance} - 徒歩{cafe.walking_time?.replace('phút', '分')}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>地図を読み込み中...</p> {/* Đang tải bản đồ */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
                        <h2 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
                            検索結果 ({cafes.length}件)
                        </h2>

                        <div className="space-y-4 pb-4">
                            {cafes.length === 0 && !loading && (
                                <p className="text-gray-500 text-center py-10">{radius}km以内にカフェが見つかりませんでした。</p>
                            )}

                            {cafes.map((cafe) => (
                                <CafeCard
                                    key={cafe.id}
                                    cafe={cafe}
                                    showDistance={true}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}