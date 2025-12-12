import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
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

async function register(data) {
  try {
    const res = await api.post("/auth/register", data);
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

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
