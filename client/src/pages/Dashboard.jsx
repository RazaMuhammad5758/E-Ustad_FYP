import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Professionals from "./Professionals";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

export default function Dashboard() {
  const { user } = useAuth();

  // ✅ professional dashboard data (gigs + stats)
  const [proData, setProData] = useState(null);
  const [loadingPro, setLoadingPro] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});


  async function loadProfessionalDashboard() {
    try {
      setLoadingPro(true);
      const res = await api.get("/professional/me");
      setProData(res.data);
      const gigs = res.data?.gigs || [];
      if (gigs.length) {
        const ids = gigs.map((g) => g._id).join(",");
        const cRes = await api.get(`/gig-comments`, { params: { gigIds: ids } });
        setCommentCounts(cRes.data.counts || {});
      } else {
        setCommentCounts({});
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoadingPro(false);
    }
  }

  useEffect(() => {
    if (user?.role === "professional") {
      loadProfessionalDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ NOTE: Top bar removed to avoid double navbar */}

      <div className="p-6 max-w-6xl mx-auto">
        {user?.role === "client" && (
          <>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-xl font-bold">Available Professionals</h2>

              <div className="flex gap-4 text-sm">
                <Link to="/client-profile" className="underline font-semibold">
                  {/* My Profile */}
                </Link>

                <Link to="/my-bookings" className="underline">
                  My Booking Requests
                </Link>
              </div>
            </div>

            <Professionals embedded />
          </>
        )}

        {user?.role === "professional" && (
          <>
            <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 text-sm">
              <Link to="/requests" className="underline">
                Requests
              </Link>
              <Link to="/add-gig" className="underline">
                Add Gig
              </Link>
              <Link to="/pro-profile" className="underline font-semibold">
                {/* My Profile */}
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {/* ✅ Stats + Gigs on Dashboard */}
              {loadingPro ? (
                <div className="text-gray-500">Loading your dashboard...</div>
              ) : (
                <>
                  <div className="bg-white border rounded-xl p-4">
                    <div className="font-bold mb-2">My Stats</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="border rounded p-3">
                        <b>Total:</b> {proData?.stats?.total ?? 0}
                      </div>
                      <div className="border rounded p-3">
                        <b>Pending:</b> {proData?.stats?.pending ?? 0}
                      </div>
                      <div className="border rounded p-3">
                        <b>Accepted:</b> {proData?.stats?.accepted ?? 0}
                      </div>
                      <div className="border rounded p-3">
                        <b>Rejected:</b> {proData?.stats?.rejected ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold">My Gigs</div>
                      <Link to="/add-gig" className="underline text-sm">
                        Add New Gig
                      </Link>
                    </div>

                    {(proData?.gigs || []).map((g) => (
                      <div key={g._id} className="border rounded p-3 space-y-2">
                        <div className="font-semibold">{g.title}</div>
                        <div className="text-sm text-gray-600">Rs. {g.price}</div>
                        <div className="text-xs text-gray-500">
  Comments: {commentCounts[g._id] ?? 0}
</div>


                        {g.image && (
                          <img
                            src={`${BASE}/uploads/${g.image}`}
                            className="w-full h-44 object-cover rounded"
                            alt="gig"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}

                        <div className="text-sm">{g.description || "-"}</div>
                      </div>
                    ))}

                    {(!proData?.gigs || proData.gigs.length === 0) && (
                      <div className="text-gray-500 text-sm">
                        No gigs yet. Click <b>Add New Gig</b> to create one.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
