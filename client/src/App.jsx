import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layout/MainLayout";
import EditGig from "./pages/EditGig";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Professionals from "./pages/Professionals";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Book from "./pages/Book";
import Requests from "./pages/Requests";
import MyBookings from "./pages/MyBookings";
import AddGig from "./pages/AddGig";
import ProProfile from "./pages/ProProfile";
import ClientProfile from "./pages/ClientProfile";

import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import SetPassword from "./pages/SetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Public (with Header/Footer) */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route
            path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />

          <Route
            path="/register"
            element={
              <MainLayout>
                <Register />
              </MainLayout>
            }
          />

          <Route
            path="/professionals"
            element={
              <MainLayout>
                <Professionals />
              </MainLayout>
            }
          />

          <Route
            path="/professionals/:id"
            element={
              <MainLayout>
                <ProfessionalDetail />
              </MainLayout>
            }
          />

          {/* ✅ Protected (with Header/Footer) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyBookings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Requests />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-gig"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddGig />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/edit-gig/:id" element={<EditGig />} />

          <Route
            path="/pro-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Book />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ Admin (NO Header/Footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
