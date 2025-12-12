import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Book() {
  const { id } = useParams();
  const nav = useNavigate();
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/bookings", { professionalId: id, message });
      toast.success("Booking request sent!");
      nav("/dashboard");
    } catch {
      toast.error("Failed to send booking");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Book Professional</h2>

        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Describe your problem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="bg-black text-white w-full p-2 rounded">
          Send Request
        </button>
      </form>
    </div>
  );
}
