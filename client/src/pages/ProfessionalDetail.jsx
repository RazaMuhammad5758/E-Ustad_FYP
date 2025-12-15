import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5000";

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
      await api.post("/gig-comments", { gigId, text });
      toast.success("Comment added");

      setTexts((p) => ({ ...p, [gigId]: "" }));

      const cRes = await api.get(`/gig-comments/${gigId}`);
      setComments((prev) => ({ ...prev, [gigId]: cRes.data.comments || [] }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Comment failed");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  const { user, professional } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex justify-between">
          <Link to="/" className="underline">
            Home
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="text-gray-600">{professional?.category || "-"}</div>

            <div className="text-sm text-gray-500">
              Phone: <span className="italic">Hidden until booking is accepted</span>
            </div>
          </div>

          <div>
            <div className="font-semibold">Intro</div>
            <div className="border p-2 rounded text-sm">
              {professional?.shortIntro || "-"}
            </div>
          </div>

          <div>
            <div className="font-bold">Gigs / Services</div>

            <div className="grid md:grid-cols-2 gap-3 mt-2">
              {gigs.map((g) => (
                <div key={g._id} className="border rounded p-3 space-y-2">
                  {g.image && (
                    <img
                      src={`${BASE}/uploads/${g.image}`}
                      className="w-full h-40 object-cover rounded"
                      alt="gig"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="font-semibold">{g.title}</div>
                  <div className="text-sm text-gray-600">Rs. {g.price}</div>
                  <div className="text-sm">{g.description}</div>
                  
<div className="text-xs text-gray-500">
  Comments: {(comments[g._id] || []).length}
</div>

                  <div className="pt-2 space-y-2">
                    {(comments[g._id] || []).map((c) => {
                      const dp = c.userId?.profilePic
                        ? `${BASE}/uploads/${c.userId.profilePic}`
                        : "/dp.jpg";

                      return (
                        <div key={c._id} className="flex gap-2 text-sm">
                          {/* ✅ ALWAYS show avatar */}
                          <img
                            src={dp}
                            className="w-8 h-8 rounded-full object-cover border"
                            alt="dp"
                            onError={(e) => {
                              e.currentTarget.src = "/dp.jpg";
                            }}
                          />

                          <div>
                            <div className="font-semibold">{c.userId?.name || "User"}</div>
                            <div>{c.text}</div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-2">
                      <input
                        className="border p-1 rounded w-full text-sm"
                        placeholder="Write comment..."
                        value={texts[g._id] || ""}
                        onChange={(e) =>
                          setTexts((p) => ({ ...p, [g._id]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => submitComment(g._id)}
                        className="bg-black text-white px-3 rounded text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {gigs.length === 0 && <div>No gigs yet.</div>}
            </div>
          </div>

          <Link
            to={`/book/${user._id}`}
            className="inline-block bg-black text-white px-4 py-2 rounded"
          >
            Book this Professional
          </Link>
        </div>
      </div>
    </div>
  );
}
