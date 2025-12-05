import { Card, Button, Input, Spin } from "antd";
import {
  HeartOutlined,
  CommentOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useUserDashboard } from "../../contexts/UserDashboard/useUserDashboard.js";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const { dashboard, loading } = useUserDashboard();
  const navigate = useNavigate();

  const statsConfig = [
    {
      label: "あなたのお気に入り",
      value: dashboard?.favoriteCount || 0,
      icon: <HeartOutlined className="text-3xl text-gray-400" />,
    },
    {
      label: "レビュー数",
      value: dashboard?.reviewCount || 0,
      icon: <CommentOutlined className="text-3xl text-gray-400" />,
    },
    {
      label: "訪問済みカフェ数",
      value: dashboard?.visitedCount || 0,
      icon: <EnvironmentOutlined className="text-3xl text-gray-400" />,
    },
  ];

  const activityMap = {
    REVIEW: {
      icon: <CommentOutlined className="text-xl text-red-500 mr-2" />,
      label: "レビュー",
    },
    FAVORITE: {
      icon: <HeartOutlined className="text-xl text-pink-500 mr-2" />,
      label: "お気に入り追加",
    },
    VISIT: {
      icon: <EnvironmentOutlined className="text-xl text-blue-500 mr-2" />,
      label: "訪問",
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen px-8 py-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-2xl font-bold">Cafe Finder</div>
        <div>
          <Input
            prefix={<SearchOutlined />}
            placeholder="カフェを検索..."
            className="w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="flex gap-4 mb-6">
            {statsConfig.map((stat, idx) => (
              <Card
                key={idx}
                className="flex-1 rounded-xl"
                styles={{
                  body: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.5rem",
                  },
                }}
              >
                <div>
                  <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                  <div className="text-3xl font-bold text-red-700">
                    {stat.value}
                  </div>
                </div>
                {stat.icon}
              </Card>
            ))}
          </div>

          {/* カフェ検索 */}
          <div className="rounded-xl bg-gradient-to-r from-orange-100 to-gray-100 p-4 mb-8 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-700">
                近くのカフェを探す
              </div>
              <div className="text-sm text-gray-500">
                現在地情報をもとに周辺カフェを検索
              </div>
            </div>
            <Button
              type="primary"
              className="bg-red-700 border-none px-8 flex items-center"
              icon={<SearchOutlined />}
              onClick={() => navigate("/search")}
            >
              検索
            </Button>
          </div>

          {/* おすすめカフェ */}
          <div className="mb-8">
            <div className="font-bold text-lg mb-4">おすすめカフェ</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboard?.recommendedCafes?.length === 0 ||
              !dashboard?.recommendedCafes ? (
                <div className="col-span-3 text-gray-400">
                  おすすめカフェがありません。
                </div>
              ) : (
                dashboard.recommendedCafes.map((cafe, idx) => (
                  <Card
                    key={idx}
                    hoverable
                    cover={
                      <img
                        alt={cafe.name}
                        src={
                          cafe.coverPhoto ||
                          "https://placehold.co/600x400?text=Cafe"
                        }
                        className="h-48 w-full object-cover rounded-t-xl"
                      />
                    }
                    className="rounded-xl"
                    bodyStyle={{ padding: "1.5rem" }}
                  >
                    <div className="font-semibold text-base mb-2">
                      {cafe.name}
                    </div>
                    <div className="flex items-center text-sm mb-2">
                      <span className="text-gray-500">{cafe.address}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        type="primary"
                        icon={<InfoCircleOutlined />}
                        onClick={() => navigate(`/cafe/${cafe.id}`)}
                      >
                        詳細へ
                      </Button>
                      <Button
                        icon={<EnvironmentOutlined />}
                        onClick={() => navigate(`/cafe/${cafe.id}/map`)}
                      >
                        地図
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* 最近の活動 */}
          <div>
            <div className="font-bold text-lg mb-4">最近の活動</div>
            <div className="flex flex-col gap-2">
              {!dashboard?.recentActivities ||
              dashboard.recentActivities.length === 0 ? (
                <div className="text-gray-400">最近の活動はありません。</div>
              ) : (
                dashboard.recentActivities.map((act, idx) => {
                  const map = activityMap[act.type] || {};
                  return (
                    <Card key={idx} className="rounded-lg flex items-center">
                      <div className="flex items-center">
                        {map.icon}
                        <span className="font-semibold mr-2">{map.label}</span>
                        {act.type === "REVIEW" && act.rating && (
                          <span className="ml-2">★ {act.rating}</span>
                        )}
                        {act.type === "REVIEW" && act.comment && (
                          <span className="ml-2 text-gray-700">
                            {act.comment}
                          </span>
                        )}
                        <span className="ml-4 text-xs text-gray-400">
                          {act.date}
                        </span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* お知らせ */}
          <div className="mt-8">
            <div className="font-bold text-lg mb-4">お知らせ</div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center justify-between">
              <span>
                新しいカフェが追加されました。プロモーション更新、システムメンテナンスなど、最新の通知をここで確認できます。
              </span>
              <Button
                type="link"
                className="text-red-700"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/notifications")}
              >
                もっと見る
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}