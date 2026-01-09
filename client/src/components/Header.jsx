// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useNotifications } from "../context/NotificationContext";
// import { useEffect, useRef, useState } from "react";



// const BASE = "http://localhost:5000";

// function NavLink({ to, children, onClick }) {
//   const { pathname } = useLocation();
//   const active = pathname === to;

//   return (
//     <Link
//       to={to}
//       onClick={onClick}
//       className={[
//         "rounded-lg px-3 py-2 text-sm font-semibold transition",
//         active
//           ? "bg-indigo-50 text-indigo-700"
//           : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
//       ].join(" ")}
//     >
//       {children}
//     </Link>
//   );
// }

// function timeAgo(iso) {
//   if (!iso) return "";
//   const t = new Date(iso).getTime();
//   const diff = Date.now() - t;
//   const s = Math.floor(diff / 1000);
//   if (s < 60) return "just now";
//   const m = Math.floor(s / 60);
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   return `${d}d ago`;
// }

// export default function Header() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const { pathname } = useLocation();

//   const { notifications, unreadCount, loading, markRead, markAllRead, refreshNotifications } =
//     useNotifications() || {};

//   const [open, setOpen] = useState(false); // profile dropdown
//   const [mobileOpen, setMobileOpen] = useState(false); // mobile nav
//   const menuRef = useRef(null);

//   // ✅ notification dropdown
//   const [notifOpen, setNotifOpen] = useState(false);
//   const notifRef = useRef(null);

//   const profileLink =
//     user?.role === "professional" ? "/pro-profile" : "/client-profile";

//   const avatarSrc = user?.profilePic
//     ? `${BASE}/uploads/${user.profilePic}`
//     : "/dp.png";

//   const isOnline = !!user;

//   async function doLogout() {
//     await logout();
//     setOpen(false);
//     setNotifOpen(false);
//     setMobileOpen(false);
//     nav("/", { replace: true });
//   }

//   useEffect(() => {
//     function onDocClick(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
//       if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
//     }
//     function onEsc(e) {
//       if (e.key === "Escape") {
//         setOpen(false);
//         setNotifOpen(false);
//         setMobileOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", onDocClick);
//     document.addEventListener("keydown", onEsc);
//     return () => {
//       document.removeEventListener("mousedown", onDocClick);
//       document.removeEventListener("keydown", onEsc);
//     };
//   }, []);

//   // close menus on route change
//   useEffect(() => {
//     setMobileOpen(false);
//     setOpen(false);
//     setNotifOpen(false);
//   }, [pathname]);

//   async function onOpenNotifications() {
//     setNotifOpen((v) => !v);
//     // load latest when opening
//     if (!notifOpen && user) {
//       await refreshNotifications?.(20);
//     }
//   }

//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
//       <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
//         {/* Brand */}
//         <Link to="/" className="flex items-center gap-2">
//           <span className="text-base font-extrabold tracking-tight text-slate-900">
//             E-Ustad
//           </span>
//         </Link>

//         {/* Desktop Nav */}
//         <nav className="hidden items-center gap-2 md:flex">
//           <NavLink to="/">Home</NavLink>
//           <NavLink to="/professionals">Professionals</NavLink>

//           {!user ? (
//             <>
//               <NavLink to="/login">Login</NavLink>

//               <Link
//                 to="/register"
//                 className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//               >
//                 Register
//               </Link>
//             </>
//           ) : (
//             <>
//               <NavLink to="/dashboard">Dashboard</NavLink>

//               {/* ✅ Notifications bell */}
//               <div className="relative ml-1" ref={notifRef}>
//                 <button
//                   type="button"
//                   onClick={onOpenNotifications}
//                   className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                   aria-label="Notifications"
//                   title="Notifications"
//                 >
//                   {/* bell icon */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
//                     <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//                   </svg>

//                   {!!unreadCount && unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-extrabold text-white">
//                       {unreadCount > 99 ? "99+" : unreadCount}
//                     </span>
//                   )}
//                 </button>

//                 {notifOpen && (
//                   <div className="absolute right-0 mt-2 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
//                     <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
//                       <div className="text-sm font-extrabold text-slate-900">
//                         Notifications
//                       </div>

//                       <button
//                         onClick={() => markAllRead?.()}
//                         className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-60"
//                         disabled={!unreadCount}
//                       >
//                         Mark all read
//                       </button>
//                     </div>

//                     <div className="max-h-[360px] overflow-auto">
//                       {loading ? (
//                         <div className="p-3 text-sm text-slate-600">Loading…</div>
//                       ) : !notifications || notifications.length === 0 ? (
//                         <div className="p-3 text-sm text-slate-600">
//                           No notifications yet.
//                         </div>
//                       ) : (
//                         <div className="divide-y divide-slate-100">
//                           {notifications.slice(0, 20).map((n) => {
//                             const unread = !n.readAt;
//                             return (
//                               <button
//                                 key={n._id}
//                                 onClick={async () => {
//                                   if (unread) await markRead?.(n._id);
//                                   setNotifOpen(false);
//                                   if (n.link) nav(n.link);
//                                 }}
//                                 className={[
//                                   "w-full text-left px-3 py-2 transition",
//                                   unread ? "bg-indigo-50/50 hover:bg-indigo-50" : "hover:bg-slate-50",
//                                 ].join(" ")}
//                               >
//                                 <div className="flex items-start justify-between gap-3">
//                                   <div className="min-w-0">
//                                     <div className="text-sm font-bold text-slate-900 line-clamp-1">
//                                       {n.title || "Notification"}
//                                     </div>
//                                     <div className="mt-0.5 text-sm text-slate-700 line-clamp-2">
//                                       {n.message || ""}
//                                     </div>
//                                   </div>

//                                   <div className="shrink-0 text-[11px] font-semibold text-slate-500">
//                                     {timeAgo(n.createdAt)}
//                                   </div>
//                                 </div>

//                                 {unread && (
//                                   <div className="mt-1 text-[11px] font-semibold text-indigo-700">
//                                     New
//                                   </div>
//                                 )}
//                               </button>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     <div className="border-t border-slate-200 px-3 py-2">
//                       <button
//                         onClick={async () => {
//                           await refreshNotifications?.(20);
//                         }}
//                         className="text-xs font-semibold text-slate-700 hover:underline"
//                       >
//                         Refresh
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Profile dropdown */}
//               <div className="relative ml-2" ref={menuRef}>
//                 <button
//                   type="button"
//                   onClick={() => setOpen((v) => !v)}
//                   className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                 >
//                   <div className="relative">
//                     <img
//                       src={avatarSrc}
//                       alt="dp"
//                       className="h-9 w-9 rounded-full object-cover border border-slate-200"
//                       onError={(e) => {
//                         e.currentTarget.src = "/dp.jpg";
//                       }}
//                     />

//                     {/* ✅ show ONLY when logged in */}
//                     {isOnline && (
//                       <span
//                         className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
//                         title="Online"
//                       />
//                     )}
//                   </div>

//                   <div className="hidden flex-col items-start leading-tight sm:flex">
//                     <span className="text-sm font-semibold text-slate-900">
//                       {user.name}
//                     </span>

//                     {/* ✅ Online only (no Offline text) */}
//                     {isOnline && (
//                       <span className="text-[11px] font-medium text-emerald-600">
//                         Online
//                       </span>
//                     )}
//                   </div>

//                   <span className="text-slate-500">▾</span>
//                 </button>

//                 {open && (
//                   <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
//                     <div className="p-2">
//                       <Link
//                         to={profileLink}
//                         onClick={() => setOpen(false)}
//                         className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
//                       >
//                         Profile
//                       </Link>

//                       <button
//                         onClick={doLogout}
//                         className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </nav>

//         {/* Mobile button */}
//         <button
//           type="button"
//           className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 md:hidden"
//           onClick={() => setMobileOpen((v) => !v)}
//           aria-label="Open menu"
//         >
//           {mobileOpen ? "✕" : "☰"}
//         </button>
//       </div>

//       {/* Mobile panel */}
//       {mobileOpen && (
//         <div className="border-t border-slate-200 bg-white/90 backdrop-blur md:hidden">
//           <div className="mx-auto max-w-6xl px-4 py-3">
//             <div className="grid gap-2">
//               <NavLink to="/" onClick={() => setMobileOpen(false)}>
//                 Home
//               </NavLink>
//               <NavLink to="/professionals" onClick={() => setMobileOpen(false)}>
//                 Professionals
//               </NavLink>

//               {!user ? (
//                 <>
//                   <NavLink to="/login" onClick={() => setMobileOpen(false)}>
//                     Login
//                   </NavLink>

//                   <Link
//                     to="/register"
//                     className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
//                   >
//                     Register
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
//                     Dashboard
//                   </NavLink>

//                   <Link
//                     to={profileLink}
//                     className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
//                   >
//                     Profile
//                   </Link>

//                   <button
//                     onClick={doLogout}
//                     className="rounded-xl bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-700 transition hover:bg-red-100"
//                   >
//                     Logout
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
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

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const {
    notifications = [],
    unreadCount = 0,
    loading,
    markRead,
    markAllRead,
    refreshNotifications,
  } = useNotifications() || {};

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const profileLink =
    user?.role === "professional" ? "/pro-profile" : "/client-profile";

  const avatarSrc = user?.profilePic
    ? `${BASE}/uploads/${user.profilePic}`
    : "/dp.png";

  async function doLogout() {
    await logout();
    setOpen(false);
    setNotifOpen(false);
    setMobileOpen(false);
    nav("/", { replace: true });
  }

  async function toggleNotifications() {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);

    if (willOpen && user) {
      await refreshNotifications?.(20);

      // ✅ bell open → unread badge remove
      if (unreadCount > 0) {
        await markAllRead?.();
      }
    }
  }

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const NotificationDropdown = (
    <div className="absolute right-0 mt-2 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-50">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-extrabold">Notifications</span>
      </div>

      <div className="max-h-[320px] overflow-auto">
        {loading ? (
          <div className="p-3 text-sm text-slate-600">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="p-3 text-sm text-slate-600">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 20).map((n) => {
            const unread = !n.readAt;

            return (
              <button
                key={n._id}
                onClick={async () => {
                  if (unread) await markRead?.(n._id);
                  setNotifOpen(false);

                  if (n.link) {
                    if (pathname === n.link) {
                      // ✅ same page → refresh
                      window.location.reload();
                    } else {
                      nav(n.link);
                    }
                  }
                }}
                className={`w-full text-left px-3 py-2 border-b hover:bg-slate-50 ${
                  unread ? "bg-indigo-50/50" : ""
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  {n.title}
                </div>
                <div className="text-sm text-slate-600">{n.message}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {timeAgo(n.createdAt)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-extrabold">
          E-Ustad
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/professionals">Professionals</NavLink>

          {user && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>

              {/* 🔔 Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative h-10 w-10 rounded-xl border flex items-center justify-center"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && NotificationDropdown}
              </div>

              {/* Profile */}
              <div className="relative" ref={menuRef}>
                <button onClick={() => setOpen(!open)}>
                  <img
                    src={avatarSrc}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-xl p-2">
                    <Link
                      to={profileLink}
                      className="block px-3 py-2"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={doLogout}
                      className="block px-3 py-2 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden border rounded-xl px-3 py-2"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <NavLink to="/" onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/professionals" onClick={() => setMobileOpen(false)}>
            Professionals
          </NavLink>

          {user && (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="flex items-center gap-2 font-semibold"
                >
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full px-2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && NotificationDropdown}
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to={profileLink}
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </NavLink>
              <button
                onClick={doLogout}
                className="text-red-600 font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
