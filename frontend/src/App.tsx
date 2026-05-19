import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyGoals from "./pages/employee/MyGoals";
import QuarterlyCheckin from "./pages/employee/QuarterlyCheckin";
import Approvals from "./pages/manager/Approvals";
import TeamCheckins from "./pages/manager/TeamCheckins";
import SharedGoals from "./pages/admin/SharedGoals";
import AuditLog from "./pages/admin/AuditLog";
import UserManagement from "./pages/admin/UserManagement";
import CycleManagement from "./pages/admin/CycleManagement";
import Analytics from "./pages/admin/Analytics";
import Reports from "./pages/admin/Reports";
import ThrustAreas from "./pages/admin/ThrustAreas";
import AppShell from "./components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/goals" element={<MyGoals />} />
                      <Route path="/checkin" element={<QuarterlyCheckin />} />
                      <Route path="/approvals" element={<Approvals />} />
                      <Route path="/team-checkins" element={<TeamCheckins />} />
                      <Route path="/admin/shared-goals" element={<SharedGoals />} />
                      <Route path="/admin/audit" element={<AuditLog />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/cycles" element={<CycleManagement />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/admin/thrust-areas" element={<ThrustAreas />} />
                      <Route path="/admin/reports" element={<Reports />} />
                      {/* Other routes will be added in later phases */}
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
