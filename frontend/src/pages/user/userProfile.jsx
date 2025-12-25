import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
} from "../../services/UserDashBoardService";
import { Input, Button, message, Spin, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { uploadUserAvatar } from "../../services/UserDashBoardService";
export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      })
      .catch(() => message.error("プロフィール情報の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      message.error("表示名は必須です。");
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({ full_name: fullName, avatar_url: avatarUrl });
      message.success("プロフィールを更新しました。");
    } catch {
      message.error("プロフィールの更新に失敗しました。");
    }
    setSaving(false);
  };

  //  upload avatar (preview)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadUserAvatar(file);
        setAvatarUrl(url);
        message.success("アバターをアップロードしました。");
      } catch {
        message.error("アバターのアップロードに失敗しました。");
      }
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8 mt-8 relative">
      {/* Nút back ở góc trên bên trái */}
      <button
        className="absolute top-4 left-4 text-xl text-gray-600 hover:text-black"
        onClick={() => navigate(-1)}
        aria-label="back"
      >
        <ArrowLeftOutlined />
      </button>
      <div className="mb-6 flex justify-center">
        <span className="text-2xl font-bold">プロフィール</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative mb-4 flex flex-col items-center">
          <Avatar size={96} src={avatarUrl} />
          <Button
            icon={<UploadOutlined />}
            size="small"
            className="mt-2"
            loading={uploading}
            onClick={() => document.getElementById("avatarInput").click()}
          >
            アバターをアップロード
          </Button>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
        <div className="mb-2 text-gray-600">名前</div>
        <Input
          className="mb-4"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <div className="mb-2 text-gray-600">メール（読み取り専用）</div>
        <Input className="mb-4" value={profile.email} disabled />
        <Button
          type="primary"
          className="w-full bg-red-900 hover:bg-red-800"
          loading={saving}
          onClick={handleSave}
        >
          保存
        </Button>
        <Button
          className="mt-4"
          type="default"
          onClick={() => navigate("/user/reviews")}
        >
          私のレビューを見る
        </Button>
      </div>
    </div>
  );
}
