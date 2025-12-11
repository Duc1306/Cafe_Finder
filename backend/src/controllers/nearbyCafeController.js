const nearbyService = require('../services/nearbyService');

const nearbyController = {
    getNearby: async (req, res) => {
        try {
            const { lat, lng, radius, limit } = req.query;
            if (!lat || !lng) return res.status(400).json({ error: "Thiếu tọa độ" });

            const result = await nearbyService.searchNearby({ lat, lng, radius, limit });
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
module.exports = nearbyController;