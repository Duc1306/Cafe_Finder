import { useState } from "react";
import api from "../services/api";
import { toast, ToastContainer } from 'react-toastify';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await api.post("/auth/signin", { email, password });

      if (res.status === 200) {
        toast.success("ログイン成功！");

        const token = res.data.token;
        const role = res.data.user?.role;

        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userRole", role);
        localStorage.setItem("userRole", role);

        setTimeout(() => {
          switch (role) {
            case "OWNER":
              window.location.href = "/owner/dashboard";
              break;
            case "ADMIN":
              window.location.href = "/admin/users";
              break;
            default:
              window.location.href = "/customer";
          }
        }, 1500);
      }

      setPassword("");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。";

      toast.error(msg);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fff7f5]">
      {/* Logo + Title giống màn hình Register */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">☕</span>
          <span className="text-3xl font-bold tracking-wide text-[#8b1a1a]">
            Cafe Finder
          </span>
        </div>
        <p className="text-sm text-gray-600">
          あなたのアカウントにログイン
        </p>
      </div>

      {/* Card Login */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-md border border-[#f3e0dc] px-10 py-10"
      >
        {/* Email */}
        <label className="block text-sm text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 mb-5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-[#d0574b]"
        />

        {/* Password */}
        <label className="block text-sm text-gray-700 mb-1">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 mb-7 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#d0574b] focus:border-[#d0574b]"
        />

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white bg-[#a8201a] hover:bg-[#901a15] transition shadow-sm disabled:bg-[#e3b3af]"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        {/* Line */}
        <div className="my-8 border-t border-gray-200" />

        {/* Links */}
        <div className="text-center text-sm text-gray-600 space-y-3">
          <a href="#" className="text-[#a8201a] hover:underline">
            パスワードを忘れた方はこちら
          </a>
          <div>
            アカウントをお持ちでない方はこちら{" "}
            <a href="/register" className="text-[#a8201a] hover:underline">
              登録
            </a>
          </div>
        </div>
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
