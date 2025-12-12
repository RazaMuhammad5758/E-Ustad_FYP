import { useAuth } from "../context/AuthContext";
import Professionals from "./Professionals";
import Requests from "./Requests";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="font-bold text-lg">E-Ustad Dashboard</div>
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-600">
            {user.name} ({user.role})
          </div>
          <button
            onClick={logout}
            className="text-sm underline text-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Role Based Content */}
      <div className="p-6">
        {user.role === "client" && (
          <>
            <h2 className="text-xl font-bold mb-3">
              Available Professionals
            </h2>
            <Professionals embedded />
          </>
        )}

        {user.role === "professional" && (
          <>
            <h2 className="text-xl font-bold mb-3">
              Booking Requests
            </h2>
            <Requests />
          </>
        )}
      </div>
    </div>
  );
}
