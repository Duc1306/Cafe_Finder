import { useEffect, useState, useCallback } from "react";
import { getUserDashboard } from "../../services/UserDashBoardService";
import { message } from "antd";
import { UserDashboardContext } from "./UserDashboardContext"; 

export function UserDashboardProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const token =
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("token");
    if (!token) {
      setDashboard(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserDashboard();
      setDashboard(data);
    } catch {
      setDashboard(null);
      message.error("Không thể tải dữ liệu dashboard!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <UserDashboardContext.Provider value={{ dashboard, loading, refetch: fetchDashboard }}>
      {children}
    </UserDashboardContext.Provider>
  );
}