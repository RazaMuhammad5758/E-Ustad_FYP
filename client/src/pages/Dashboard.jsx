import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Professionals from "./Professionals";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

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
        const cRes = await api.get("/gig-comments", { params: { gigIds: ids } });
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

  async function deleteGig(gigId) {
    const ok = window.confirm("Delete this gig permanently?");
    if (!ok) return;

    try {
      await api.delete(`/gigs/${gigId}`);
      toast.success("Gig deleted");
      await loadProfessionalDashboard();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete gig");
    }
  }

  useEffect(() => {
    if (user?.role === "professional") {
      loadProfessionalDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-sky-50 to-slate-100" />
        <div className="absolute -top-40 right-[-170px] h-[520px] w-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-52 left-[-210px] h-[600px] w-[600px] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ================= CLIENT ================= */}
        {user?.role === "client" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Available Professionals
              </h2>

              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-indigo-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  My Booking Requests
                </Link>
              </div>
            </div>

            <Professionals embedded />
          </>
        )}

        {/* ================= PROFESSIONAL ================= */}
        {user?.role === "professional" && (
          <>
            {/* top actions */}
            <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-[2px]">
              <Link
                to="/requests"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Requests
              </Link>

              <Link
                to="/add-gig"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-indigo-800"
              >
                + Add Gig
              </Link>

              <Link
                to="/pro-profile"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Profile
              </Link>
            </div>

            <div className="space-y-6">
              {loadingPro ? (
                <div className="text-slate-600">Loading your dashboard...</div>
              ) : (
                <>
                  {/* stats */}
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-[2px]">
                    <div className="mb-3 text-lg font-extrabold text-slate-900">
                      My Stats
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        ["Total", proData?.stats?.total ?? 0],
                        ["Pending", proData?.stats?.pending ?? 0],
                        ["Accepted", proData?.stats?.accepted ?? 0],
                        ["Rejected", proData?.stats?.rejected ?? 0],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="text-xs font-semibold text-slate-500">
                            {label}
                          </div>
                          <div className="mt-1 text-2xl font-extrabold text-slate-900">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ================= MY GIGS (LIKE SCREENSHOT) ================= */}
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-[2px]">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-lg font-extrabold text-slate-900">
                        My Gigs
                      </div>

                      <Link
                        to="/add-gig"
                        className="text-sm font-semibold text-indigo-700 hover:underline"
                      >
                        + Add New
                      </Link>
                    </div>

                    {/* grid like screenshot: 1 (mobile) | 2 (md) | 3 (xl) */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {(proData?.gigs || []).map((g) => {
                        const comments = commentCounts?.[g._id] ?? 0;

                        return (
                          <div
                            key={g._id}
                            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                          >
                            {/* top row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                                  {g.image ? (
                                    <img
                                      src={`${BASE}/uploads/${g.image}`}
                                      alt="gig"
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : null}
                                </div>

                                <div>
                                  <div className="text-lg font-extrabold text-slate-900 leading-tight line-clamp-1">
                                    {g.title}
                                  </div>

                                  <div className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                                    Rs. {g.price}
                                  </div>
                                </div>
                              </div>

                              {/* actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => nav(`/edit-gig/${g._id}`)}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteGig(g._id)}
                                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* description */}
                            <p className="mt-4 text-slate-600 text-base leading-relaxed line-clamp-2">
                              {g.description?.trim()
                                ? g.description
                                : "View details for full description and gig information."}
                            </p>

                            {/* bottom row (COMMENTS FIXED ✅) */}
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-sm font-semibold text-slate-700">
                                Comments:{" "}
                                <span className="font-extrabold text-slate-900">
                                  {comments}
                                </span>
                              </div>

                              <button
                                onClick={() => nav(`/edit-gig/${g._id}`)}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                              >
                                View / Edit →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(!proData?.gigs || proData.gigs.length === 0) && (
                      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                        No gigs yet. Click <b>Add New</b> to create one.
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
