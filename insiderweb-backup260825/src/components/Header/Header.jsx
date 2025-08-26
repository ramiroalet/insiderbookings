/* ────────────────────────────────────────────────
   src/components/Header/Header.jsx — FULL FILE
   ──────────────────────────────────────────────── */
"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import UserMenu from "../UserMenu/UserMenu.jsx"

/* Helper: track window size (used for optional desktop search-bar) */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}

const navItems = [
  { label: "Home", path: "/" },
  { label: "Hotels", path: "/hotels" },
  { label: "Perks", path: "/perks" },
  {label: "Partners Hotels", path: "/partners-hotels"}
]

const Header = () => {
    const location = useLocation()
    const isMobile = useIsMobile()
    const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo → Home */}
        <Link
          to="/"
          className="text-2xl font-bold text-red-500 transition-colors hover:text-red-600"
        >
          insider<span className="text-gray-900">bookings</span>
        </Link>

        {/* Centered navigation (desktop only) */}
          <nav className="hidden md:flex space-x-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {navItems.map(({ label, path }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={label}
                  to={path}
                  className={`${
                    active
                      ? "text-red-500"
                      : "text-gray-900 hover:text-red-500"
                  } font-medium transition-colors`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

        {/* Right-hand controls */}
        <div className="flex items-center gap-3">
          {/* Perks CTA — visible ONLY when logged in */}


          {/* User avatar / dropdown */}
          <UserMenu />

          {/* Mobile menu toggle */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={
                "p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none " +
                "focus:ring-2 focus:ring-red-500 md:hidden"
              }
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && isMobile && (
          <nav className="md:hidden border-t border-gray-200 bg-white shadow-sm">
            <ul className="flex flex-col space-y-1 p-4">
              {navItems.map(({ label, path }) => {
                const active = location.pathname === path
                return (
                  <li key={label}>
                    <Link
                      to={path}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 ${
                        active
                          ? "text-red-500"
                          : "text-gray-900 hover:text-red-500"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
      )}

      {/* Optional desktop search bar (commented) */}
      {/*
      {!isMobile && (
        <div className="border-t border-gray-100 bg-gray-50 py-3">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SearchBar />
          </div>
        </div>
      )}
      */}
    </header>
  )
}

export default Header
