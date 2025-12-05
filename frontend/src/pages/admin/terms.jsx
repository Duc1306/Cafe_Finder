import { useState, useEffect } from "react";
import { Card, Button, Input, message, Modal, Tag, Spin, Table } from "antd";
import { FaEdit, FaSave, FaTimes, FaHistory, FaClipboardList, FaBell, FaLightbulb } from "react-icons/fa";
import api from "../../services/api";

const { TextArea } = Input;

export default function AdminTermsPage() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTerms, setCurrentTerms] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load current terms on mount
  useEffect(() => {
    fetchCurrentTerms();
  }, []);

  const fetchCurrentTerms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/terms");
      if (data.success) {
        setCurrentTerms(data.data);
        setEditContent(data.data.content);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      message.error(error.response?.data?.error || "利用規約の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get("/admin/terms/history");
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      message.error("履歴の取得に失敗しました。");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(currentTerms.content);
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      message.error("利用規約の内容を入力してください。");
      return;
    }

    if (editContent.length > 50000) {
      message.error("利用規約の内容が長すぎます。（最大50,000文字）");
      return;
    }

    Modal.confirm({
      title: "利用規約を更新しますか？",
      content: (
        <div>
          <p>新しいバージョンが作成されます。</p>
          <p className="text-sm text-gray-500">
            現在のバージョン: {currentTerms?.version}
          </p>
        </div>
      ),
      okText: "更新",
      cancelText: "キャンセル",
      onOk: async () => {
        setLoading(true);
        try {
          const { data } = await api.put("/admin/terms", { content: editContent });
          if (data.success) {
            message.success(
              `利用規約が更新されました。新バージョン: ${data.data.version}`
            );
            setCurrentTerms(data.data);
            setEditContent(data.data.content);
            setIsEditing(false);
          }
        } catch (error) {
          console.error("Error updating terms:", error);
          message.error(error.response?.data?.error || "利用規約の更新に失敗しました。");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const showHistory = () => {
    setHistoryVisible(true);
    fetchHistory();
  };

  const historyColumns = [
    {
      title: "バージョン",
      dataIndex: "version",
      key: "version",
      render: (version, record) => (
        <div>
          <span className="font-semibold">{version}</span>
          {record.is_active && (
            <Tag color="green" className="ml-2">
              現在
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "作成日時",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString("ja-JP"),
    },
    {
      title: "ステータス",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "公開中" : "履歴"}
        </Tag>
      ),
    },
    {
      title: "文字数",
      dataIndex: "content",
      key: "content",
      render: (content) => `${content.length.toLocaleString()} 文字`,
    },
  ];

  if (loading && !currentTerms) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="読み込み中..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          利用規約管理
        </h1>
        <p className="text-gray-600">
          システムの利用規約を管理・編集します。
        </p>
      </div>

      {/* Version Info Card */}
      <Card className="mb-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">現在のバージョン</div>
            <div className="text-2xl font-bold text-orange-600">
              バージョン {currentTerms?.version || "---"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              最終更新:{" "}
              {currentTerms?.updated_at
                ? new Date(currentTerms.updated_at).toLocaleString("ja-JP")
                : "---"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<FaHistory />}
              onClick={showHistory}
            >
                  履歴を表示
                </Button>
                {!isEditing ? (
                  <Button
                    type="primary"
                    icon={<FaEdit />}
                    onClick={handleEdit}
                    className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                  >
                    編集
                  </Button>
                ) : (
                  <>
                    <Button
                      icon={<FaTimes />}
                      onClick={handleCancel}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="primary"
                      icon={<FaSave />}
                      onClick={handleSave}
                      loading={loading}
                      className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                      保存
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Terms Content Card */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>利用規約内容</span>
                {isEditing && (
                  <Tag color="blue">編集モード</Tag>
                )}
              </div>
            }
          >
            {isEditing ? (
              <div>
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="利用規約の内容を入力してください..."
                  rows={20}
                  className="font-mono text-sm"
                  maxLength={50000}
                  showCount
                />
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <FaLightbulb className="text-blue-600" /> 編集時の注意事項
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 内容を保存すると新しいバージョンが自動的に作成されます</li>
                    <li>• 旧バージョンは履歴として保存されます</li>
                    <li>• ユーザーは次回ログイン時に新しい利用規約が表示されます</li>
                    <li>• 最大50,000文字まで入力可能です</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div
                className="prose max-w-none p-4 bg-gray-50 rounded border"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {currentTerms?.content || "利用規約がありません。"}
              </div>
            )}
          </Card>

        {/* Connection Info */}
        <Card className="mt-6 bg-orange-50 border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <FaClipboardList className="text-orange-600" /> 連絡情報
          </h3>
          <p className="text-sm text-orange-700">
            利用規約に関する問い合わせは、規約の最下部に記載されているメールアドレスまたは連絡方法にお問い合わせください。
          </p>
        </Card>

        {/* Update Notification Info */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <FaBell className="text-blue-600" /> 規約変更通知
          </h3>
          <p className="text-sm text-blue-700">
            利用規約が変更された際は、ユーザーへの通知方法（例：登録メールアドレスへの通知）に関する説明が表示されます。
            新しいバージョンは次回ログイン時にポップアップで表示されます。
          </p>
        </Card>

      {/* History Modal */}
      <Modal
        title="利用規約バージョン履歴"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryVisible(false)}>
            閉じる
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="id"
          loading={historyLoading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
}
