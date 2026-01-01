import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200/70" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200/70" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200/70" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200/60" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200/50" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-slate-200/70" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/60" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-200/50" />
                <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function starsText(avg = 0) {
  const a = Number(avg || 0);
  return `${a.toFixed(1)}★`;
}

export default function ProfessionalDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [gigs, setGigs] = useState([]);

  // comments state per gig
  const [comments, setComments] = useState({}); // { gigId: [] }
  const [commentsOpen, setCommentsOpen] = useState({}); // { gigId: true/false }
  const [commentsLoaded, setCommentsLoaded] = useState({}); // { gigId: true/false }
  const [commentsLoading, setCommentsLoading] = useState({}); // { gigId: true/false }

  const [texts, setTexts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pRes, gRes] = await Promise.all([
          api.get(`/professionals/${id}`),
          api.get(`/gigs/by/${id}`),
        ]);

        setData(pRes.data);

        const loadedGigs = gRes.data.gigs || [];
        setGigs(loadedGigs);

        // ✅ IMPORTANT: client side pe comments preload nahi karne
        // default: closed + not loaded
        const openMap = {};
        const loadedMap = {};
        const loadingMap = {};
        loadedGigs.forEach((g) => {
          openMap[g._id] = false;
          loadedMap[g._id] = false;
          loadingMap[g._id] = false;
        });
        setCommentsOpen(openMap);
        setCommentsLoaded(loadedMap);
        setCommentsLoading(loadingMap);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function loadComments(gigId) {
    // already loading?
    if (commentsLoading[gigId]) return;

    try {
      setCommentsLoading((p) => ({ ...p, [gigId]: true }));
      const cRes = await api.get(`/gig-comments/${gigId}`);
      setComments((prev) => ({ ...prev, [gigId]: cRes.data.comments || [] }));
      setCommentsLoaded((p) => ({ ...p, [gigId]: true }));
    } catch (e) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading((p) => ({ ...p, [gigId]: false }));
    }
  }

  async function toggleComments(gigId) {
    const isOpen = !!commentsOpen[gigId];
    const nextOpen = !isOpen;

    setCommentsOpen((p) => ({ ...p, [gigId]: nextOpen }));

    // ✅ on opening: lazy load once
    if (nextOpen && !commentsLoaded[gigId]) {
      await loadComments(gigId);
    }
  }

  async function submitComment(gigId) {
    const text = texts[gigId];
    if (!text?.trim()) return toast.error("Write something");

    try {
      await api.post("/gig-comments", { gigId, text: text.trim() });
      toast.success("Comment added");
      setTexts((p) => ({ ...p, [gigId]: "" }));

      // ✅ after adding comment, open comments + refresh
      setCommentsOpen((p) => ({ ...p, [gigId]: true }));
      await loadComments(gigId);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Comment failed");
    }
  }

  if (loading) return <Skeleton />;

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
        Not found
      </div>
    );
  }

  const { user, professional } = data;

  const profileDp = user?.profilePic
    ? `${BASE}/uploads/${user.profilePic}`
    : "/dp.jpg";

  const avg = Number(user?.ratingAvg || 0);
  const count = Number(user?.ratingCount || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={profileDp}
                alt="dp"
                className="h-16 w-16 rounded-full object-cover border border-slate-200 bg-slate-50 ring-2 ring-indigo-50"
                onError={(e) => {
                  e.currentTarget.src = "/dp.jpg";
                }}
              />

              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {user?.name}
                </h1>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {professional?.category || "-"}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>

                  {/* Rating badge */}
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {starsText(avg)} ({count})
                  </span>
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  Phone:{" "}
                  <span className="italic text-slate-500">
                    Hidden until booking is accepted
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/book/${user._id}`}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Book this Professional →
            </Link>
          </div>

          {/* Intro */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-slate-900">Intro</div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {professional?.shortIntro || "-"}
            </div>
          </div>
        </div>

        {/* Gigs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Gigs / Services
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Choose a service and leave feedback if needed.
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Total: {gigs.length}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {gigs.map((g) => {
              const list = comments[g._id] || [];
              const isOpen = !!commentsOpen[g._id];
              const isLoaded = !!commentsLoaded[g._id];
              const isLoading = !!commentsLoading[g._id];

              return (
                <div
                  key={g._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  {g.image && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="aspect-[16/10] w-full">
                        <img
                          src={`${BASE}/uploads/${g.image}`}
                          className="h-full w-full object-cover"
                          alt="gig"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="text-base font-extrabold tracking-tight text-slate-900">
                      {g.title}
                    </div>

                    <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Rs. {g.price}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      {g.description}
                    </div>

                    {/* ✅ Comments header row (like professional) */}
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-sm font-semibold text-slate-800">
                        Comments:{" "}
                        <span className="text-slate-600">
                          {isLoaded ? list.length : "—"}
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
                  </div>

                  {/* ✅ Comments body (only if open) */}
                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      {isLoading && (
                        <div className="text-sm text-slate-500">
                          Loading comments...
                        </div>
                      )}

                      {!isLoading && isLoaded && list.length === 0 && (
                        <div className="text-sm text-slate-500">
                          No comments yet.
                        </div>
                      )}

                      {!isLoading &&
                        (list || []).map((c) => {
                          const dp = c.userId?.profilePic
                            ? `${BASE}/uploads/${c.userId.profilePic}`
                            : "/dp.jpg";

                          return (
                            <div key={c._id} className="flex gap-2">
                              <img
                                src={dp}
                                className="h-8 w-8 rounded-full object-cover border border-slate-200 bg-slate-50"
                                alt="dp"
                                onError={(e) => {
                                  e.currentTarget.src = "/dp.jpg";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900">
                                  {c.userId?.name || "User"}
                                </div>
                                <div className="text-sm text-slate-700">
                                  {c.text}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Add comment (open state) */}
                      <div className="flex gap-2 pt-1">
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                          placeholder="Write comment..."
                          value={texts[g._id] || ""}
                          onChange={(e) =>
                            setTexts((p) => ({ ...p, [g._id]: e.target.value }))
                          }
                        />
                        <button
                          onClick={() => submitComment(g._id)}
                          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ✅ If comments are hidden, still allow adding quick comment */}
                  {!isOpen && (
                    <div className="mt-3 flex gap-2">
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                        placeholder="Write comment..."
                        value={texts[g._id] || ""}
                        onChange={(e) =>
                          setTexts((p) => ({ ...p, [g._id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => submitComment(g._id)}
                        className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {gigs.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 md:col-span-2">
                <div className="text-base font-semibold text-slate-900">
                  No gigs yet
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  This professional hasn’t added services yet.
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 sm:hidden">
            <Link
              to={`/book/${user._id}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Book this Professional →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
