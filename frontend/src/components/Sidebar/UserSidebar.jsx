import { FaThLarge, FaSearch, FaHeart, FaCommentDots, FaTags, FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {Coffee} from 'lucide-react'

const menu = [
  { icon: <FaThLarge />, label: "ダッシュボード", href: "/user/dashboard" },
  { icon: <FaSearch />, label: "カフェ検索", href: "/search" },
  { icon: <FaHeart />, label: "お気に入り", href: "/favorites" },
  { icon: <FaCommentDots />, label: "レビュー", href: "/reviews" },
  { icon: <FaTags />, label: "プロモーション", href: "/promotions" },
  { icon: <FaUser />, label: "プロフィール", href: "/user/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    localStorage.removeItem("userRole");

    navigate("/signin");
  };

  return (
    <aside className="w-64 bg-white h-screen shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center px-6 py-4 border-b">
          <span className="text-2xl mr-2"><Coffee className="w-10 h-10 text-primary text-[#8b1a1a]" /></span>
          <span className="font-bold text-lg">Cafe Finder</span>
          <button className="ml-auto text-xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <nav className="mt-4">
          <ul>
            {menu.map((item, idx) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={idx}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-6 py-3 transition ${isActive
                      ? "bg-gray-100 text-black font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                      }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="px-6 py-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-800 font-semibold"
        >
          <FiLogOut className="mr-2" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}