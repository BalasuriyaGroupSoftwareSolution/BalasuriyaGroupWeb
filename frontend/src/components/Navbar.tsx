import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ChevronDown,
  Code2,
  FileText,
  Globe,
  HardHat,
  Leaf,
  LogOut,
  Mail,
  Menu,
  Palmtree,
  Phone,
  Plane,
  Shield,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { contactInfo } from "../data/companyProfile";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divisionsDropdown, setDivisionsDropdown] = useState(false);
  const [companyDropdown, setCompanyDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const divisionsRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (divisionsRef.current && !divisionsRef.current.contains(e.target as Node)) {
        setDivisionsDropdown(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Corporate Utility Bar */}
      <div className="hidden border-b border-white/10 bg-brand-navy py-1.5 text-[11px] text-white/80 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone className="h-3 w-3 text-brand-gold" />
              <span>{contactInfo.phone}</span>
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Mail className="h-3 w-3 text-brand-gold" />
              <span>{contactInfo.email}</span>
            </a>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1 text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Head Office: Andiambalama, Sri Lanka 🇱🇰
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-brand-gold">
              CIDA & ISO Compliant Group
            </span>
            <Link to="/portal" className="font-semibold text-white hover:text-brand-gold transition">
              Client Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/logo.jpeg"
              alt="Balasuriya Group Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-gold/60 shadow-sm"
            />
            <div>
              <span className="block font-display text-lg font-bold leading-none text-brand-navy">
                Balasuriya Group
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-steel">
                Engineering • Tourism • Software
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive ? "text-brand-navy bg-brand-surface" : "text-gray-600 hover:text-brand-navy"
                }`
              }
            >
              Home
            </NavLink>

            {/* Divisions Dropdown */}
            <div className="relative" ref={divisionsRef}>
              <button
                type="button"
                onClick={() => setDivisionsDropdown(!divisionsDropdown)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  divisionsDropdown ? "text-brand-navy bg-brand-surface" : "text-gray-600 hover:text-brand-navy"
                }`}
              >
                <span>Divisions</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${divisionsDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {divisionsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
                  >
                    <Link
                      to="/construction"
                      onClick={() => setDivisionsDropdown(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-brand-surface group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-brand-navy">Construction & Infra</span>
                        <span className="text-[11px] text-gray-500">Portfolio, live sites & estimation</span>
                      </div>
                    </Link>

                    <Link
                      to="/tourism"
                      onClick={() => setDivisionsDropdown(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-brand-surface group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition">
                        <Palmtree className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-brand-navy">StayLanka & Foreign Tours</span>
                        <span className="text-[11px] text-gray-500">Inbound island luxury & outbound packages</span>
                      </div>
                    </Link>

                    <Link
                      to="/air-ticketing"
                      onClick={() => setDivisionsDropdown(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-brand-surface group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-800 group-hover:bg-sky-800 group-hover:text-white transition">
                        <Plane className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-brand-navy">Air Ticketing & Visas</span>
                        <span className="text-[11px] text-gray-500">150+ airlines & embassy consulting</span>
                      </div>
                    </Link>

                    <Link
                      to="/software"
                      onClick={() => setDivisionsDropdown(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-brand-surface group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-800 group-hover:bg-purple-800 group-hover:text-white transition">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-brand-navy">Software Solutions</span>
                        <span className="text-[11px] text-gray-500">Cloud apps, ERP & AI automation</span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Corporate Dropdown */}
            <div className="relative" ref={companyRef}>
              <button
                type="button"
                onClick={() => setCompanyDropdown(!companyDropdown)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  companyDropdown ? "text-brand-navy bg-brand-surface" : "text-gray-600 hover:text-brand-navy"
                }`}
              >
                <span>Company</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${companyDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {companyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
                  >
                    <Link
                      to="/about"
                      onClick={() => setCompanyDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl p-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface"
                    >
                      <Users className="h-4 w-4 text-brand-steel" />
                      About & Board of Directors
                    </Link>
                    <Link
                      to="/careers"
                      onClick={() => setCompanyDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl p-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface"
                    >
                      <Sparkles className="h-4 w-4 text-brand-gold" />
                      Careers & Culture
                    </Link>
                    <Link
                      to="/sustainability"
                      onClick={() => setCompanyDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl p-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface"
                    >
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      Sustainability & ESG
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/quote"
              className={({ isActive }) =>
                `px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive ? "text-brand-navy bg-brand-surface" : "text-gray-600 hover:text-brand-navy"
                }`
              }
            >
              Request a Quote
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive ? "text-brand-navy bg-brand-surface" : "text-gray-600 hover:text-brand-navy"
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* User Account / Auth Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-brand-surface py-1 pl-1.5 pr-3 text-xs font-semibold text-brand-navy hover:border-brand-navy transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-brand-gold">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span className="rounded bg-brand-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-navy">
                    {user.role === "CUSTOMER" ? "Client" : user.role.replace(/_/g, " ")}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <span className="block text-xs font-bold text-brand-navy truncate">{user.name}</span>
                        <span className="text-[11px] text-gray-400 truncate block">{user.email}</span>
                      </div>

                      <Link
                        to="/portal"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface"
                      >
                        <FileText className="h-4 w-4 text-brand-steel" />
                        Client Portal Dashboard
                      </Link>

                      {user.role !== "CUSTOMER" && (
                        <Link
                          to="/staff"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-brand-navy hover:bg-brand-surface"
                        >
                          <Shield className="h-4 w-4 text-brand-gold" />
                          Staff Management Portal
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdown(false);
                          logout();
                          navigate("/");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl p-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-surface transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/quote"
                  className="btn-primary py-1.5 px-4 text-xs shadow-sm bg-brand-navy hover:bg-brand-steel"
                >
                  Get a Quote
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-brand-navy lg:hidden hover:bg-gray-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 bg-white lg:hidden overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-brand-navy py-1.5"
              >
                Home
              </Link>

              <div className="border-t border-gray-100 pt-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                  Divisions
                </span>
                <Link
                  to="/construction"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-gray-700"
                >
                  <Building2 className="h-4 w-4 text-brand-steel" />
                  Construction & Infrastructure
                </Link>
                <Link
                  to="/tourism"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-gray-700"
                >
                  <Palmtree className="h-4 w-4 text-emerald-700" />
                  Tourism & Tours
                </Link>
                <Link
                  to="/air-ticketing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-gray-700"
                >
                  <Plane className="h-4 w-4 text-sky-700" />
                  Air Ticketing & Visas
                </Link>
                <Link
                  to="/software"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-sm font-medium text-gray-700"
                >
                  <Code2 className="h-4 w-4 text-purple-700" />
                  Software Solutions
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                  Company
                </span>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 py-1"
                >
                  About & Leadership
                </Link>
                <Link
                  to="/careers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 py-1"
                >
                  Careers at Balasuriya Group
                </Link>
                <Link
                  to="/sustainability"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 py-1"
                >
                  Sustainability & ESG
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 py-1"
                >
                  Contact Us
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                <Link
                  to="/quote"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center text-xs py-2.5"
                >
                  Request a Quote (RFQ)
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary w-full text-center text-xs py-2.5"
                    >
                      Client Portal ({user.name})
                    </Link>
                    {user.role !== "CUSTOMER" && (
                      <Link
                        to="/staff"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-secondary w-full text-center text-xs py-2.5 border-brand-navy"
                      >
                        Staff Portal
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-red-600 font-semibold py-1.5"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center text-xs py-2.5"
                  >
                    Log In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
