import { useState } from "react";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react";
import { Modal } from "antd";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER", // 👈 Default value
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      const { data } = await api.get("/terms/current");
      if (data.success) {
        setTermsContent(data.data.content);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("利用規約の取得に失敗しました。");
    } finally {
      setTermsLoading(false);
    }
  };

  const handleOpenTerms = () => {
    setTermsModalVisible(true);
    if (!termsContent) {
      fetchTerms();
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Nếu scroll gần đến cuối (còn 10px) thì coi như đã đọc hết
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasReadTerms(true);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!agreed) {
        toast.error("利用規約に同意してください。");
        return;
      }
      const res = await api.post("/auth/signup", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role, // 👈 Gửi role
      });

      if (res.status === 201) {
        toast.success("登録成功！ログインページに移動します。");
        setForm({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "登録に失敗しました。もう一度お試しください。";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f5] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="flex items-center justify-center gap-2 mb-2"
          onClick={() => navigate("/")}
        >
          <span className="text-3xl">
            <Coffee className="w-10 h-10 text-primary text-[#8b1a1a]" />
          </span>
          <span className="text-3xl font-bold text-[#8b1a1a]">Cafe Finder</span>
        </div>
        <p className="text-gray-600 text-sm">新しいアカウントを作成</p>
      </div>

      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-[#f3e0dc]"
      >
        {/* Role Dropdown */}
        <label className="block text-sm text-gray-700 mb-1">
          アカウント種類
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-red-300 focus:outline-none"
        >
          <option value="CUSTOMER">お客様</option>
          <option value="OWNER">店舗オーナー</option>
        </select>

        {/* Name */}
        <label className="block text-sm text-gray-700 mb-1">氏名</label>
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="山田 太郎"
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
          required
        />

        {/* Email */}
        <label className="block text-sm text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
          required
        />

        {/* Phone */}
        <label className="block text-sm text-gray-700 mb-1">電話番号</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="090-1234-5678"
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
          required
        />

        {/* Password */}
        <label className="block text-sm text-gray-700 mb-1">パスワード</label>
        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
            required
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        {/* Confirm Password */}
        <label className="block text-sm text-gray-700 mb-1">
          パスワード確認
        </label>
        <div className="relative mb-6">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
            required
          />
          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "👁️" : "🙈"}
          </span>
        </div>

        {/* Agree to Terms */}
        <div className="flex items-start gap-2 mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={!hasReadTerms}
            className="mt-1 w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <p className="text-sm text-gray-700">
            私は{" "}
            <span
              onClick={handleOpenTerms}
              className="text-[#a8201a] underline cursor-pointer hover:text-[#901a15]"
            >
              利用規約
            </span>{" "}
            に同意します。
            {!hasReadTerms && (
              <span className="text-xs text-gray-500 block mt-1">
                （利用規約をお読みください）
              </span>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a8201a] hover:bg-[#901a15] text-white py-3 rounded-lg font-medium shadow-sm transition disabled:bg-red-300"
        >
          {loading ? "登録中..." : "登録"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-8">
          すでにアカウントをお持ちの方は{" "}
          <a href="/signin" className="text-[#a8201a] hover:underline">
            ログイン
          </a>
        </p>
      </form>

      {/* Terms Modal */}
      <Modal
        title="利用規約"
        open={termsModalVisible}
        onCancel={() => setTermsModalVisible(false)}
        footer={[
          <button
            key="close"
            onClick={() => setTermsModalVisible(false)}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          >
            閉じる
          </button>,
          <button
            key="agree"
            disabled={!hasReadTerms}
            onClick={() => {
              setAgreed(true);
              setTermsModalVisible(false);
              toast.success("利用規約に同意しました。");
            }}
            className="px-6 py-2 bg-[#a8201a] hover:bg-[#901a15] text-white rounded-lg transition ml-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            同意する
          </button>,
        ]}
        width={700}
        styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      >
        {termsLoading ? (
          <div className="text-center py-10">
            <span className="text-gray-500">読み込み中...</span>
          </div>
        ) : (
          <div
            className="whitespace-pre-wrap text-gray-700 leading-relaxed"
            onScroll={handleScroll}
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {termsContent || "利用規約が見つかりません。"}
            {!hasReadTerms && termsContent && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ↓ 一番下までスクロールしてください
              </div>
            )}
          </div>
        )}
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
