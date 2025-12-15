import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BASE = "http://localhost:5000";

export default function ClientProfile() {
  const { user, refreshMe, updateMyProfile } = useAuth();

  const [loading, setLoading] = useState(true);
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
  });

  const [profilePic, setProfilePic] = useState(null);

  // ✅ Load latest user into context + hydrate form
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await refreshMe(); // calls /auth/me internally
        if (u) {
          setForm({
            name: u?.name || "",
            phone: u?.phone || "",
            city: u?.city || "",
            address: u?.address || "",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.phone.trim()) return toast.error("Phone required");

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone", form.phone.trim());
      fd.append("city", form.city || "");
      fd.append("address", form.address || "");
      if (profilePic) fd.append("profilePic", profilePic);

      // ✅ updates backend + updates AuthContext user
      const updated = await updateMyProfile(fd);

      toast.success("Profile updated");
      setEdit(false);
      setProfilePic(null);

      // ✅ keep form synced after save
      setForm({
        name: updated?.name || "",
        phone: updated?.phone || "",
        city: updated?.city || "",
        address: updated?.address || "",
      });
    } catch (e) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Not found</div>;

  const currentPic = user.profilePic ? `${BASE}/uploads/${user.profilePic}` : "";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Link to="/dashboard" className="underline text-sm">
            Dashboard
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-5 grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {!edit ? (
              <>
                <div className="font-bold text-lg">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm">Phone: {user.phone}</div>
                <div className="text-sm">City: {user.city || "-"}</div>
                <div className="text-sm">Address: {user.address || "-"}</div>

                <button
                  onClick={() => setEdit(true)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">Edit Profile</div>

                <input
                  className="border p-2 rounded w-full"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="border p-2 rounded w-full"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <select
                  className="border p-2 rounded w-full"
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
                  className="border p-2 rounded w-full"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />

                <div className="text-sm">
                  <div className="font-semibold mb-1">Profile Picture</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  />
                  <div className="text-xs text-gray-500 mt-1">
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
                      setForm({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        city: user?.city || "",
                        address: user?.address || "",
                      });
                    }}
                    className="border rounded px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            {user.profilePic ? (
              <img
                src={currentPic}
                className="w-full h-56 object-cover rounded border"
                alt="dp"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=User&background=random";
                }}
              />
            ) : (
              <div className="h-56 border rounded flex items-center justify-center text-gray-500">
                No profile picture
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
