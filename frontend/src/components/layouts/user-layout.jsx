"use client"

import Sidebar from "../Sidebar/UserSidebar";
import { Outlet } from "react-router-dom";

export function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Cafe Finder</h1>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
          <Outlet />
        </main>
      </div>
    </div>
  );
}