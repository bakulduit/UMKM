import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

import SuperDashboard from "@/pages/admin/SuperDashboard";
import ManageUmkms from "@/pages/admin/ManageUmkms";
import Payments from "@/pages/admin/Payments";
import PlatformSettings from "@/pages/admin/PlatformSettings";

import Dashboard from "@/pages/app/Dashboard";
import POS from "@/pages/app/POS";
import Products from "@/pages/app/Products";
import Customers from "@/pages/app/Customers";
import Purchases from "@/pages/app/Purchases";
import Reports from "@/pages/app/Reports";
import History from "@/pages/app/History";
import Outlets from "@/pages/app/Outlets";
import Cashiers from "@/pages/app/Cashiers";
import Subscription from "@/pages/app/Subscription";
import StoreSettings from "@/pages/app/StoreSettings";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors closeButton />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["super_admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperDashboard />} />
              <Route path="umkm" element={<ManageUmkms />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<PlatformSettings />} />
            </Route>

            <Route
              path="/app"
              element={
                <ProtectedRoute roles={["umkm_admin", "cashier"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProtectedRoute roles={["umkm_admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="pos" element={<POS />} />
              <Route path="products" element={<ProtectedRoute roles={["umkm_admin"]}><Products /></ProtectedRoute>} />
              <Route path="purchases" element={<ProtectedRoute roles={["umkm_admin"]}><Purchases /></ProtectedRoute>} />
              <Route path="customers" element={<Customers />} />
              <Route path="reports" element={<ProtectedRoute roles={["umkm_admin"]}><Reports /></ProtectedRoute>} />
              <Route path="history" element={<History />} />
              <Route path="outlets" element={<ProtectedRoute roles={["umkm_admin"]}><Outlets /></ProtectedRoute>} />
              <Route path="cashiers" element={<ProtectedRoute roles={["umkm_admin"]}><Cashiers /></ProtectedRoute>} />
              <Route path="subscription" element={<ProtectedRoute roles={["umkm_admin"]}><Subscription /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute roles={["umkm_admin"]}><StoreSettings /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
