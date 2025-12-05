import { Route } from "react-router-dom";
import { UserLayout } from "../components/layouts/user-layout";
import UserDashboardPage from "../pages/user/userDashboard";
import UserProfile from "../pages/user/userProfile";

export function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/user/dashboard" element={<UserDashboardPage />} />
      <Route path="/user/profile" element={<UserProfile />} />
    </Route>
  );
}