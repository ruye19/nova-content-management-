import { NavLink } from "react-router-dom";
import { FiEdit3, FiHome, FiImage, FiLogOut, FiUsers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const baseLinks = [
  { label: "Overview", to: "/", icon: FiHome },
  { label: "New Draft", to: "/editor", icon: FiEdit3 },
  { label: "Media", to: "/media", icon: FiImage },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const links = [...baseLinks];
  if (user?.role === "admin") {
    links.push({ label: "Admin", to: "/admin", icon: FiUsers });
    links.push({ label: "Menus", to: "/menus", icon: FiUsers });
  }

  return (
    <aside className="relative hidden w-72 shrink-0 border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white lg:flex">
      <div className="flex h-full w-full flex-col">
        <div className="px-8 pb-8 pt-12">
          <p className="text-xs uppercase tracking-[0.4em] text-brand.highlight">Nova</p>
          <p className="text-2xl font-semibold">Content Studio</p>
          <p className="mt-1 text-sm text-brand.fog">Plan, draft, and publish.</p>
        </div>
        <nav className="flex-1 px-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-glass"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <link.icon className="text-lg" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-8 py-8">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">{user?.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <FiLogOut /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
