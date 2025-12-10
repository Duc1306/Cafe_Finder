import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layouts/admin-layout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminTermsPage from "../pages/admin/terms";
import AdminCustomers from "../pages/admin/Customers";
import AdminCafes from "../pages/admin/Cafes";
import AdminCafeDetail from "../pages/admin/CafeDetail";
import CafeApprovalRequests from "../pages/admin/CafeRequests";
import AdminOwners from "../pages/admin/Owners";

export function AdminRoutes() {
    return (
        <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/owners" element={<AdminOwners />} />
            <Route path="/admin/cafes" element={<AdminCafes />} />
            <Route path="/admin/cafes/requests" element={<CafeApprovalRequests />} />
            <Route path="/admin/cafes/:id" element={<AdminCafeDetail />} />
            <Route path="/admin/terms" element={<AdminTermsPage />} />
        </Route>


    );
}