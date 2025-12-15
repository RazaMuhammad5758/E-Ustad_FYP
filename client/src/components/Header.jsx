import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

const BASE = "http://localhost:5000";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const profileLink =
    user?.role === "professional" ? "/pro-profile" : "/client-profile";

  const avatarSrc = user?.profilePic
    ? `${BASE}/uploads/${user.profilePic}`
    : "/default-avatar.png";

  const isOnline = !!user;

  async function doLogout() {
    await logout();
    setOpen(false);
    nav("/", { replace: true });
  }

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg">
          E-Ustad
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="underline">
            Home
          </Link>

          <Link to="/professionals" className="underline">
            Professionals
          </Link>

          {!user ? (
            <>
              {/* ✅ Offline dot */}
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="text-xs">Offline</span>
              </div>

              <Link to="/login" className="underline">
                Login
              </Link>
              <Link to="/register" className="bg-black text-white px-3 py-2 rounded">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="underline">
                Dashboard
              </Link>

              {/* ✅ Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2"
                >
                  {/* avatar + status dot */}
                  <div className="relative">
                    <img
                      src={avatarSrc}
                      alt="dp"
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.png";
                      }}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </div>

                  <div className="flex flex-col leading-tight items-start">
                    <span className="font-semibold underline">{user.name}</span>
                    <span className="text-[11px] text-gray-500">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>

                  <span className="text-gray-600">▾</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow p-1 z-50">
                    <Link
                      to={profileLink}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      Profile
                    </Link>

                    <button
                      onClick={doLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
