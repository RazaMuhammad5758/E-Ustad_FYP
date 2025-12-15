import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

const BASE = "http://localhost:5000";

function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        "rounded-lg px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false); // profile dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile nav
  const menuRef = useRef(null);

  const profileLink =
    user?.role === "professional" ? "/pro-profile" : "/client-profile";

  const avatarSrc = user?.profilePic
    ? `${BASE}/uploads/${user.profilePic}`
    : "/dp.png";

  const isOnline = !!user;

  async function doLogout() {
    await logout();
    setOpen(false);
    setMobileOpen(false);
    nav("/", { replace: true });
  }

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-base font-extrabold tracking-tight text-slate-900">
            E-Ustad
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/professionals">Professionals</NavLink>

          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>

              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>

              {/* Profile dropdown */}
              <div className="relative ml-2" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="relative">
                    <img
                      src={avatarSrc}
                      alt="dp"
                      className="h-9 w-9 rounded-full object-cover border border-slate-200"
                      onError={(e) => {
                        e.currentTarget.src = "/dp.jpg";
                      }}
                    />

                    {/* ✅ show ONLY when logged in */}
                    {isOnline && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
                        title="Online"
                      />
                    )}
                  </div>

                  <div className="hidden flex-col items-start leading-tight sm:flex">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>

                    {/* ✅ Online only (no Offline text) */}
                    {isOnline && (
                      <span className="text-[11px] font-medium text-emerald-600">
                        Online
                      </span>
                    )}
                  </div>

                  <span className="text-slate-500">▾</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="p-2">
                      <Link
                        to={profileLink}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Profile
                      </Link>

                      <button
                        onClick={doLogout}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Mobile button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid gap-2">
              <NavLink to="/" onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/professionals" onClick={() => setMobileOpen(false)}>
                Professionals
              </NavLink>

              {!user ? (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)}>
                    Login
                  </NavLink>

                  <Link
                    to="/register"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>

                  <Link
                    to={profileLink}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={doLogout}
                    className="rounded-xl bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
