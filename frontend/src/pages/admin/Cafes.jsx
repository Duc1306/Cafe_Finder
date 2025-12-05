import { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Select, message, Space, Modal, Popconfirm } from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as adminCafeService from "../../services/adminCafeService";

const { Search } = Input;
const { Option } = Select;

export default function AdminCafes() {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });

  // Fetch cafes data
  const fetchCafes = async (page = 1, searchKeyword = null) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        keyword: searchKeyword !== null ? searchKeyword : filters.keyword,
      };
      
      // Only add status if not empty (empty means "All")
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await adminCafeService.getAllCafes(params);
      
      if (response.success) {
        setCafes(response.data);
        setPagination({
          ...pagination,
          current: response.pagination.currentPage,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      message.error(error.message || "Failed to fetch cafes");
      console.error("Error fetching cafes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  // Handle status filter change
  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle search submit
  const handleSearchSubmit = (value) => {
    setFilters((prev) => ({ ...prev, keyword: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchCafes(1, value);
  };

  // Handle search change (when user types or clears)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setFilters((prev) => ({ ...prev, keyword: '' }));
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchCafes(1, '');
    }
  };

  // Handle table change (pagination)
  const handleTableChange = (newPagination) => {
    fetchCafes(newPagination.current);
  };

  // Navigate to cafe detail page
  const handleViewDetail = (cafeId) => {
    navigate(`/admin/cafes/${cafeId}`);
  };

  // Navigate to pending requests page
  const handleViewRequests = () => {
    navigate("/admin/cafes/requests");
  };

  // Handle delete cafe
  const handleDeleteCafe = async (cafeId, cafeName) => {
    try {
      // Gọi API xóa cafe (soft delete - chuyển status thành CLOSED)
      const response = await adminCafeService.deleteCafe(cafeId);
      
      if (response.success) {
        message.success(`カフェ「${cafeName}」を削除しました`);
        fetchCafes(pagination.current);
      }
    } catch (error) {
      message.error(error.message || "Failed to delete cafe");
      console.error("Error deleting cafe:", error);
    }
  };

  // Table columns
  const columns = [
    {
      title: "店舗ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
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
      title: "ステータス",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = {
          ACTIVE: { color: "green", text: "営業中" },
          PENDING: { color: "orange", text: "承認待ち" },
          REJECTED: { color: "red", text: "却下" },
          CLOSED: { color: "gray", text: "休業中" },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
      },
    },
    {
      title: "アクション",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            
          </Button>
          <Popconfirm
            title="カフェ削除"
            description={`「${record.name}」を削除してもよろしいですか？`}
            onConfirm={() => handleDeleteCafe(record.id, record.name)}
            okText="削除"
            cancelText="キャンセル"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >

            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">カフェ管理</h1>
        <p className="text-gray-600">システムに登録されている全カフェの合計件数: {pagination.total} 件</p>
      </div>

      <Card>
        {/* Search and Filter Section */}
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <Space className="flex-wrap">
            <Search
              placeholder="店舗名またはIDで検索"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearchSubmit}
              onChange={handleSearchChange}
              enterButton={<SearchOutlined />}
            />
            
            <Select
              placeholder="ステータス"
              style={{ width: 150 }}
              value={filters.status}
              onChange={handleStatusChange}
            >
              <Option value="">全て</Option>
              <Option value="ACTIVE">営業中</Option>
              <Option value="PENDING">承認待ち</Option>
              <Option value="REJECTED">却下</Option>
              <Option value="CLOSED">休業中</Option>
            </Select>
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleViewRequests}
            size="large"
          >
            カフェ承認
          </Button>
        </div>

        {/* Cafe List Table */}
        <Table
          columns={columns}
          dataSource={cafes}
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
    </div>
  );
}
