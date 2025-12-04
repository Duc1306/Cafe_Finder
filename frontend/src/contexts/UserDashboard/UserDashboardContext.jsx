import { useEffect, useState } from "react";
import { getUserDashboard } from "../../services/userDashboardService.js";
import { message } from "antd";
import { UserDashboardContext } from "./UserDashboardContext.js"; 

export function UserDashboardProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
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
    };
    fetchDashboard();
  }, []);

  return (
    <UserDashboardContext.Provider value={{ dashboard, loading }}>
      {children}
    </UserDashboardContext.Provider>
  );
}