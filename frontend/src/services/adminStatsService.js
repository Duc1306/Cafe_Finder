import api from "./api";

const adminStatsService = {
  getAllUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },

  getCafeCount: async () => {
    const res = await api.get("/admin/stats/cafes/count");
    return res.data;
  },
  getReviewCount: async () => {
    const res = await api.get("/admin/stats/reviews/count");
    return res.data;
  },
};

export default adminStatsService;
