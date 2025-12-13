import { useAuth } from "../context/AuthContext";
import Professionals from "./Professionals";
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
            {user?.name} ({user?.role})
          </div>
          <button onClick={logout} className="text-sm underline text-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Role Based Content */}
      <div className="p-6">
        {user?.role === "client" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Available Professionals</h2>

              <Link to="/my-bookings" className="underline text-sm">
                My Booking Requests
              </Link>
            </div>

            <Professionals embedded />
          </>
        )}

        {user?.role === "professional" && (
          <>
            {/* ✅ Use Link instead of <a href> */}
            <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 text-sm">
              <Link to="/requests" className="underline">
                Requests
              </Link>
              <Link to="/add-gig" className="underline">
                Add Gig
              </Link>
              <Link to="/pro-profile" className="underline font-semibold">
                My Profile
              </Link>
            </div>

            <div className="mt-4 text-gray-600 text-sm">
              Tip: Open <b>My Profile</b> to see your stats and gigs.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
