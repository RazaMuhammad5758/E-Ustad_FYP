import { useEffect, useState } from "react";
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

export default function ProfessionalDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [comments, setComments] = useState({});
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

        try {
          const results = await Promise.all(
            loadedGigs.map((g) => api.get(`/gig-comments/${g._id}`))
          );

          const map = {};
          loadedGigs.forEach((g, idx) => {
            map[g._id] = results[idx].data.comments || [];
          });

          setComments(map);
        } catch (e) {
          console.log("comments load failed", e?.response?.status, e?.response?.data);
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function submitComment(gigId) {
    const text = texts[gigId];
    if (!text?.trim()) return toast.error("Write something");

    try {
      await api.post("/gig-comments", { gigId, text: text.trim() });
      toast.success("Comment added");

      setTexts((p) => ({ ...p, [gigId]: "" }));

      const cRes = await api.get(`/gig-comments/${gigId}`);
      setComments((prev) => ({ ...prev, [gigId]: cRes.data.comments || [] }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Comment failed");
    }
  }

  if (loading) return <Skeleton />;
  if (!data)
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
        Not found
      </div>
    );

  const { user, professional } = data;

  const profileDp = user?.profilePic
    ? `${BASE}/uploads/${user.profilePic}`
    : "/dp.jpg";

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
            {gigs.map((g) => (
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

                  <div className="mt-3 text-xs font-semibold text-slate-500">
                    Comments: {(comments[g._id] || []).length}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-3 space-y-3">
                  {(comments[g._id] || []).map((c) => {
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
                          <div className="text-sm text-slate-700">{c.text}</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add comment */}
                  <div className="flex gap-2">
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
              </div>
            ))}

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

          {/* bottom CTA for mobile */}
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
