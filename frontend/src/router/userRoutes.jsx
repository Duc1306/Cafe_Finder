import { Route } from "react-router-dom";
import { UserLayout } from "../components/layouts/user-layout";
import UserDashboardPage from "../pages/user/userDashboard";
import UserProfile from "../pages/user/userProfile";
import CafeSearch from "../pages/user/CafeSearch";
import CafeDetail from "../pages/user/CafeDetail";
import NearbyPage from "../pages/user/NearbyPage";
import FavoritesPage from "../pages/user/FavoritesPage";
import PromotionsPage from "../pages/user/PromotionsPage";
import MyReviews from "../pages/user/MyReviews";


export function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/user/dashboard" element={<UserDashboardPage />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/search" element={<CafeSearch />} />
      <Route path="/cafes/:id" element={<CafeDetail />} />
      <Route path="/nearby" element={<NearbyPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/reviews" element={<MyReviews/>}/>
    </Route>
  );
}

