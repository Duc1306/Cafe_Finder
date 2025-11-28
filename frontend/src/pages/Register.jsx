import { useState } from "react";
import api from "../services/api";
import { toast, ToastContainer } from 'react-toastify';

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/signup", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (res.status === 201) {
        toast.success("登録成功！ログインページに移動します。");
        setForm({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
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
      {/* Logo + Title giống hình mẫu */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">☕</span>
          <span className="text-3xl font-bold text-[#8b1a1a]">Cafe Finder</span>
        </div>
        <p className="text-gray-600 text-sm">新しいアカウントを作成</p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-[#f3e0dc]"
      >
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
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
          required
        />

        {/* Confirm Password */}
        <label className="block text-sm text-gray-700 mb-1">
          パスワード確認
        </label>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:outline-none"
          required
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#a8201a] hover:bg-[#901a15] text-white py-3 rounded-lg font-medium shadow-sm transition disabled:bg-red-300"
        >
          {loading ? "登録中..." : "登録"}
        </button>

        {/* Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          すでにアカウントをお持ちの方は{" "}
          <a href="/signin" className="text-[#a8201a] hover:underline">
            ログイン
          </a>
        </p>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
