import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Register from "../pages/Register";
import SignIn from "../pages/SignIn";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import CreateCafe from "../pages/owner/CreateCafe";
import CafeDetail from "../pages/Owner/CafeDetail";
import EditCafe from '../pages/Owner/EditCafe';
import { UserRoutes } from "./userRoutes";
import { AdminRoutes } from "./adminRoutes";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/create-cafe" element={<CreateCafe />} />
      <Route path="/owner/cafe/:id" element={<CafeDetail />} />
      <Route path="/owner/edit-cafe/:id" element={<EditCafe />} />


      {UserRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}

