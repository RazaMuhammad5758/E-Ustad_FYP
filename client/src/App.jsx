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
          <Route path="/admin" element={<Admin />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/my-bookings" element={<MyBookings />} />
<Route path="/professionals/:id" element={<ProfessionalDetail />} />
<Route path="/add-gig" element={<AddGig />} />

<Route path="/pro-profile" element={<ProProfile />} />


<Route path="/requests" element={<Requests />} />
<Route path="/book/:id" element={<Book />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
