import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
const notificationAudio = new Audio("/notify1.wav");
notificationAudio.volume = 0.6;

const NotificationContext = createContext(null);

const SOCKET_URL = "http://localhost:5000";

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const socketRef = useRef(null);

  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function refreshNotifications(limit = 20) {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get("/notifications", { params: { limit } });
      setItems(res.data.notifications || []);
      setUnreadCount(Number(res.data.unreadCount || 0));
    } catch (e) {
      // silently ignore (no toast spam)
      // console.log("notifications load failed", e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    if (!id) return;
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, Number(c) - 1));
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await api.post("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }

  // ✅ connect socket only when user logged in
  useEffect(() => {
    if (!user) {
      // cleanup
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setItems([]);
      setUnreadCount(0);
      return;
    }

    // initial fetch
    refreshNotifications();

    // connect socket
    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = s;

    s.on("connect", () => {
      // console.log("socket connected", s.id);
    });

    s.on("connect_error", (err) => {
      // console.log("socket error", err?.message);
    });

    // ✅ when backend emits notification
    s.on("notification:new", (payload) => {
        
  if (!payload?._id) return;

  setItems((prev) => [payload, ...prev].slice(0, 30));
  setUnreadCount((c) => Number(c) + 1);

  // 🔔 play sound
  try {
    notificationAudio.currentTime = 0;
    notificationAudio.play();
  } catch (e) {
    // browser blocked autoplay — ignore silently
  }
});


    return () => {
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const value = useMemo(
    () => ({
      notifications: items,
      unreadCount,
      loading,
      refreshNotifications,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, loading]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
