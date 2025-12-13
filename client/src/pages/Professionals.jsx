import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Professionals({ embedded = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/professionals", {
        params: { q, city, category },
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

  const categories = useMemo(() => {
    const s = new Set();
    items.forEach((p) => {
      if (p.professional?.category) s.add(p.professional.category);
    });
    return ["", ...Array.from(s)];
  }, [items]);

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-100"}>
      <div className={embedded ? "space-y-4" : "max-w-6xl mx-auto p-6 space-y-4"}>
        {/* Header – hide when embedded in dashboard */}
        {!embedded && (
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Find Professionals</h1>
              <p className="text-sm text-gray-500">
                Search by name, city, category
              </p>
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
          />

          <input
            className="border p-2 rounded"
            placeholder="City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories
              .filter(Boolean)
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          <button
            onClick={load}
            className="bg-black text-white rounded p-2"
          >
            Search
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {items.map((p) => (
              <div
                key={p._id}
                className="bg-white border rounded-xl p-4 space-y-2"
              >
                 {p.profilePic && (
    <img
      src={`http://localhost:5000/uploads/${p.profilePic}`}
      className="w-full h-40 object-cover rounded"
    />
  )}
                <div className="font-bold text-lg">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.professional?.category || "-"}
                </div>
                <div className="text-sm text-gray-500">
                  {p.city || "—"}
                </div>
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
