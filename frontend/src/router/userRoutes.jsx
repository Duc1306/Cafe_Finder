import { Route } from "react-router-dom";
import { UserLayout } from "../components/layouts/user-layout";
import UserDashboardPage from "../pages/user/userDashboard";
import UserProfile from "../pages/user/userProfile";
import CafeSearch from "../pages/user/CafeSearch";
import Favorites from "../pages/user/Favorites";
import CafeDetail from "../pages/user/CafeDetail";
import UserReviews from "../pages/user/userReviews";

export function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/user/dashboard" element={<UserDashboardPage />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/cafes/search" element={<CafeSearch />} />
      <Route path="/user/cafes/:id" element={<CafeDetail />} />
      <Route path="/user/favorites" element={<Favorites />} />
      <Route path="/user/review" element={<UserReviews />} />
    </Route>
  );
}
