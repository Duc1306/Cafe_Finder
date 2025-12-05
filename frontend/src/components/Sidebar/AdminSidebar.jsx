import { AppstoreOutlined, UserOutlined, ShopOutlined, FileTextOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Coffee } from "lucide-react";
import { FiLogOut } from "react-icons/fi";

const menu = [
  { icon: <AppstoreOutlined />, label: "ダッシュボード", href: "/admin/dashboard" },
  { icon: <UserOutlined />, label: "顧客管理", href: "/admin/customers" },
  { icon: <UserOutlined />, label: "店舗オーナー管理", href: "/admin/owners" },
  { icon: <ShopOutlined />, label: "カフェ管理", href: "/admin/cafes" },
  { icon: <FileTextOutlined />, label: "利用規約", href: "/admin/terms" },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/signin");
  };

  return (
    <aside className="w-64 bg-white h-screen shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center px-6 py-4 border-b">
          <Coffee className="w-8 h-8 mr-3 text-[#8b1a1a]" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">コーヒー検索</span>
            <span className="text-sm font-semibold">システム</span>
          </div>
        </div>
        <nav className="mt-4">
          <ul>
            {menu.map((item, idx) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={idx}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-6 py-3 transition ${
                      isActive
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-base mr-4">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
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
