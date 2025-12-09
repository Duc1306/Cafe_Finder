import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  message,
  Modal,
  Space,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as adminCafeService from "../../services/adminCafeService";
import dayjs from "dayjs";

const { Search } = Input;
const { TextArea } = Input;

export default function CafeApprovalRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [keyword, setKeyword] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch pending requests
  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        keyword,
      };

      const response = await adminCafeService.getPendingRequests(params);

      if (response.success) {
        setRequests(response.data);
        setPagination({
          ...pagination,
          current: response.pagination.currentPage,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      message.error(error.message || "Failed to fetch requests");
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setKeyword(value);
    fetchRequests(1);
  };

  // Handle table change (pagination)
  const handleTableChange = (newPagination) => {
    fetchRequests(newPagination.current);
  };

  // View request detail
  const handleViewDetail = async (requestId) => {
    try {
      const response = await adminCafeService.getRequestDetail(requestId);
      if (response.success) {
        setSelectedRequest(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error(error.message || "Failed to fetch request detail");
    }
  };

  // Approve request
  const handleApprove = async (requestId) => {
    Modal.confirm({
      title: "承認確認",
      content: "このカフェ登録リクエストを承認しますか？",
      okText: "承認",
      cancelText: "キャンセル",
      onOk: async () => {
        try {
          const response = await adminCafeService.approveRequest(requestId);
          if (response.success) {
            message.success("カフェ登録リクエストが承認されました");
            fetchRequests(pagination.current);
            setDetailModalVisible(false);
          }
        } catch (error) {
          message.error(error.message || "Failed to approve request");
        }
      },
    });
  };

  // Show reject modal
  const handleShowRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // Reject request
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("却下理由を入力してください");
      return;
    }

    try {
      const response = await adminCafeService.rejectRequest(
        selectedRequest.id,
        rejectReason
      );
      if (response.success) {
        message.success("カフェ登録リクエストが却下されました");
        setRejectModalVisible(false);
        setDetailModalVisible(false);
        fetchRequests(pagination.current);
      }
    } catch (error) {
      message.error(error.message || "Failed to reject request");
    }
  };

  // Table columns
  const columns = [
    {
      title: "店舗名",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "オーナー名",
      dataIndex: ["owner", "full_name"],
      key: "owner_name",
      width: 150,
    },
    {
      title: "住所",
      key: "address",
      width: 250,
      render: (_, record) => (
        <span>
          {record.address_line}, {record.district}, {record.city}
        </span>
      ),
    },
    {
      title: "送信日",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date) => dayjs(date).format("YYYY/MM/DD"),
    },
    {
      title: "アクション",
      key: "action",
      width: 250,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            詳細を見る
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            承認
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => handleShowRejectModal(record)}
          >
            却下
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/cafes")}
          >
             戻る
          </Button>
          <h1 className="text-2xl font-bold">新規カフェ登録</h1>
        </div>
        <p className="text-gray-600">
          承認待ちカフェ登録リクエスト一覧 (合計: {pagination.total} 件)
        </p>
      </div>

      <Card>
        {/* Search Section */}
        <div className="mb-4">
          <Search
            placeholder="店舗名で検索"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
        </div>

        {/* Requests Table */}
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 全 ${total} 件表示`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="リクエスト詳細"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            閉じる
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleShowRejectModal(selectedRequest);
            }}
          >
            却下
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(selectedRequest?.id)}
          >
            承認
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Photos */}
            {selectedRequest.photos && selectedRequest.photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">店舗画像</h4>
                <div className="flex gap-2 overflow-x-auto">
                  {selectedRequest.photos.map((photo) => (
                    <Image
                      key={photo.id}
                      width={150}
                      height={100}
                      src={photo.url}
                      alt="Cafe photo"
                      className="object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h4 className="font-medium">店舗名</h4>
              <p>{selectedRequest.name}</p>
            </div>

            <div>
              <h4 className="font-medium">オーナー名</h4>
              <p>{selectedRequest.owner?.full_name}</p>
            </div>

            <div>
              <h4 className="font-medium">会社名</h4>
              <p>{selectedRequest.owner?.ownerProfile?.business_name || "N/A"}</p>
            </div>

            <div>
              <h4 className="font-medium">住所</h4>
              <p>
                {selectedRequest.address_line}, {selectedRequest.district},{" "}
                {selectedRequest.city}
              </p>
            </div>

            <div>
              <h4 className="font-medium">電話番号</h4>
              <p>{selectedRequest.phone_contact || "N/A"}</p>
            </div>

            <div>
              <h4 className="font-medium">営業時間</h4>
              <p>
                {selectedRequest.open_time || "N/A"} -{" "}
                {selectedRequest.close_time || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="font-medium">説明</h4>
              <p className="whitespace-pre-wrap">
                {selectedRequest.description || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="font-medium">送信日</h4>
              <p>{dayjs(selectedRequest.created_at).format("YYYY/MM/DD HH:mm")}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="リクエスト却下"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleReject}
        okText="却下"
        cancelText="キャンセル"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4">
          <p>このカフェ登録リクエストを却下する理由を入力してください：</p>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="却下理由を入力..."
          />
        </div>
      </Modal>
    </div>
  );
}
