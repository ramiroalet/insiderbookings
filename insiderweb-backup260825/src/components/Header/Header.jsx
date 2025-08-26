/* ────────────────────────────────────────────────
   src/components/Header/Header.jsx — FULL FILE
   ──────────────────────────────────────────────── */
"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import UserMenu from "../UserMenu/UserMenu.jsx"

/* Helper: track window size (used for optional desktop search-bar) */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  )
  if (typeof window !== "undefined") {
    window.onresize = () => setIsMobile(window.innerWidth < 768)
  }
  return isMobile
}

const navItems = [
  { label: "Home", path: "/" },
  { label: "Hotels", path: "/hotels" },
  { label: "Perks", path: "/perks" },
  {label: "Partners Hotels", path: "/partners-hotels"}
]

const Header = () => {
  const isMobile = useIsMobile()
  const { isLoggedIn } = useSelector((s) => s.auth)

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
          {navItems.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="font-medium text-gray-900 transition-colors hover:text-red-500"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right-hand controls */}
        <div className="flex items-center gap-3">
          {/* Perks CTA — visible ONLY when logged in */}
      

          {/* User avatar / dropdown */}
          <UserMenu />
        </div>
      </div>

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
