import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-10 border border-gray-100">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center">ログイン</h2>
        <p className="text-center text-gray-500 mt-2 text-sm">
          カフェオーナーポータルにログイン
        </p>

        <hr className="my-6" />

        {/* Email */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="example@cafe.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Password */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition font-medium"
        >
          ログイン
        </button>

        <hr className="my-8" />

        {/* Links */}
        <div className="text-center text-sm space-y-2">
          <a href="#" className="text-indigo-500 hover:underline">
            パスワードを忘れた方はこちら
          </a>
          <br />
          <a href="/register" className="text-indigo-500 hover:underline">
            アカウントをお持ちでない方はこちら
          </a>
        </div>
      </div>
    </div>
  );
}
