import { UserDashboardProvider } from "./contexts/UserDashboard/UserDashboardContext.jsx";

export function AppProvider({ children }) {
  return (
    <UserDashboardProvider>
      {children}
    </UserDashboardProvider>
  );
}