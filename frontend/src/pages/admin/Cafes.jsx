import { Card, Table, Tag, Button } from "antd";
import { UserAddOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

export default function AdminOwners() {
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
      title: '会社名',
      dataIndex: 'businessName',
      key: 'businessName',
    },
    {
      title: '承認ステータス',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => {
        const config = {
          'APPROVED': { color: 'green', text: '承認済み' },
          'PENDING': { color: 'orange', text: '承認待ち' },
          'REJECTED': { color: 'red', text: '却下' },
        };
        return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          {record.approvalStatus === 'PENDING' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />}>承認</Button>
              <Button size="small" danger icon={<CloseOutlined />}>却下</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      name: 'Nguyen Van Chu Quan A',
      email: 'owner1@cafe.com',
      businessName: 'Công ty TNHH Coffee A',
      approvalStatus: 'APPROVED',
    },
    {
      id: 2,
      name: 'Tran Thi Chu Quan B',
      email: 'owner2@cafe.com',
      businessName: 'Hộ kinh doanh B',
      approvalStatus: 'PENDING',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">店舗オーナー管理</h1>
        <Button type="primary" icon={<UserAddOutlined />} className="bg-blue-600">
          新規オーナー追加
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
