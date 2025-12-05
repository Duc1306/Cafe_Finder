import { useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react"

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff7f5] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#f3e0dc]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl"><Coffee className="w-10 h-10 text-primary text-[#8b1a1a]" /></span>
            <span className="text-2xl font-bold text-[#8b1a1a]">Cafe Finder</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-700 hover:text-[#a8201a] transition">
              ホーム
            </a>
            <button
              onClick={() => navigate("/signin")}
              className="px-6 py-2 text-[#a8201a] border border-[#a8201a] rounded-lg hover:bg-[#fff0ee] transition"
            >
              ログイン
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-[#a8201a] text-white rounded-lg hover:bg-[#901a15] transition shadow-sm"
            >
              登録
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            カフェオーナー・ポータル
          </h2>
          <p className="text-gray-600 mb-12">
            あなたのカフェを登録して管理できるプラットフォーム
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/signin")}
              className="w-full sm:w-auto px-12 py-3 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition"
            >
              ログイン
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-12 py-3 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition"
            >
              新規登録
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#f3e0dc] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-6">
            <button className="px-8 py-2 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition font-medium">
              利用規約
            </button>
            <button className="px-8 py-2 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition font-medium">
              お問い合わせ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
