import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Professionals from "./Professionals";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";
const FALLBACK_GIG = "/dp.jpg";

function gigImgUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return `${BASE}/uploads/${image}`;
  const name = image?.filename || image?.path || image?.name;
  return name ? `${BASE}/uploads/${name}` : "";
}

function normalizeCommentText(c) {
  return (
    c?.text ??
    c?.comment ??
    c?.message ??
    c?.body ??
    c?.content ??
    c?.desc ??
    ""
  );
}

function normalizeCommentName(c) {
  return (
    c?.userId?.name ||          // ✅ FIX
    c?.user?.name ||
    c?.client?.name ||
    c?.author?.name ||
    c?.createdBy?.name ||
    c?.name ||
    "User"
  );
}

function normalizeCommentDp(c) {
  const pic =
    c?.userId?.profilePic ||    // ✅ FIX
    c?.user?.profilePic ||
    c?.client?.profilePic ||
    c?.author?.profilePic ||
    c?.createdBy?.profilePic ||
    "";

  return pic ? `${BASE}/uploads/${pic}` : "/dp.jpg";
}

/**
 * ✅ Extract comments for a gigId from ANY nested response
 */
function extractComments(respData, gigId) {
  if (!respData) return [];

  if (Array.isArray(respData)) return respData;

  const directArray =
    respData.comments ||
    respData.data ||
    respData.items ||
    respData.results ||
    respData.list;

  if (Array.isArray(directArray)) return directArray;

  const keyed =
    respData.commentsByGig ||
    respData.commentsMap ||
    respData.byGig ||
    respData.gigComments ||
    respData.comments;

  if (keyed && typeof keyed === "object" && !Array.isArray(keyed)) {
    const entry =
      keyed[gigId] ||
      keyed[String(gigId)] ||
      keyed?.[gigId?.toString?.()] ||
      null;

    if (Array.isArray(entry)) return entry;

    if (entry && typeof entry === "object") {
      const inner =
        entry.comments || entry.data || entry.items || entry.results || entry.list;
      if (Array.isArray(inner)) return inner;
    }
  }

  const nested = respData.data;
  if (nested && typeof nested === "object") {
    const nestedArr =
      nested.comments || nested.items || nested.results || nested.list;
    if (Array.isArray(nestedArr)) return nestedArr;

    const nestedKeyed =
      nested.commentsByGig ||
      nested.commentsMap ||
      nested.byGig ||
      nested.gigComments ||
      nested.comments;

    if (nestedKeyed && typeof nestedKeyed === "object" && !Array.isArray(nestedKeyed)) {
      const entry = nestedKeyed[gigId] || nestedKeyed[String(gigId)];

      if (Array.isArray(entry)) return entry;

      if (entry && typeof entry === "object") {
        const inner =
          entry.comments || entry.data || entry.items || entry.results || entry.list;
        if (Array.isArray(inner)) return inner;
      }
    }
  }

  return [];
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [proData, setProData] = useState(null);
  const [loadingPro, setLoadingPro] = useState(false);

  const [commentCounts, setCommentCounts] = useState({});

  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentsByGig, setCommentsByGig] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  async function loadProfessionalDashboard() {
    try {
      setLoadingPro(true);

      const res = await api.get("/professional/me");
      setProData(res.data);

      const gigs = res.data?.gigs || [];
      if (!gigs.length) {
        setCommentCounts({});
        return;
      }

      const ids = gigs.map((g) => g._id).filter(Boolean).join(",");
      const cRes = await api.get("/gig-comments", { params: { gigIds: ids } });

      setCommentCounts(cRes.data?.counts || {});

      const maybeKeyed =
        cRes.data?.commentsByGig ||
        cRes.data?.byGig ||
        cRes.data?.gigComments ||
        cRes.data?.comments;

      if (maybeKeyed && typeof maybeKeyed === "object" && !Array.isArray(maybeKeyed)) {
        const next = {};
        for (const id of gigs.map((x) => x._id)) {
          const list = extractComments(cRes.data, id);
          if (Array.isArray(list) && list.length) next[id] = list;
        }
        if (Object.keys(next).length) setCommentsByGig((p) => ({ ...p, ...next }));
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
      if (openCommentsFor === gigId) setOpenCommentsFor(null);
      await loadProfessionalDashboard();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete gig");
    }
  }

  async function fetchCommentsForGig(gigId) {
    if (!gigId) return;

    if (Array.isArray(commentsByGig[gigId]) && commentsByGig[gigId].length) return;

    setLoadingComments((p) => ({ ...p, [gigId]: true }));

    const trySetFromResponse = (data) => {
      const list = extractComments(data, gigId);

      if (Array.isArray(list) && list.length) {
        setCommentsByGig((p) => ({ ...p, [gigId]: list }));
        return true;
      }

      const count = commentCounts?.[gigId] ?? 0;
      if (count === 0) {
        setCommentsByGig((p) => ({ ...p, [gigId]: [] }));
        return true;
      }

      return false;
    };

    try {
      try {
        const r = await api.get("/gig-comments", { params: { gigId } });
        if (trySetFromResponse(r?.data)) return;
      } catch {}

      try {
        const r = await api.get("/gig-comments", { params: { gigIds: gigId } });
        if (trySetFromResponse(r?.data)) return;
      } catch {}

      try {
        const r = await api.get(`/gig-comments/${gigId}`);
        if (trySetFromResponse(r?.data)) return;
      } catch {}

      try {
        const r = await api.get(`/gigs/${gigId}/comments`);
        if (trySetFromResponse(r?.data)) return;
      } catch {}

      setCommentsByGig((p) => ({ ...p, [gigId]: [] }));
    } catch (e) {
      setCommentsByGig((p) => ({ ...p, [gigId]: [] }));
      toast.error(e?.response?.data?.message || "Comments load failed");
    } finally {
      setLoadingComments((p) => ({ ...p, [gigId]: false }));
    }
  }

  async function toggleComments(gigId) {
    if (openCommentsFor === gigId) {
      setOpenCommentsFor(null);
      return;
    }
    setOpenCommentsFor(gigId);
    await fetchCommentsForGig(gigId);
  }
  const [loading, setLoading] = useState(true);
async function load() {
    window.location.reload();
  }
  useEffect(() => {
    if (user?.role === "professional") loadProfessionalDashboard();
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

  {/* right-aligned refresh button */}
  <div className="ml-auto">
    <button
      onClick={load}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <span className="text-base">↻</span> Refresh
    </button>
  </div>
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
                        ["Tasks Pending", proData?.stats?.taskPending ?? 0],
                        ["Tasks Completed", proData?.stats?.taskCompleted ?? 0],
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

                  {/* my gigs */}
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

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {(proData?.gigs || []).map((g) => {
                        const count = commentCounts?.[g._id] ?? 0;
                        const img = gigImgUrl(g.image);
                        const isOpen = openCommentsFor === g._id;
                        const isLoading = !!loadingComments[g._id];
                        const list = commentsByGig[g._id] || [];

                        return (
                          <div
                            key={g._id}
                            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                          >
                            {/* top */}
                            
<div className="flex items-start justify-between gap-3">
  {/* left: title + price */}
  <div className="min-w-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-lg font-extrabold text-slate-900 leading-tight line-clamp-1">
          {g.title}
        </div>

        <div className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
          Rs. {g.price}
        </div>
      </div>

      {/* right: actions */}
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => nav(`/edit-gig/${g._id}`)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Edit
        </button>

        <button
          onClick={() => deleteGig(g._id)}
          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>

{/* image (always below header; no overlap) */}
<div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
  <div className="aspect-[16/11] w-full">
    <img
      src={img || FALLBACK_GIG}
      alt="gig"
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.src = FALLBACK_GIG;
      }}
    />
  </div>
</div>


                            <p className="mt-4 text-slate-600 text-base leading-relaxed line-clamp-2">
                              {g.description?.trim()
                                ? g.description
                                : "View details for full description and gig information."}
                            </p>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-700">
                                  Comments:{" "}
                                  <span className="font-extrabold text-slate-900">
                                    {count}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleComments(g._id)}
                                  className="text-sm font-semibold text-indigo-700 hover:underline"
                                >
                                  {isOpen ? "Hide comments" : "View comments"}
                                </button>
                              </div>

                              {isOpen && (
                                <div className="mt-3">
                                  {isLoading ? (
                                    <div className="text-sm text-slate-600">
                                      Loading comments...
                                    </div>
                                  ) : list.length === 0 ? (
                                    <div className="text-sm text-slate-600">
                                      No comments yet.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {list.map((c, idx) => (
                                        <div
                                          key={c?._id || idx}
                                          className="rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                          {/* ✅ DP + Name + Text */}
                                          <div className="flex items-start gap-2">
                                            <img
                                              src={normalizeCommentDp(c)}
                                              alt="dp"
                                              className="h-9 w-9 rounded-full object-cover border border-slate-200 bg-slate-50"
                                              onError={(e) => {
                                                e.currentTarget.src = "/dp.jpg";
                                              }}
                                            />

                                            <div className="min-w-0">
                                              <div className="text-xs font-semibold text-slate-700">
                                                {normalizeCommentName(c)}
                                              </div>
                                              <div className="mt-1 text-sm text-slate-700">
                                                {normalizeCommentText(c) || "-"}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-end">
                              <button
                                onClick={() => nav(`/edit-gig/${g._id}`)}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                              >
                                View
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
