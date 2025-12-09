import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../Sidebar/AdminSidebar";

export function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">カフェ管理システム</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
          <Outlet />
        </main>
      </div>
    </div>
  );
}