import { Route } from "react-router-dom";
import { AdminLayout } from "../components/layouts/admin-layout";
import TermsPage from "../pages/admin/term";

export function AdminRoutes() {
    return (
        <Route element={<AdminLayout />}>
            <Route path="/admin/term" element={<TermsPage/>} />
        </Route>
    );
}