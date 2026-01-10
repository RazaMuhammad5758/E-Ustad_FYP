import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user || null);
      return res.data.user || null;
    } catch (err) {
  if (err?.response?.status === 401) {
    // ✅ Not logged in / token expired → silently clear user
    setUser(null);
    return;
  }
  console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function login(data) {
    try {
      const res = await api.post("/auth/login", data);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      throw new Error(msg);
    }
  }

  async function registerClient(payload) {
    try {
      const res = await api.post("/auth/register/client", payload);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err?.response?.data?.message || "Register failed";
      throw new Error(msg);
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  async function refreshMe() {
    // optional: setLoading true if you want spinner each refresh
    return await fetchMe();
  }

  async function updateMyProfile(payload) {
    try {
      const isFormData = payload instanceof FormData;

      const res = await api.put("/auth/me", payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });

      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err?.response?.data?.message || "Update profile failed";
      throw new Error(msg);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // ✅ keep (useful if needed)
        loading,
        login,
        logout,
        registerClient,
        refreshMe,
        updateMyProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
