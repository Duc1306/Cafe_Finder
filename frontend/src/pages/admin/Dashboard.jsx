import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, message } from "antd";
import { UserOutlined, ShopOutlined, FileTextOutlined, StarOutlined } from "@ant-design/icons";

import adminStatsService from "../../services/adminStatsService";

export default function AdminDashboard() {
  const [customerCount, setCustomerCount] = useState(0);
  const [ownerCount, setOwnerCount] = useState(0);
  const [cafeCount, setCafeCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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

      {/* Activity + System Info (giữ nguyên) */}
    </div>
  );
}
