import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CATEGORIES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";

const BASE = "http://localhost:5000";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200/70" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/60" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/50" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200/60" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200/50" />
        <div className="mt-3 h-9 w-28 animate-pulse rounded-xl bg-slate-200/60" />
      </div>
    </div>
  );
}

function starsText(avg = 0) {
  const a = Number(avg || 0);
  return `${a.toFixed(1)}★`;
}

export default function Professionals({ embedded = false }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const CITIES = [
    "",
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Peshawar",
    "Quetta",
    "Faisalabad",
    "Multan",
    "Gujranwala",
    "Sialkot",
    "Hyderabad",
  ];

  async function load(next = {}) {
    try {
      setLoading(true);
      if (!embedded) window.scrollTo({ top: 0, behavior: "smooth" });

      const res = await api.get("/professionals", {
        params: {
          q: (next.q ?? q).trim(),
          city: next.city ?? city,
          category: next.category ?? category,
        },
      });

      setItems(res.data.professionals || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load professionals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const qpQ = searchParams.get("q") || "";
    const qpCity = searchParams.get("city") || "";
    const qpCategory = searchParams.get("category") || "";

    setQ(qpQ);
    setCity(qpCity);
    setCategory(qpCategory);

    load({ q: qpQ, city: qpCity, category: qpCategory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onKeyDown(e) {
    if (e.key === "Enter") load();
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-slate-50 text-slate-900"}>
      <div
        className={
          embedded ? "space-y-4" : "mx-auto max-w-6xl px-4 py-8 space-y-5"
        }
      >
        {!embedded && (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Find Professionals
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Search by name, city, category
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="Search name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={onKeyDown}
            >
              <option value="">All Cities</option>
              {CITIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={onKeyDown}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Tip: Press <span className="font-semibold">Enter</span> to search
            quickly.
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {items.map((p) => {
                const img =
                  p.profilePic ? `${BASE}/uploads/${p.profilePic}` : "/dp.jpg";

                const avg = Number(p.ratingAvg || 0);
                const count = Number(p.ratingCount || 0);

                return (
                  <div
                    key={p._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={img}
                          alt={p.name || "Professional"}
                          className="h-14 w-14 rounded-full object-cover border border-slate-200 bg-slate-50 ring-2 ring-indigo-50"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/dp.jpg";
                          }}
                        />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
                          title="Verified"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="line-clamp-1 text-lg font-extrabold tracking-tight text-slate-900">
                              {p.name}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                {p.professional?.category || "—"}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {p.city || "—"}
                              </span>

                              {/* ✅ Rating badge */}
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                {starsText(avg)} ({count})
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {p.professional?.bio ||
                        "View profile for full details, skills, and contact process."}
                    </p>

                    <div className="mt-4">
                      <Link
                        to={`/professionals/${p._id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
                <div className="text-base font-semibold text-slate-900">
                  No professionals found
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Try changing the city/category or clear the search.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
