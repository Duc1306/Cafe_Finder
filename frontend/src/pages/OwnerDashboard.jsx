import React, { useState } from 'react';
import '../constants/style.css'; // Đảm bảo bạn đã có file CSS từ bước trước

// --- 1. Mock Data ---
const initialCafeData = [
  { id: "#1", name: "カフェ モダン", address: "東京都渋谷区1-2-3", status: "営業中", reviews: 10, likes: 120, rating: 4.5 },
  { id: "#2", name: "スターライトカフェ", address: "東京都新宿区4-5-6", status: "営業中", reviews: 8, likes: 85, rating: 4.2 },
  { id: "#3", name: "ブルームーンカフェ", address: "東京都港区7-8-9", status: "休止中", reviews: 6, likes: 200, rating: 4.8 },
];

// --- 2. Sub-Components ---

// Header Component
const Header = () => (
  <header className="header">
    <div className="logo">[LOGO] Cafe Finder</div>
    <button className="logout-btn">[ICON] ログアウト</button>
  </header>
);

// Sidebar Component
const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <a href="#" className="nav-item active">ダッシュボード</a>
      <a href="#" className="nav-item">店舗管理</a>
      <a href="#" className="nav-item">レビュー管理</a>
      <a href="#" className="nav-item">設定</a>
    </nav>
  </aside>
);

// Stats/Metrics Component
const StatsCards = ({ cafes }) => {
  const totalCafes = cafes.length;
  const activeCafes = cafes.filter(c => c.status === "営業中").length;
  const totalReviews = cafes.reduce((sum, c) => sum + c.reviews, 0);

  return (
    <div className="stats-container">
      {/* Card 1: Tổng số quán */}
      <div className="card">
        <div className="card-content">
          <div className="card-header-row">
             <span>[ICON] 総カフェ数</span>
          </div>
          <p className="card-value">{totalCafes}</p>
          <span className="card-sub">登録されているカフェ</span>
        </div>
      </div>

      {/* Card 2: Quán đang hoạt động */}
      <div className="card">
        <div className="card-content">
          <div className="card-header-row">
             <span>[ICON] 稼働中カフェ数</span>
          </div>
          <p className="card-value">{activeCafes}</p>
          <span className="card-sub">営業中のカフェ</span>
        </div>
      </div>

      {/* Card 3: Tổng Review */}
      <div className="card">
        <div className="card-content">
          <div className="card-header-row">
             <span>[ICON] レビュー数</span>
          </div>
          <p className="card-value">{totalReviews}</p>
          <span className="card-sub">全カフェの合計</span>
        </div>
      </div>
    </div>
  );
};

// Cafe List Component
const CafeList = ({ cafes }) => {
  return (
    <div className="cafe-list-section">
      {/* Toolbar: Search & Add */}
      <div className="toolbar">
        <div className="search-wrapper">
             <span className="search-icon">[ICON]</span>
             <input type="text" placeholder="カフェ名で検索" className="search-input-field" />
        </div>
        <button className="btn-primary">[+] 新規カフェ作成</button>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header-title">カフェ一覧</div>
        <table className="cafe-table">
          <thead>
            <tr>
              <th>カフェID</th>
              <th>カフェ名</th>
              <th>住所</th>
              <th>ステータス</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {cafes.map((cafe) => (
              <tr key={cafe.id}>
                <td>{cafe.id}</td>
                <td>{cafe.name}</td>
                <td>{cafe.address}</td>
                <td>
                  <span className={`status-badge ${cafe.status === '営業中' ? 'status-active' : 'status-inactive'}`}>
                    [{cafe.status}]
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button>詳細</button>
                    <button>編集</button>
                    <button>削除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 3. Main Page Component ---
const OwnerDashboard = () => {
  // Giả lập state data (có thể thay thế bằng API call sau này)
  const [cafes] = useState(initialCafeData);

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar />
        <main className="content">
          <div className="page-header">
            <h1>ダッシュボード</h1>
            <p>カフェの管理と統計情報</p>
          </div>
          
          <hr className="divider" />
          
          {/* Metrics Section */}
          <StatsCards cafes={cafes} />
          
          {/* List Section */}
          <CafeList cafes={cafes} />
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
