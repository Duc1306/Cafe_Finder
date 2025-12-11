import api from './api'; // Import instance axios bạn đã cấu hình

const nearbyService = {
    /**
     * Gọi API tìm quán gần đây
     * Endpoint: GET /api/nearby
     * @param {number} lat - Vĩ độ
     * @param {number} lng - Kinh độ
     * @param {number} radius - Bán kính (km)
     * @param {number} limit - Giới hạn số lượng (mặc định 20)
     */
    getNearbyCafes: async (lat, lng, radius, limit = 20) => {
        try {
            const response = await api.get('/nearby', {
                params: {
                    lat,
                    lng,
                    radius,
                    limit
                }
            });

            // Trả về dữ liệu từ server (response.data chứa { success: true, data: [...] })
            return response.data;
        } catch (error) {
            // Lỗi 401 đã có interceptor lo, ở đây chỉ log hoặc ném tiếp lỗi để Component xử lý UI (loading/error text)
            console.error("Error fetching nearby cafes:", error);
            throw error;
        }
    }
};

export default nearbyService;