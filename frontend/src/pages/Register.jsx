import { useState } from "react";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Coffee } from 'lucide-react'

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
        <div className="flex items-center justify-center gap-2 mb-2" onClick={() => navigate("/")}>
          <span className="text-3xl"><Coffee className="w-10 h-10 text-primary text-[#8b1a1a]" /></span>
          <span className="text-3xl font-bold text-[#8b1a1a]">Cafe Finder</span>
        </div>
        <p className="text-gray-600 text-sm">新しいアカウントを作成</p>
      </div>

      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-[#f3e0dc]"
      >
        {/* Role Dropdown */}
        <label className="block text-sm text-gray-700 mb-1">アカウント種類</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-red-300 focus:outline-none"
        >
          <option value="CUSTOMER">Customer（お客様）</option>
          <option value="OWNER">Owner（店舗オーナー）</option>
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
        <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
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
        <label className="block text-sm text-gray-700 mb-1">パスワード確認</label>
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
            className="mt-1 w-4 h-4"
          />

          <p className="text-sm text-gray-700">
            私は{" "}
            <span
              onClick={() => navigate("/terms")}
              className="text-[#a8201a] underline cursor-pointer"
            >
              利用規約
            </span>{" "}
            に同意します。
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

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
