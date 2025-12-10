import { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Input, Select, Space, message } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import adminUserService from "../../services/adminUserService";

const { Search } = Input;
const { Option } = Select;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ==============================
  // 📌 Fetch từ backend
  // ==============================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAllAccounts();

      if (res.success) {
        // Chỉ lấy ROLE = CUSTOMER
        const list = res.data.filter((u) => u.role === "CUSTOMER");

        setCustomers(list);
        setFilteredData(list);
        setPagination((prev) => ({ ...prev, total: list.length }));
      }
    } catch (error) {
      message.error("ユーザーの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==============================
  // 🔎 Search + Filter (frontend)
  // ==============================
  const applyFilters = () => {
    let result = [...customers];

    const keyword = filters.keyword.toLowerCase();

    if (keyword.trim() !== "") {
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          u.phone.includes(keyword)
      );
    }

    if (filters.status) {
      result = result.filter((u) => u.status === filters.status);
    }

    setFilteredData(result);
    setPagination((prev) => ({ ...prev, total: result.length }));
  };

  useEffect(() => {
    const t = setTimeout(applyFilters, 300);
    return () => clearTimeout(t);
  }, [filters, customers]);

  const handleTableChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page.current }));
  };

  // ==============================
  // ✏️ EDITING
  // ==============================
  const startEdit = (record) => {
    setEditingRowId(record.id);
    setEditForm({
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
    });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditForm({});
  };

  const saveEdit = async (record) => {
    try {
      const res = await adminUserService.updateAccount(record.id, editForm);

      if (res.success) {
        message.success("更新しました！");

        // Cập nhật local state
        const newData = customers.map((u) =>
          u.id === record.id ? { ...u, ...editForm } : u
        );

        setCustomers(newData);
        setFilteredData(newData);
        cancelEdit();
      }
    } catch (error) {
      message.error("更新に失敗しました");
    }
  };

  // ==============================
  // 🔐 CHANGE STATUS (ACTIVE ↔ LOCKED)
  // ==============================
  const toggleStatus = async (record) => {
    const newStatus = record.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

    try {
      const res = await adminUserService.toggleStatus(record.id, newStatus);

      if (res.success) {
        message.success("ステータス更新しました！");

        setCustomers((prev) =>
          prev.map((u) =>
            u.id === record.id ? { ...u, status: newStatus } : u
          )
        );
      }
    } catch (error) {
      message.error("ステータス更新に失敗しました");
    }
  };


  // ==============================
  // TABLE COLUMNS
  // ==============================
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },

    {
      title: "氏名",
      dataIndex: "full_name",
      render: (_, record) =>
        editingRowId === record.id ? (
          <Input
            value={editForm.full_name}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
            }
          />
        ) : (
          record.full_name
        ),
    },

    {
      title: "メール",
      dataIndex: "email",
      render: (_, record) =>
        editingRowId === record.id ? (
          <Input
            value={editForm.email}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        ) : (
          record.email
        ),
    },

    {
      title: "電話番号",
      dataIndex: "phone",
      render: (_, record) =>
        editingRowId === record.id ? (
          <Input
            value={editForm.phone}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        ) : (
          record.phone
        ),
    },

    {
      title: "ステータス",
      dataIndex: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "有効" : "ロック"}
        </Tag>
      ),
    },

    {
      title: "アクション",
      width: 200,
      render: (_, record) => (
        <Space>
          {editingRowId === record.id ? (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="small"
                onClick={() => saveEdit(record)}
              >
                保存
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={cancelEdit}
              >
                キャンセル
              </Button>
            </>
          ) : (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEdit(record)}
            >
              編集
            </Button>
          )}

          <Button
            size="small"
            style={{
              background: record.status === "ACTIVE" ? "#f59e0b" : "#10b981",
              color: "white",
              border: "none",
            }}
            onClick={() => toggleStatus(record)}
          >
            {record.status === "ACTIVE" ? "ロック" : "有効化"}
          </Button>

          <Button size="small" danger icon={<DeleteOutlined />}>
            削除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">顧客管理</h1>

      <Card>
        <div className="flex justify-between mb-4">
          <Space>
            <Search
              placeholder="氏名またはメールで検索"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 260 }}
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
            />

            <Select
              style={{ width: 150 }}
              value={filters.status}
              onChange={(v) =>
                setFilters((prev) => ({ ...prev, status: v }))
              }
              placeholder="ステータス"
            >
              <Option value="">全て</Option>
              <Option value="ACTIVE">有効</Option>
              <Option value="LOCKED">ロック</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData.slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
}
