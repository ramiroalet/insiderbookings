/* ────────────────────────────────────────────────
   src/components/Navigation/Navigation.jsx — FULL FILE
   ──────────────────────────────────────────────── */
"use client"

import { useState, useEffect }   from "react"
import { NavLink, useNavigate }  from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  Home,
  Percent,
  MapPin,
  Clock,
  UserIcon,
  LogOut,
  Menu,
  X,
  Mail,
} from "lucide-react"
import { logout, showAuthModal } from "../../features/auth/authSlice"

// Prevent iOS tap highlight & selection
const iosStyle = {
  WebkitAppearance:   "none",
  appearance:          "none",
  WebkitTapHighlightColor: "transparent",
  WebkitTouchCallout:  "none",
  WebkitUserSelect:   "none",
  userSelect:         "none",
  touchAction:        "manipulation",
  transform:          "translateZ(0)",
  WebkitTransform:    "translateZ(0)",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
}

export default function Navigation() {
  // Track mobile vs desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, user }    = useSelector((s) => s.auth)
  const dispatch                = useDispatch()
  const navigate                = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1023
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleProtectedLink = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault()
      dispatch(showAuthModal(path))
    }
  }
  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
    setMenuOpen(false)
  }

  // Navigation links
  const navLinks = [
    { path: "/",         label: "Home",   icon: Home    },
    { path: "/discount", label: "Discount Code", icon: Percent },
    { path: "/hotels",   label: "Hotels", icon: MapPin  },
    { path: "/add-ons",  label: "Add‑Ons", icon: Clock   },
  ]
  if (user?.role === 1) {
    navLinks.push({ path: "/contact-email", label: "Contact", icon: Mail })
  }

  // Mobile header & menu
  const mobileHeader = (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 bg-yellow-500 text-white shadow-md z-50"
      style={{
        ...iosStyle,
        background: "linear-gradient(to right, #eab308, #ca8a04)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 h-12">
        <h2 className="text-lg font-bold">Insider Bookings</h2>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{ ...iosStyle, minWidth: "40px", minHeight: "40px" }}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          {menuOpen
            ? <X size={20} />
            : <Menu size={20} />
          }
        </button>
      </div>
      {menuOpen && (
        <nav
          className="flex flex-col gap-1 px-2 pb-2"
          style={{
            ...iosStyle,
            background: "linear-gradient(to right, #eab308, #ca8a04)",
          }}
        >
          {navLinks.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={(e) => {
                handleProtectedLink(e, path)
                setMenuOpen(false)
              }}
              style={iosStyle}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-white/20 font-medium"
                    : "hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="mt-2 border-t border-white/30 pt-2">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile")
                    setMenuOpen(false)
                  }}
                  style={iosStyle}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  <UserIcon size={18} />
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  style={iosStyle}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                style={iosStyle}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                <UserIcon size={18} />
                <span>Login</span>
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )

  // Desktop nav (simple horizontal)
  const desktopNav = (
    <nav className="hidden lg:flex items-center gap-6 text-gray-700">
      {navLinks.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={(e) => handleProtectedLink(e, path)}
          className={({ isActive }) =>
            `flex items-center gap-1 py-2 px-3 rounded-md text-sm transition-colors ${
              isActive ? "text-yellow-600 font-semibold" : "hover:text-yellow-600"
            }`
          }
        >
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 py-2 px-3 rounded-md text-sm hover:text-yellow-600 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      )}
      {!isLoggedIn && (
        <NavLink
          to="/login"
          className="flex items-center gap-1 py-2 px-3 rounded-md text-sm text-yellow-600 font-semibold hover:bg-yellow-100 transition-colors"
        >
          <UserIcon size={16} />
          <span>Login</span>
        </NavLink>
      )}
    </nav>
  )

  return (
    <>
      {isMobile ? mobileHeader : (
        <header className="sticky top-0 bg-white border-b border-gray-200 z-40 shadow-sm">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
            <h2 className="text-xl font-bold text-yellow-600">Insider Bookings</h2>
            {desktopNav}
          </div>
        </header>
      )}
    </>
  )
}
