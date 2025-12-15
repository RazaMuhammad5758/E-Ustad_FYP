import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CATEGORIES } from "../constants/categories";

export default function Professionals({ embedded = false }) {
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

  async function load() {
    try {
      setLoading(true);

      // ✅ optional: if not embedded, scroll to top when searching
      if (!embedded) window.scrollTo({ top: 0, behavior: "smooth" });

      const res = await api.get("/professionals", {
        params: { q: q.trim(), city, category },
      });

      setItems(res.data.professionals || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load professionals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onKeyDown(e) {
    if (e.key === "Enter") load();
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-100"}>
      <div className={embedded ? "space-y-4" : "max-w-6xl mx-auto p-6 space-y-4"}>
        {!embedded && (
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Find Professionals</h1>
              <p className="text-sm text-gray-500">Search by name, city, category</p>
            </div>
            <Link className="text-sm underline" to="/dashboard">
              Dashboard
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border rounded-xl p-4 grid md:grid-cols-4 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Search name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <select
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            onClick={load}
            disabled={loading}
            className="bg-black text-white rounded p-2 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {items.map((p) => (
              <div key={p._id} className="bg-white border rounded-xl p-4 space-y-2">
                <img
                  src={
                    p.profilePic
                      ? `http://localhost:5000/uploads/${p.profilePic}`
                      : "/default-avatar.png"
                  }
                  className="w-full h-40 object-cover rounded"
                  alt="dp"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />

                <div className="font-bold text-lg">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.professional?.category || "-"}
                </div>
                <div className="text-sm text-gray-500">{p.city || "—"}</div>

                <Link
                  to={`/professionals/${p._id}`}
                  className="inline-block mt-2 underline font-semibold"
                >
                  View Profile
                </Link>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-gray-500">No professionals found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
