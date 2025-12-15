import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Book() {
  const { id } = useParams();
  const nav = useNavigate();

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!message.trim() && !attachment) {
      return toast.error("Please write description or upload a picture");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("professionalId", id);
      fd.append("message", message || "");
      if (attachment) fd.append("attachment", attachment); // ✅ file key

      await api.post("/bookings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Booking request sent!");
      nav("/my-bookings");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Book Professional</h2>

        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Describe your problem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* ✅ Picture upload */}
        <div className="text-sm space-y-1">
          <div className="font-semibold">Upload Picture (optional)</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
          {attachment && (
            <div className="text-xs text-gray-500">
              Selected: {attachment.name}
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className="bg-black text-white w-full p-2 rounded disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
