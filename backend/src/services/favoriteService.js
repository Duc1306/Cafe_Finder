const { Favorite, Cafe, CafePhoto, Review, sequelize } = require('../models');

const { Op } = require('sequelize');



const favoriteService = {

    /**

     * Toggle: Thêm hoặc Xóa yêu thích

     */

    toggleFavorite: async (userId, cafeId) => {

        // 1. Check quán tồn tại

        const cafe = await Cafe.findByPk(cafeId);

        if (!cafe) throw { status: 404, message: "Quán không tồn tại." };



        // 2. Check đã like chưa

        const existing = await Favorite.findOne({

            where: { user_id: userId, cafe_id: cafeId }

        });



        if (existing) {

            await existing.destroy();

            return { status: 'removed', message: 'Đã xóa khỏi yêu thích' };

        } else {

            await Favorite.create({ user_id: userId, cafe_id: cafeId });

            return { status: 'added', message: 'Đã thêm vào yêu thích' };

        }

    },

    /**
     * Thêm vào yêu thích
     */
    addFavorite: async (userId, cafeId) => {
        const cafe = await Cafe.findByPk(cafeId);
        if (!cafe) throw { status: 404, message: "Quán không tồn tại." };

        const [favorite, created] = await Favorite.findOrCreate({
            where: { user_id: userId, cafe_id: cafeId },
            defaults: { user_id: userId, cafe_id: cafeId }
        });

        return { 
            status: created ? 'added' : 'already_exists', 
            message: created ? 'Đã thêm vào yêu thích' : 'Đã có trong yêu thích',
            isFavorite: true
        };
    },

    /**
     * Xóa khỏi yêu thích
     */
    removeFavorite: async (userId, cafeId) => {
        const deleted = await Favorite.destroy({
            where: { user_id: userId, cafe_id: cafeId }
        });

        return { 
            status: deleted > 0 ? 'removed' : 'not_found',
            message: deleted > 0 ? 'Đã xóa khỏi yêu thích' : 'Không tìm thấy',
            isFavorite: false
        };
    },



    /**

     * Lấy danh sách yêu thích (Full Logic: Search, Filter, Sort, Paginate)

     */

    getFavorites: async (userId, query) => {

        const {

            page = 1,

            limit = 10,

            keyword = '',

            area = '', // city hoặc district

            minRating = 0,

            sort = 'newest' // 'newest', 'oldest', 'rating_desc', 'name_asc'

        } = query;



        // ---------------------------------------------------------

        // BƯỚC 1: Lấy danh sách thô từ DB (Favorite + Cafe)

        // ---------------------------------------------------------

        const cafeWhere = { status: 'ACTIVE' };



        // Filter theo tên quán hoặc địa chỉ ngay tầng DB cho nhẹ

        if (keyword) {

            cafeWhere[Op.or] = [

                { name: { [Op.iLike]: `%${keyword}%` } },

                { address_line: { [Op.iLike]: `%${keyword}%` } }

            ];

        }

        // Filter theo khu vực (nếu có)

        if (area && area !== 'all') {

            cafeWhere[Op.or] = [

                { city: { [Op.iLike]: `%${area}%` } },

                { district: { [Op.iLike]: `%${area}%` } }

            ];

        }



        const rawFavorites = await Favorite.findAll({

            where: { user_id: userId },

            include: [{

                model: Cafe,

                as: 'cafe',

                where: cafeWhere,

                attributes: ['id', 'name', 'address_line', 'district', 'city', 'open_time', 'close_time', 'avg_price_min', 'avg_price_max']

            }],

            raw: true,

            nest: true // Để gom dữ liệu cafe vào object 'cafe'

        });



        if (!rawFavorites.length) {

            return { total: 0, page: Number(page), limit: Number(limit), data: [] };

        }



        const cafeIds = rawFavorites.map(f => f.cafe_id);



        // ---------------------------------------------------------

        // BƯỚC 2: Batch Query lấy thêm Ảnh bìa & Rating

        // ---------------------------------------------------------



        // 2a. Lấy ảnh bìa (is_cover = true)

        const photos = await CafePhoto.findAll({

            where: { cafe_id: cafeIds, is_cover: true },

            attributes: ['cafe_id', 'url'],

            raw: true

        });

        const photoMap = {};

        photos.forEach(p => photoMap[p.cafe_id] = p.url);



        // 2b. Tính Rating trung bình

        const reviews = await Review.findAll({

            where: { cafe_id: cafeIds },

            attributes: [

                'cafe_id',

                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],

                [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.cast(sequelize.col('rating'), 'numeric')), 1), 'avg']

            ],

            group: ['cafe_id'],

            raw: true

        });

        const ratingMap = {};

        reviews.forEach(r => {

            ratingMap[r.cafe_id] = { count: Number(r.count), avg: Number(r.avg) };

        });



        // ---------------------------------------------------------

        // BƯỚC 3: Merge dữ liệu & Filter Rating

        // ---------------------------------------------------------

        let processedList = rawFavorites.map(item => {

            const cid = item.cafe_id;

            const rateInfo = ratingMap[cid] || { count: 0, avg: 0 };



            return {

                id: cid,

                name: item.cafe.name,

                address: `${item.cafe.address_line}, ${item.cafe.district}`,

                full_address: `${item.cafe.address_line}, ${item.cafe.district}, ${item.cafe.city}`,

                thumbnail: photoMap[cid] || null,

                rating: rateInfo.avg,

                review_count: rateInfo.count,

                price_range: `${item.cafe.avg_price_min} - ${item.cafe.avg_price_max}`,

                added_at: item.created_at

            };

        });



        // Filter theo sao (nếu user chọn)

        if (minRating > 0) {

            processedList = processedList.filter(c => c.rating >= minRating);

        }



        // ---------------------------------------------------------

        // BƯỚC 4: Sắp xếp (Sorting)

        // ---------------------------------------------------------

        if (sort === 'rating_desc') {

            processedList.sort((a, b) => b.rating - a.rating);

        } else if (sort === 'name_asc') {

            processedList.sort((a, b) => a.name.localeCompare(b.name));

        } else if (sort === 'oldest') {

            processedList.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));

        } else {

            // Default: 'newest' (Mới thêm lên đầu)

            processedList.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

        }



        // ---------------------------------------------------------

        // BƯỚC 5: Phân trang (Pagination Slice)

        // ---------------------------------------------------------

        const total = processedList.length;

        const startIndex = (page - 1) * limit;

        const endIndex = startIndex + Number(limit);

        const paginatedData = processedList.slice(startIndex, endIndex);



        return {

            total,

            page: Number(page),

            limit: Number(limit),

            data: paginatedData

        };

    }

};



module.exports = favoriteService;