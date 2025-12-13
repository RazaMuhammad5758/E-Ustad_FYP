import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import SetPassword from "./pages/SetPassword";
import Admin from "./pages/Admin";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Admin (manual auth via headers) */}
          <Route path="/admin" element={<Admin />} />

          {/* Public */}
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/professionals/:id" element={<ProfessionalDetail />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-gig"
            element={
              <ProtectedRoute>
                <AddGig />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pro-profile"
            element={
              <ProtectedRoute>
                <ProProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <Book />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
