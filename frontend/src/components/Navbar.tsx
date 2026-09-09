import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/construction", label: "Construction" },
  { to: "/tourism", label: "Tourism" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            whileHover={{ rotate: -6, scale: 1.05 }}
            src="/logo.jpeg"
            alt="Balasuriya Group"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-gold/60"
          />
          <span className="font-display text-lg font-bold text-brand-navy">Balasuriya Group</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative text-sm font-medium transition hover:text-brand-steel ${
                  isActive ? "text-brand-navy" : "text-gray-600"
                }`
              }
              end={l.to === "/"}
            >
              {({ isActive }) => (
                <span className="relative pb-1">
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand-gold"
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role !== "CUSTOMER" && (
                <Link to="/staff" className="btn-secondary py-1.5 text-xs">
                  Staff Portal
                </Link>
              )}
              <button onClick={logout} className="text-sm text-gray-500 hover:text-brand-navy">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-navy">
                Log in
              </Link>
              <Link to="/register" className="btn-primary py-1.5 text-xs">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
