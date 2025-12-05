import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Image,
  message,
  Spin,
  Modal,
  Form,
  Input,
  TimePicker,
  InputNumber,
  Switch,
  Rate,
  Avatar,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import * as adminCafeService from "../../services/adminCafeService";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function AdminCafeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  // Fetch cafe detail
  const fetchCafeDetail = async () => {
    setLoading(true);
    try {
      const response = await adminCafeService.getCafeDetail(id);
      if (response.success) {
        setCafe(response.data);
        // Set form values
        form.setFieldsValue({
          ...response.data,
          open_time: response.data.open_time ? dayjs(response.data.open_time, "HH:mm:ss") : null,
          close_time: response.data.close_time ? dayjs(response.data.close_time, "HH:mm:ss") : null,
        });
      }
    } catch (error) {
      message.error(error.message || "Failed to fetch cafe details");
      console.error("Error fetching cafe detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Reset form to original values
      form.setFieldsValue({
        ...cafe,
        open_time: cafe.open_time ? dayjs(cafe.open_time, "HH:mm:ss") : null,
        close_time: cafe.close_time ? dayjs(cafe.close_time, "HH:mm:ss") : null,
      });
    }
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Format time fields
      const updateData = {
        ...values,
        open_time: values.open_time ? values.open_time.format("HH:mm:ss") : null,
        close_time: values.close_time ? values.close_time.format("HH:mm:ss") : null,
      };

      const response = await adminCafeService.updateCafe(id, updateData);
      
      if (response.success) {
        message.success("カフェ情報が正常に更新されました");
        setEditMode(false);
        fetchCafeDetail();
      }
    } catch (error) {
      message.error(error.message || "Failed to update cafe");
      console.error("Error updating cafe:", error);
    }
  };

  if (loading || !cafe) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const config = {
      ACTIVE: { color: "green", text: "営業中" },
      PENDING: { color: "orange", text: "承認待ち" },
      REJECTED: { color: "red", text: "却下" },
      CLOSED: { color: "gray", text: "休業中" },
    };
    return config[status] || { color: "default", text: status };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/cafes")}
          >
             戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold">カフェ詳細画面</h1>
            <p className="text-gray-600">カフェの基本情報が表示されます</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                保存
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleEditToggle}>
                キャンセル
              </Button>
            </>
          ) : (
            <Button icon={<EditOutlined />} type="primary" onClick={handleEditToggle}>
              編集
            </Button>
          )}
        </div>
      </div>

      <Form form={form} layout="vertical">
        {/* Basic Information */}
        <Card title="基本情報エリア" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photos */}
            <div className="col-span-2">
              <label className="block mb-2 font-medium">店舗画像</label>
              <div className="flex gap-2 overflow-x-auto">
                {cafe.photos && cafe.photos.length > 0 ? (
                  cafe.photos.map((photo) => (
                    <Image
                      key={photo.id}
                      width={200}
                      height={150}
                      src={photo.url}
                      alt="Cafe photo"
                      className="object-cover rounded"
                    />
                  ))
                ) : (
                  <div className="w-48 h-36 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500">画像なし</span>
                  </div>
                )}
              </div>
            </div>

            {/* Store Name */}
            <Form.Item
              label="店舗名"
              name="name"
              rules={[{ required: true, message: "店舗名を入力してください" }]}
            >
              <Input disabled={!editMode} size="large" />
            </Form.Item>

            {/* Owner */}
            <div>
              <label className="block mb-2 font-medium">オーナー名</label>
              <Input
                value={cafe.owner?.full_name}
                disabled
                size="large"
              />
            </div>

            {/* Address */}
            <Form.Item
              label="住所"
              name="address_line"
              rules={[{ required: true, message: "住所を入力してください" }]}
              className="col-span-2"
            >
              <Input disabled={!editMode} size="large" />
            </Form.Item>

            {/* District & City */}
            <Form.Item label="区" name="district">
              <Input disabled={!editMode} />
            </Form.Item>

            <Form.Item label="市" name="city">
              <Input disabled={!editMode} />
            </Form.Item>

            {/* Status */}
            <Form.Item label="ステータス" name="status">
              <Input
                disabled={!editMode}
                prefix={<Tag color={getStatusConfig(cafe.status).color}>{getStatusConfig(cafe.status).text}</Tag>}
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item label="電話番号" name="phone_contact">
              <Input disabled={!editMode} />
            </Form.Item>

            {/* Website */}
            <Form.Item label="ウェブサイト" name="website_url" className="col-span-2">
              <Input disabled={!editMode} />
            </Form.Item>

            {/* Opening Hours */}
            <Form.Item label="営業時間" name="open_time">
              <TimePicker
                disabled={!editMode}
                format="HH:mm"
                className="w-full"
              />
            </Form.Item>

            <Form.Item label="閉店時間" name="close_time">
              <TimePicker
                disabled={!editMode}
                format="HH:mm"
                className="w-full"
              />
            </Form.Item>

            {/* Price Range */}
            <Form.Item label="最低価格" name="avg_price_min">
              <InputNumber
                disabled={!editMode}
                className="w-full"
                min={0}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>

            <Form.Item label="最高価格" name="avg_price_max">
              <InputNumber
                disabled={!editMode}
                className="w-full"
                min={0}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>

            {/* Description */}
            <Form.Item label="説明" name="description" className="col-span-2">
              <TextArea
                disabled={!editMode}
                rows={4}
                placeholder="カフェの特徴やサービスに関する詳細な説明文"
              />
            </Form.Item>

            {/* Amenities */}
            <div className="col-span-2">
              <h3 className="font-medium mb-2">設備・サービス</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Form.Item label="WiFi" name="has_wifi" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
                <Form.Item label="エアコン" name="has_ac" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
                <Form.Item label="静か" name="is_quiet" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
                <Form.Item label="駐車場" name="has_parking" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
                <Form.Item label="喫煙可" name="allow_smoking" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
                <Form.Item label="ペット可" name="allow_pets" valuePropName="checked">
                  <Switch disabled={!editMode} />
                </Form.Item>
              </div>
            </div>
          </div>
        </Card>

        {/* Reviews Section */}
        <Card title="概要レビューエリア" className="mb-4">
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{cafe.avgRating || "0.0"}</span>
              <Rate disabled allowHalf value={parseFloat(cafe.avgRating || 0)} />
              <span className="text-gray-600">({cafe.totalReviews || 0} レビュー)</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">レビューリスト</h3>
            <List
              dataSource={cafe.reviews || []}
              locale={{ emptyText: "レビューがありません" }}
              renderItem={(review) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={review.author?.avatar_url} />}
                    title={
                      <div className="flex items-center gap-2">
                        <span>{review.author?.full_name}</span>
                        <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                        <span className="text-gray-500 text-sm">
                          {dayjs(review.created_at).format("YYYY/MM/DD")}
                        </span>
                      </div>
                    }
                    description={review.comment}
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>
      </Form>
    </div>
  );
}
