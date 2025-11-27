import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    console.log(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-gray-100">

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
        />

        {/* Register button */}
        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition font-medium"
        >
          登録
        </button>

        <hr className="my-8" />

        {/* Link to login */}
        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方はこちら{" "}
          <a href="/signin" className="text-indigo-500 hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
