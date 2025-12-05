import { Card, Table, Tag, Button } from "antd";
import { UserAddOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function AdminCustomers() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名前',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'メール',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '電話番号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'アクティブ' : '無効'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />}>編集</Button>
          <Button size="small" danger icon={<DeleteOutlined />}>削除</Button>
        </div>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      name: 'Le Van Khach',
      email: 'user1@cafe.com',
      phone: '0903333333',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Pham Thi Mua',
      email: 'user2@cafe.com',
      phone: '0904444444',
      status: 'ACTIVE',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">顧客管理</h1>
        <Button type="primary" icon={<UserAddOutlined />} className="bg-blue-600">
          新規顧客追加
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
