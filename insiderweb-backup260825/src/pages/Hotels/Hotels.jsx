/* ────────────────────────────────────────────────
   src/pages/Home.jsx — 100 % COMPLETE, NO LINES OMITTED
   ──────────────────────────────────────────────── */
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchHotels } from "../../features/hotel/hotelSlice.js"
import SearchBar from "../../components/SearchBar/SearchBar.jsx"
import HotelSlider from "../../components/HotelSlider/Hotel-slider.jsx"
import AuthModal from "../../components/AuthModal/AuthModal.jsx"
import {
  Shield,
  Calendar,
  HeadphonesIcon,
  Mail,
  CheckCircle,
  Loader2,
  User,
  Search,
  Heart,
  Percent,
  Sparkles,
} from "lucide-react"

/* ─── helper: lowest room price ─────────────────── */
const getBasePrice = (hotel) => {
  if (hotel.Rooms?.length) return Math.min(...hotel.Rooms.map((r) => Number(r.price)))
  return Number(hotel.price) || null
}

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, list } = useSelector((s) => s.hotel)

  /* Newsletter */
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  /* UI */
  const [activeTab, setActiveTab] = useState("discover")
  const [isMobile, setIsMobile] = useState(false)

  /* ─── LOAD HOTELS ───────────────────────────────── */
  useEffect(() => {
    if (status === "idle") dispatch(fetchHotels())
  }, [dispatch, status])

  /* ─── HANDLE MOBILE BREAKPOINT ──────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* ─── list enriched with basePrice ─────────────── */
  const enriched = list?.map((h) => ({ ...h, basePrice: getBasePrice(h) })) || []

  /* ─── group by category / location ─────────────── */
  const groupHotelsByCategory = (hotels) => {
    if (!hotels.length) return {}
    return hotels.reduce((acc, hotel) => {
      let category = hotel.category || "regular"
      switch (category) {
        case "featured":
          category = "Most-Popular Stays"
          break
        case "featured2":
          category = "South Beach Boutique Hotels"
          break
        case "featured3":
          category = "Family Suites with Kitchenettes"
          break
        case "featured4":
          category = "Unique Experiences"
          break
        default: {
          let area = hotel.location || hotel.city || "Miami Beach"
          if (area.includes("South Beach"))       area = "Available in South Beach"
          else if (area.includes("North Beach"))  area = "Available in North Beach"
          else if (area.includes("Mid-Beach"))    area = "Available in Mid-Beach"
          else if (area.includes("Hollywood"))    area = "Available in Hollywood Beach"
          else                                    area = "Available in Miami Beach"
          category = area
        }
      }
      if (!acc[category]) acc[category] = []
      acc[category].push(hotel)
      return acc
    }, {})
  }

  const hotelGroups = groupHotelsByCategory(enriched)

  /* ─── newsletter submit ────────────────────────── */
  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return alert("Please enter a valid email address")
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail("")
      setTimeout(() => setIsSubmitted(false), 5000)
    }, 1000)
  }

  /* ─── navigate to discount page ────────────────── */
  const handleDiscountClick = () => {
    navigate("/discount")
  }

  /* ──────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen bg-white ${isMobile ? "pb-20" : ""}`}>
      {/* ── AUTH MODAL ─────────────────────────────── */}
      <AuthModal />

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">{/* ← pb‑6 */}
          <div className="mx-auto max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ── DISCOUNT PROMO CARD ────────────────────── */}
      <section className="mx-auto -mt-6 max-w-md px-3 py-0 sm:-mt-8 sm:px-4">{/* ← -mt */}
        <div
          onClick={handleDiscountClick}
          className="
            group relative cursor-pointer overflow-hidden rounded-lg
            bg-gradient-to-r from-blue-500 to-blue-600 p-3 shadow
            transition-transform duration-300 hover:scale-[1.03] hover:shadow-md
          "
        >
          {/* Resplandor suave al hacer hover */}
          <div
            className="
              pointer-events-none absolute inset-0 rounded-lg
              bg-blue-400 opacity-0 transition-opacity duration-500
              group-hover:opacity-15
            "
          />

          {/* Círculos decorativos mínimos */}
          <div className="pointer-events-none absolute -right-2 -top-2 h-10 w-10 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5" />

          {/* Contenido */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Percent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white leading-none">
                  Have a code?
                </h3>
                <p className="text-blue-100 text-xs leading-tight">
                  Unlock exclusive offers
                </p>
              </div>
            </div>

            {/* CTA en pantallas ≥ sm */}
            <div className="hidden sm:flex items-center space-x-1">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span
                className="
                  text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm
                  transition-colors duration-300 group-hover:bg-white/30
                "
              >
                Unlock →
              </span>
            </div>
          </div>

          {/* CTA móvil */}
          <div className="sm:hidden mt-2 text-center">
            <span
              className="
                inline-flex items-center space-x-1 text-xs font-semibold text-white
                bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm
                transition-colors duration-300 group-hover:bg-white/30
              "
            >
              <Sparkles className="h-3 w-3 text-yellow-300" />
              <span>Unlock</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── HOTEL SECTIONS ─────────────────────────── */}
      <section className="mx-auto max-w-7xl py-2">
        {status === "loading" ? (
          <div className="flex flex-col items-center p-8 text-gray-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            <p>Loading hotels…</p>
          </div>
        ) : (
          <>
            {Object.entries(hotelGroups)
              .sort(([a], [b]) => {
                const order = {
                  "Most-Popular Stays": 1,
                  "South Beach Boutique Hotels": 2,
                  "Family Suites with Kitchenettes": 3,
                  "Unique Experiences": 4,
                  "Available in South Beach": 5,
                  "Available in North Beach": 6,
                  "Available in Mid-Beach": 7,
                  "Available in Hollywood Beach": 8,
                }
                return (order[a] || 999) - (order[b] || 999)
              })
              .map(([cat, hotels]) => (
                <HotelSlider key={cat} title={cat} hotels={hotels} showArrow />
              ))}
            {Object.keys(hotelGroups).length === 0 && enriched.length > 0 && (
              <HotelSlider title="All Available Stays" hotels={enriched} showArrow />
            )}
          </>
        )}
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: <Shield className="h-8 w-8 text-red-600" />,
              title: "Best-Price Guarantee",
              text: "Find a lower price? We’ll refund the difference and give you an extra 10 % off.",
            },
            {
              icon: <Calendar className="h-8 w-8 text-red-600" />,
              title: "Free Cancellation",
              text: "Plans change. Most bookings can be cancelled for free up to 24 hours before arrival.",
            },
            {
              icon: <HeadphonesIcon className="h-8 w-8 text-red-600" />,
              title: "24 / 7 Support",
              text: "Talk to our support team anytime, in more than 30 languages.",
            },
          ].map(({ icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                {icon}
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────── */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Join Insider Bookings Today</h2>
          <p className="mb-8 text-lg text-red-100">
            Subscribe for exclusive deals, travel tips, and more!
          </p>
          {isSubmitted ? (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-green-500 p-4 text-white animate-in slide-in-from-bottom-2 fade-in duration-300">
              <CheckCircle className="h-5 w-5" />
              <span>Thank you! You’re now subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full px-6 py-4 text-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/30"
                  disabled={isSubmitting}
                  required
                />
                <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-4 font-semibold text-red-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 text-2xl font-bold text-red-500">
            insider<span className="text-gray-900">bookings</span>
          </div>
          <p className="mb-6 text-gray-600">© {new Date().getFullYear()} Insider Bookings. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            {["Terms of Service", "Privacy Policy", "Support"].map((link) => (
              <a key={link} href="#" className="text-gray-600 transition-colors hover:text-red-500">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── BOTTOM NAV (MOBILE) ───────────────────── */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-around py-2">
            {[
              { id: "discover",  icon: Search, label: "Discover" },
              { id: "favorites", icon: Heart,  label: "Favorites" },
              { id: "profile",   icon: User,   label: "Sign in"  },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center px-4 py-2 ${activeTab === id ? "text-red-500" : "text-gray-500"}`}
              >
                <Icon className="mb-1 h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

export default Home
