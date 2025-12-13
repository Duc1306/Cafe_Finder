const favoriteService = require('../services/favoriteService');



const favoriteController = {

    // POST /toggle

    toggle: async (req, res) => {

        try {

            const userId = req.user.id; // Lấy từ token middleware

            const { cafeId } = req.body;



            if (!cafeId) return res.status(400).json({ error: "Missing cafeId" });



            const result = await favoriteService.toggleFavorite(userId, cafeId);

            res.json({ success: true, ...result });

        } catch (error) {

            const status = error.status || 500;

            res.status(status).json({ error: error.message || "Server Error" });

        }

    },



    // GET / (List)

    getList: async (req, res) => {

        try {

            const userId = req.user.id;

            const result = await favoriteService.getFavorites(userId, req.query);

            res.json({ success: true, ...result });

        } catch (error) {

            console.error(error);

            res.status(500).json({ error: "Lỗi lấy danh sách yêu thích" });

        }

    },

    // POST / - Thêm vào yêu thích
    add: async (req, res) => {
        try {
            const userId = req.user.id;
            const { cafeId } = req.body;

            if (!cafeId) return res.status(400).json({ error: "Missing cafeId" });

            const result = await favoriteService.addFavorite(userId, cafeId);
            res.json({ success: true, ...result });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message || "Server Error" });
        }
    },

    // DELETE /:cafeId - Xóa khỏi yêu thích
    remove: async (req, res) => {
        try {
            const userId = req.user.id;
            const { cafeId } = req.params;

            if (!cafeId) return res.status(400).json({ error: "Missing cafeId" });

            const result = await favoriteService.removeFavorite(userId, cafeId);
            res.json({ success: true, ...result });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message || "Server Error" });
        }
    }

};



module.exports = favoriteController;