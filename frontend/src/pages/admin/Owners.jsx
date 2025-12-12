import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Input, Select, Space, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import adminUserService from "../../services/adminUserService";

const { Search } = Input;
const { Option } = Select;

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
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

  // ===========================
  // 📌 Load owners from backend
  // ===========================
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAllAccounts();

      if (res.success) {
        const ownersOnly = res.data.filter((u) => u.role === "OWNER");
        setOwners(ownersOnly);
        setFiltered(ownersOnly);
        setPagination((prev) => ({ ...prev, total: ownersOnly.length }));
      }
    } catch {
      message.error("オーナー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // ===========================
  // 🔍 Filtering
  // ===========================
  const applyFilters = () => {
    let result = [...owners];
    const keyword = filters.keyword.toLowerCase();

    if (keyword) {
      result = result.filter(
        (o) =>
          o.full_name?.toLowerCase().includes(keyword) ||
          o.email?.toLowerCase().includes(keyword)
      );
    }

    if (filters.status) {
      result = result.filter((o) => o.status === filters.status);
    }

    setFiltered(result);
    setPagination((prev) => ({ ...prev, total: result.length }));
  };

  useEffect(() => {
    const t = setTimeout(applyFilters, 300);
    return () => clearTimeout(t);
  }, [filters, owners]);

  // ===========================
  // ✏️ Inline edit
  // ===========================
  const startEdit = (record) => {
    setEditingId(record.id);
    setEditForm({
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
    });
  };

  const saveEdit = async (record) => {
    try {
      const res = await adminUserService.updateAccount(record.id, editForm);

      if (res.success) {
        message.success("更新しました");
        setOwners((prev) =>
          prev.map((o) =>
            o.id === record.id ? { ...o, ...editForm } : o
          )
        );
        setEditingId(null);
      }
    } catch {
      message.error("更新に失敗しました");
    }
  };

  // ===========================
  // 🔐 Toggle status (ACTIVE / LOCKED)
  // ===========================
  const changeStatus = async (record, status) => {
    try {
      const res = await adminUserService.toggleStatus(record.id, status);

      if (res.success) {
        message.success("ステータス更新しました");
        setOwners((prev) =>
          prev.map((o) => (o.id === record.id ? { ...o, status } : o))
        );
      }
    } catch {
      message.error("ステータス更新に失敗しました");
    }
  };

  // ===========================
  // 🔓 Approve Owner (PENDING → ACTIVE)
  // ===========================
  const approveOwner = async (record) => {
    try {
      const res = await adminUserService.approveOwner(record.id);

      if (res.success) {
        message.success("承認しました！");
        changeStatus(record, "ACTIVE");
      }
    } catch {
      message.error("承認に失敗しました");
    }
  };

  // ===========================
  // 🗑 Delete owner
  // ===========================
  const deleteOwner = async (id) => {
    try {
      const res = await adminUserService.deleteAccount(id);

      if (res.success) {
        message.success("削除しました");
        setOwners((prev) => prev.filter((o) => o.id !== id));
      }
    } catch {
      message.error("削除に失敗しました");
    }
  };

  // ===========================
  // TABLE columns
  // ===========================
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },

    {
      title: "オーナー名",
      dataIndex: "full_name",
      render: (_, r) =>
        editingId === r.id ? (
          <Input
            value={editForm.full_name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, full_name: e.target.value }))
            }
          />
        ) : (
          r.full_name
        ),
    },

    {
      title: "メール",
      dataIndex: "email",
      render: (_, r) =>
        editingId === r.id ? (
          <Input
            value={editForm.email}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        ) : (
          r.email
        ),
    },

    {
      title: "電話番号",
      dataIndex: "phone",
      render: (_, r) =>
        editingId === r.id ? (
          <Input
            value={editForm.phone}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, phone: e.target.value }))
            }
          />
        ) : (
          r.phone
        ),
    },

    {
      title: "ステータス",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const map = {
          ACTIVE: { color: "green", text: "有効" },
          LOCKED: { color: "red", text: "ロック" },
          PENDING: { color: "orange", text: "承認待ち" },
        };
        return <Tag color={map[status].color}>{map[status].text}</Tag>;
      },
    },

    {
      title: "アクション",
      width: 280,
      render: (_, r) => (
        <Space>
          {/* EDIT MODE */}
          {editingId === r.id ? (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                size="small"
                onClick={() => saveEdit(r)}
              >
                保存
              </Button>

              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setEditingId(null)}
              >
                キャンセル
              </Button>
            </>
          ) : (
            <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(r)}>
              編集
            </Button>
          )}

          {/* STATUS LOGIC */}
          {r.status === "PENDING" && (
            <>
              <Button
                size="small"
                style={{ background: "#10b981", color: "white" }}
                onClick={() => approveOwner(r)}
              >
                承認
              </Button>
            </>
          )}

          {r.status === "ACTIVE" && (
            <Button
              size="small"
              style={{ background: "#f59e0b", color: "white" }}
              onClick={() => changeStatus(r, "LOCKED")}
            >
              ロック
            </Button>
          )}

          {r.status === "LOCKED" && (
            <Button
              size="small"
              style={{ background: "#10b981", color: "white" }}
              onClick={() => changeStatus(r, "ACTIVE")}
            >
              有効化
            </Button>
          )}

          {/* DELETE */}
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteOwner(r.id)}>
            削除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">店舗オーナー管理</h1>

      <Card>
        {/* SEARCH + FILTER */}
        <div className="flex justify-between mb-4">
          <Space>
            <Search
              placeholder="氏名またはメールで検索"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
            />

            <Select
              placeholder="ステータス"
              style={{ width: 180 }}
              value={filters.status}
              onChange={(v) =>
                setFilters((prev) => ({ ...prev, status: v }))
              }
            >
              <Option value="">全て</Option>
              <Option value="ACTIVE">有効</Option>
              <Option value="LOCKED">ロック</Option>
              <Option value="PENDING">承認待ち</Option>
            </Select>
          </Space>
        </div>

        {/* TABLE */}
        <Table
          columns={columns}
          rowKey="id"
          dataSource={filtered.slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / 全 ${total} 件表示`,
            onChange: (page) =>
              setPagination((prev) => ({ ...prev, current: page })),
          }}
        />
      </Card>
    </div>
  );
}