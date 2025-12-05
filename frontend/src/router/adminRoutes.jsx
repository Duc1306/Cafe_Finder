import { Route } from "react-router-dom";
import { AdminLayout } from "../components/layouts/admin-layout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminTermsPage from "../pages/admin/terms";
import AdminCustomers from "../pages/admin/Customers";
import AdminOwners from "../pages/admin/Cafes";

export function AdminRoutes() {
    return (
        <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard/>} />
            <Route path="/admin/customers" element={<AdminCustomers/>} />
            <Route path="/admin/owners" element={<AdminOwners/>} />
            <Route path="/admin/cafes" element={<AdminOwners/>} />
            <Route path="/admin/terms" element={<AdminTermsPage/>} />
        </Route>
    );
}