import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE = "http://localhost:5000";

export default function ProProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [gigComments, setGigComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const res = await api.get("/professional/me");
      setData(res.data);

      // load comments for each gig
      const loadedGigs = res.data?.gigs || [];

      setLoadingComments(true);
      try {
        const map = {};
        for (const g of loadedGigs) {
          const cRes = await api.get(`/gig-comments/${g._id}`);
          map[g._id] = cRes.data.comments || [];
        }
        setGigComments(map);
      } catch (e) {
        console.log("Failed to load comments for gigs", e?.response?.status);
      } finally {
        setLoadingComments(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  const { user, professional, stats, gigs } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex gap-3 text-sm">
            <Link to="/add-gig" className="underline">
              Add Gig
            </Link>
            <Link to="/dashboard" className="underline">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Profile + Stats */}
        <div className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-sm text-gray-600">
              {professional?.category || "-"}
            </div>
            <div className="text-sm">Email: {user?.email}</div>
            <div className="text-sm">Phone: {user?.phone}</div>

            <div className="text-sm">
              <b>Intro:</b>
              <div className="border rounded p-2 mt-1">
                {professional?.shortIntro || "-"}
              </div>
            </div>

            {/* Registration details view */}
            <div className="text-sm space-y-1 pt-2">
              {professional?.cnicPic && (
                <div className="text-xs text-gray-600">
                  CNIC Pic:{" "}
                  <a
                    className="underline"
                    href={`${BASE}/uploads/${professional.cnicPic}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </div>
              )}

              {professional?.feeScreenshot && (
                <div className="text-xs text-gray-600">
                  Fee Screenshot:{" "}
                  <a
                    className="underline"
                    href={`${BASE}/uploads/${professional.feeScreenshot}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {user?.profilePic && (
              <img
                className="w-full h-56 object-cover rounded border"
                src={`${BASE}/uploads/${user.profilePic}`}
                alt="profile"
              />
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border rounded p-3">
                <b>Total:</b> {stats?.total ?? 0}
              </div>
              <div className="border rounded p-3">
                <b>Pending:</b> {stats?.pending ?? 0}
              </div>
              <div className="border rounded p-3">
                <b>Accepted:</b> {stats?.accepted ?? 0}
              </div>
              <div className="border rounded p-3">
                <b>Rejected:</b> {stats?.rejected ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* My Gigs */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="font-bold">My Gigs</div>
            <Link to="/add-gig" className="underline text-sm">
              Add Gig
            </Link>
          </div>

          {gigs?.map((g) => (
            <div key={g._id} className="border rounded p-3 space-y-2">
              <div className="font-semibold">{g.title}</div>
              <div className="text-sm text-gray-600">Rs. {g.price}</div>

              {g.image && (
                <img
                  src={`${BASE}/uploads/${g.image}`}
                  className="w-full h-44 object-cover rounded"
                  alt="gig"
                />
              )}

              <div className="text-sm">{g.description || "-"}</div>

              {/* ✅ COMMENTS (Step 3 applied) */}
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold mb-2">Comments</div>

                {(gigComments[g._id] || []).map((c) => (
                  <div key={c._id} className="flex gap-2 text-sm mb-2">
                    {c.userId?.profilePic && (
                      <img
                        src={`${BASE}/uploads/${c.userId.profilePic}`}
                        className="w-8 h-8 rounded-full object-cover"
                        alt="user"
                      />
                    )}
                    <div>
                      <div className="font-semibold">
                        {c.userId?.name || "User"}
                      </div>
                      <div>{c.text}</div>
                    </div>
                  </div>
                ))}

                {!loadingComments && (gigComments[g._id] || []).length === 0 && (
                  <div className="text-gray-500 text-sm">No comments yet.</div>
                )}

                {loadingComments && (
                  <div className="text-gray-500 text-sm">Loading comments...</div>
                )}
              </div>
            </div>
          ))}

          {(!gigs || gigs.length === 0) && (
            <div className="text-gray-500 text-sm">No gigs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
