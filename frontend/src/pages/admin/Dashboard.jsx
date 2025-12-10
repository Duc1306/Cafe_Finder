import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, message } from "antd";
import { UserOutlined, ShopOutlined, FileTextOutlined, StarOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


import adminStatsService from "../../services/adminStatsService";

export default function AdminDashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [ownerCount, setOwnerCount] = useState(0);
  const [cafeCount, setCafeCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);


  // Load dashboard data
  const fetchDashboardData = async () => {
    try {
      // 1) Get all users (CUSTOMER + OWNER)
      const userRes = await adminStatsService.getAllUsers();

      if (userRes.success) {
        const users = userRes.data;

        setCustomerCount(users.filter((u) => u.role === "CUSTOMER").length);
        setOwnerCount(users.filter((u) => u.role === "OWNER").length);
      }

      // 2) Get total cafes
      const cafeRes = await adminStatsService.getCafeCount();
      if (cafeRes.success) setCafeCount(cafeRes.totalCafes);

      // tổng số review
      const reviewRes = await adminStatsService.getReviewCount();
      if (reviewRes.success) setReviewCount(reviewRes.totalReviews);


      const statsRes = await adminStatsService.getUserStatsByMonth();

      if (statsRes.success) {
        // Convert API format → chart format
        const grouped = {};

        statsRes.data.forEach((item) => {
          const month = item.month.substring(0, 7);  // YYYY-MM
          if (!grouped[month]) grouped[month] = { month, CUSTOMER: 0, OWNER: 0 };

          if (item.role === "CUSTOMER") {
            grouped[month].CUSTOMER = parseInt(item.count);
          } else if (item.role === "OWNER") {
            grouped[month].OWNER = parseInt(item.count);
          }
        });

        setMonthlyData(Object.values(grouped));
      }


    } catch (error) {
      message.error("ダッシュボードデータの取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="総ユーザー数（一般）"
              value={customerCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="店舗オーナー数"
              value={ownerCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="カフェ店舗数"
              value={cafeCount}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="レビュー数（仮）"
              value={reviewCount}   // bạn có thể thêm API sau
              prefix={<StarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>


      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="ユーザー登録数（月別）" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="CUSTOMER" fill="#3f8600" name="一般ユーザー" />
                <Bar dataKey="OWNER" fill="#1890ff" name="店舗オーナー" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="システム情報" className="h-full">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">サーバーステータス:</span>
                <span className="text-green-600 font-semibold">正常稼働中</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">データベース:</span>
                <span className="text-green-600 font-semibold">接続OK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API バージョン:</span>
                <span className="font-semibold">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最終バックアップ:</span>
                <span className="font-semibold">2025/12/05 00:00</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>




      {/* Activity + System Info (giữ nguyên) */}
    </div>
  );
}
