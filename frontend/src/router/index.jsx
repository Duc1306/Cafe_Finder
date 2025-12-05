import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Register from "../pages/Register";
import SignIn from "../pages/SignIn";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import { UserRoutes } from "./userRoutes";
import { AdminRoutes } from "./adminRoutes";
import { Terms } from "../pages/Terms";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/terms" element={<Terms/>}></Route>
      {UserRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}

