import { useEffect, useState } from "react";
import {
  getMyReviews,
  updateMyReview,
  deleteMyReview,
} from "../../services/UserDashBoardService";
import { Input, Select, Modal, Button, message, Rate } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ rating: 5, comment: "" });
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sort, setSort] = useState("newest");

  // Fetch reviews
  useEffect(() => {
    let mounted = true;
    getMyReviews().then((res) => {
      if (mounted) setReviews(res.data || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter, search, sort
  const filtered = reviews
    .filter((r) => r.cafeName.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !filterRating || r.rating === Number(filterRating))
    .sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  // Edit
  const openEdit = (review) => {
    setEditing(review.id);
    setEditData({ rating: review.rating, comment: review.comment });
  };
  const handleEdit = async () => {
    try {
      await updateMyReview(editing, editData);
      setReviews(
        reviews.map((r) => (r.id === editing ? { ...r, ...editData } : r))
      );
      setEditing(null);
      message.success("レビューを更新しました。");
    } catch {
      message.error("更新に失敗しました。");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "レビューを削除しますか？",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      onOk: async () => {
        try {
          await deleteMyReview(id);
          setReviews(reviews.filter((r) => r.id !== id));
          message.success("削除しました。");
        } catch {
          message.error("削除に失敗しました。");
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button
          className="mr-2 flex items-center"
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
        />
        <h1 className="text-2xl font-bold">私のレビュー</h1>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="カフェ名で検索"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="w-40"
          value={filterRating}
          onChange={setFilterRating}
          allowClear
          placeholder="All ratings"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <Select.Option key={r} value={r}>
              {r} stars
            </Select.Option>
          ))}
        </Select>
        <Select className="w-40" value={sort} onChange={setSort}>
          <Select.Option value="newest">新しい順</Select.Option>
          <Select.Option value="oldest">古い順</Select.Option>
        </Select>
      </div>
      {filtered.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-lg">{r.cafeName}</div>
            <div>
              <Button
                type="text"
                icon={<EditOutlined />}
                className="mr-2"
                onClick={() => openEdit(r)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(r.id)}
              />
            </div>
          </div>
          <Rate disabled value={r.rating} className="mb-2" />
          <div>{r.comment}</div>
          <div className="text-xs text-gray-400">
              {r.createdAt && new Date(r.createdAt).toLocaleDateString("ja-JP")}
            </div>
        </div>
      ))}
      <Modal
        open={!!editing}
        title="レビュー編集"
        onCancel={() => setEditing(null)}
        onOk={handleEdit}
        okText="保存"
        cancelText="キャンセル"
      >
        <div className="mb-4">
          <span className="mr-2">評価:</span>
          <Rate
            value={editData.rating}
            onChange={(v) => setEditData((d) => ({ ...d, rating: v }))}
          />
        </div>
        <Input.TextArea
          rows={4}
          value={editData.comment}
          onChange={(e) =>
            setEditData((d) => ({ ...d, comment: e.target.value }))
          }
        />
      </Modal>
    </div>
  );
}
