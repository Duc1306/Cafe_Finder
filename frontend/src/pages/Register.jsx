import { useState } from "react";
import axios from "axios";

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

      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 201) {
        alert("登録成功！ログインページに移動します。");

        // Reset form
        setForm({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

        window.location.href = "/signin";
      }
    } catch (error) {
      console.error("Registration failed:", error);
      const msg =
        error?.response?.data?.message ||
        "登録に失敗しました。もう一度お試しください。";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-gray-100"
      >
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center">登録</h2>
        <p className="text-center text-gray-500 mt-2 text-sm">
          新しいアカウントを作成
        </p>

        <hr className="my-6" />

        {/* Name */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          氏名
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="山田 太郎"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Email */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@cafe.com"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          type="email"
          required
        />

        {/* Phone */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          電話番号
        </label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="090-1234-5678"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Password */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Confirm password */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード確認
        </label>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          required
        />

        {/* Register button */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition font-medium disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "登録中..." : "登録"}
        </button>

        <hr className="my-8" />

        {/* Link to login */}
        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方はこちら{" "}
          <a href="/signin" className="text-indigo-500 hover:underline">
            ログイン
          </a>
        </p>
      </form>
    </div>
  );
}
