import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, ShopOutlined, FileTextOutlined, StarOutlined } from "@ant-design/icons";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ダッシュボード</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="総ユーザー数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="カフェ店舗数"
              value={93}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="レビュー数"
              value={452}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="利用規約バージョン"
              value="1.0"
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="最近のアクティビティ" className="h-full">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-gray-500">2025/12/05 10:30</span>
                <span>新しいカフェが登録されました</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-500">2025/12/05 09:15</span>
                <span>ユーザーがレビューを投稿しました</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-500">2025/12/04 16:45</span>
                <span>店舗オーナーが承認されました</span>
              </li>
            </ul>
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
    </div>
  );
}
