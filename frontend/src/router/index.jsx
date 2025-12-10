import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Register from "../pages/Register";
import SignIn from "../pages/SignIn";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import CreateCafe from "../pages/owner/CreateCafe";
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
      
      {UserRoutes()}
      {AdminRoutes()}
    </Routes>
  );
}

