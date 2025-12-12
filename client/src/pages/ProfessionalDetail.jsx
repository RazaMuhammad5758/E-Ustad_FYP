import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ProfessionalDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/professionals/${id}`);
        setData(res.data);
      } catch (e) {
        toast.error("Failed to load profile");
      }
    })();
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;

  const { user, professional } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex justify-between">
          <Link to="/professionals" className="underline">← Back</Link>
          <Link to="/dashboard" className="underline">Dashboard</Link>
        </div>

        <div className="bg-white border rounded-xl p-5 space-y-2">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray-600">{professional?.category || "-"}</div>
          <div className="text-sm text-gray-500">Phone: {user.phone}</div>
          <div className="text-sm text-gray-500">City: {user.city || "—"}</div>

          <div className="pt-3">
            <div className="font-semibold">Intro</div>
            <div className="text-sm text-gray-700 border rounded p-2 mt-1">
              {professional?.shortIntro || "—"}
            </div>
          </div>

          <Link
            to={`/book/${user._id}`}
            className="inline-block bg-black text-white px-4 py-2 rounded mt-4"
          >
            Book this Professional
          </Link>
        </div>
      </div>
    </div>
  );
}
