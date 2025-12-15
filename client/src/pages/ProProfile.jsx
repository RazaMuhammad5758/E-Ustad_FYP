import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants/categories";
import { useAuth } from "../context/AuthContext";

const BASE = "http://localhost:5000";

export default function ProProfile() {
  const { updateMyProfile, refreshMe } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [gigComments, setGigComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    category: "",
    shortIntro: "",
  });

  const [profilePic, setProfilePic] = useState(null);

  function hydrate(resData) {
    const u = resData?.user || {};
    const p = resData?.professional || {};
    setForm({
      name: u.name || "",
      phone: u.phone || "",
      city: u.city || "",
      address: u.address || "",
      category: p.category || "",
      shortIntro: p.shortIntro || "",
    });
  }

  async function load() {
    try {
      setLoading(true);

      const res = await api.get("/professional/me");
      setData(res.data);
      hydrate(res.data);

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

  async function saveProfile() {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.phone.trim()) return toast.error("Phone required");
    if (!form.city) return toast.error("City required");
    if (!form.category) return toast.error("Category required");

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("city", form.city);
      fd.append("address", form.address || "");
      fd.append("category", form.category);
      fd.append("shortIntro", form.shortIntro || "");
      if (profilePic) fd.append("profilePic", profilePic);

      // ✅ updates backend + updates AuthContext user instantly
      await updateMyProfile(fd);
      await refreshMe();

      toast.success("Profile updated");
      setEdit(false);
      setProfilePic(null);

      await load();
    } catch (e) {
      toast.error(e?.message || e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
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
            {!edit ? (
              <>
                <div className="font-bold text-lg">{user?.name}</div>
                <div className="text-sm text-gray-600">{professional?.category || "-"}</div>
                <div className="text-sm">Email: {user?.email}</div>
                <div className="text-sm">Phone: {user?.phone}</div>
                <div className="text-sm">City: {user?.city || "-"}</div>
                <div className="text-sm">Address: {user?.address || "-"}</div>

                <div className="text-sm">
                  <b>Intro:</b>
                  <div className="border rounded p-2 mt-1">
                    {professional?.shortIntro || "-"}
                  </div>
                </div>

                <button
                  onClick={() => setEdit(true)}
                  className="mt-2 border rounded px-3 py-2 text-sm"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">Edit Profile</div>

                <div className="grid md:grid-cols-2 gap-2">
                  <input
                    className="border p-2 rounded"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />

                  <input
                    className="border p-2 rounded"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />

                  {/* ✅ City dropdown */}
                  <select
                    className="border p-2 rounded"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  >
                    <option value="">Select City</option>
                    {CITIES.filter(Boolean).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    className="border p-2 rounded"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />

                  {/* ✅ Category dropdown (single source) */}
                  <select
                    className="border p-2 rounded md:col-span-2"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="border p-2 rounded w-full"
                  rows={3}
                  placeholder="Short intro"
                  value={form.shortIntro}
                  onChange={(e) => setForm({ ...form, shortIntro: e.target.value })}
                />

                <div className="text-sm space-y-1">
                  <div className="font-semibold">Profile Picture</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  />
                  <div className="text-xs text-gray-500">
                    (Optional) If you don’t select a file, old picture stays.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      setEdit(false);
                      setProfilePic(null);
                      hydrate(data); // ✅ reset fields back to current
                    }}
                    className="border rounded px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Registration details view */}
            {!edit && (
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
            )}
          </div>

          <div className="space-y-2">
            {user?.profilePic ? (
              <img
                className="w-full h-56 object-cover rounded border"
                src={`${BASE}/uploads/${user.profilePic}`}
                alt="profile"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            ) : (
              <img
                className="w-full h-56 object-cover rounded border"
                src="/default-avatar.png"
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
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}

              <div className="text-sm">{g.description || "-"}</div>

              {/* Comments */}
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold mb-2">Comments</div>

                {(gigComments[g._id] || []).map((c) => (
                  <div key={c._id} className="flex gap-2 text-sm mb-2">
                    {c.userId?.profilePic ? (
                      <img
                        src={`${BASE}/uploads/${c.userId.profilePic}`}
                        className="w-8 h-8 rounded-full object-cover"
                        alt="user"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <img
                        src="/default-avatar.png"
                        className="w-8 h-8 rounded-full object-cover"
                        alt="user"
                      />
                    )}

                    <div>
                      <div className="font-semibold">{c.userId?.name || "User"}</div>
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
