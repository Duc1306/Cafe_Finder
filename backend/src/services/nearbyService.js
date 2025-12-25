// src/services/nearbyService.js
const { Cafe, CafePhoto, Review, sequelize } = require("../models");
const { Op } = require("sequelize");

const nearbyService = {
  /**
   * Tìm quán quanh đây theo tọa độ (Haversine Formula)
   */
  searchNearby: async (query) => {
    const {
      lat,
      lng,
      radius = 2, // Mặc định 2km
      limit = 20, // Giới hạn kết quả
    } = query;

    // Validate tọa độ
    if (!lat || !lng) {
      throw { status: 400, message: "Thiếu tọa độ (lat, lng)." };
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // 1. Công thức Haversine (Tính khoảng cách km)
    // 6371 là bán kính trái đất (km)
    const haversine = `(
      6371 * acos(
        cos(radians(${userLat}))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(${userLng}))
        + sin(radians(${userLat}))
        * sin(radians(latitude))
      )
    )`;

    // 2. Query DB: Lấy quán ACTIVE, tính khoảng cách, lọc theo radius, sắp xếp gần nhất
    const nearbyCafes = await Cafe.findAll({
      attributes: {
        include: [[sequelize.literal(haversine), "distance"]],
      },
      where: {
        status: "ACTIVE",
        [Op.and]: sequelize.where(
          sequelize.literal(haversine),
          "<=",
          searchRadius
        ),
      },
      order: sequelize.col("distance"), // Gần nhất lên đầu
      limit: Number(limit),
      raw: true,
    });

    if (!nearbyCafes.length) {
      return {
        count: 0,
        radius: searchRadius,
        user_location: { lat: userLat, lng: userLng },
        data: [],
      };
    }

    const cafeIds = nearbyCafes.map((c) => c.id);

    // 3. Batch Query: Lấy Ảnh bìa + Rating (Copy logic từ service cũ sang)

    // 3a. Lấy ảnh bìa
    const photos = await CafePhoto.findAll({
      where: { cafe_id: cafeIds, is_cover: true },
      attributes: ["cafe_id", "url"],
      raw: true,
    });
    const photoMap = {};
    photos.forEach((p) => (photoMap[p.cafe_id] = p.url));

    // 3b. Lấy Rating trung bình
    const reviews = await Review.findAll({
      where: { cafe_id: cafeIds },
      attributes: [
        "cafe_id",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [
          sequelize.fn(
            "ROUND",
            sequelize.fn(
              "AVG",
              sequelize.cast(sequelize.col("rating"), "numeric")
            ),
            1
          ),
          "avg",
        ],
      ],
      group: ["cafe_id"],
      raw: true,
    });
    const ratingMap = {};
    reviews.forEach((r) => {
      ratingMap[r.cafe_id] = { count: Number(r.count), avg: Number(r.avg) };
    });

    // 4. Merge dữ liệu và Tính thời gian đi bộ
    const WALKING_SPEED_KMH = 5; // Tốc độ đi bộ trung bình 5km/h

    const resultData = nearbyCafes.map((cafe) => {
      const rateInfo = ratingMap[cafe.id] || { count: 0, avg: 0 };
      const distanceKm = parseFloat(cafe.distance); // Khoảng cách (km)

      // Tính thời gian đi bộ (phút) = (km / 5) * 60
      const walkingTimeMin = Math.ceil((distanceKm / WALKING_SPEED_KMH) * 60);

      return {
        id: cafe.id,
        name: cafe.name,
        lat: parseFloat(cafe.latitude),
        lng: parseFloat(cafe.longitude),
        distance: distanceKm.toFixed(2) + " km", // Format: "1.25 km"
        distance_raw: distanceKm,
        walking_time: `${walkingTimeMin} phút`,
        address: `${cafe.address_line}, ${cafe.district}`,
        price_range: `${cafe.avg_price_min} - ${cafe.avg_price_max}`,
        open_time: cafe.open_time,
        close_time: cafe.close_time,
        thumbnail: photoMap[cafe.id] || null,
        rating: rateInfo.avg,
        review_count: rateInfo.count,
      };
    });

    return {
      count: resultData.length,
      radius: searchRadius,
      user_location: { lat: userLat, lng: userLng },
      data: resultData,
    };
  },
};

module.exports = nearbyService;
