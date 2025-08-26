"use client"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Sparkles, Building2, Briefcase, MailCheck, ArrowLeft } from "lucide-react"
import { showAuthModal } from "../../features/auth/authSlice"

const API_URL = import.meta.env.VITE_API_URL
const MAIN_EMAIL = import.meta.env.VITE_MAIN_EMAIL || "team@insiderbookings.com"

const cards = [
  {
    key: "INFLUENCER",
    code: 2,
    title: "Influencer",
    icon: Sparkles,
    blurb:
      "Earn commissions by promoting our hotels and perks to your audience. We provide custom links, unique perks and periodic bonus campaigns.",
  },
  {
    key: "CORPORATE",
    code: 3,
    title: "Corporate",
    icon: Building2,
    blurb:
      "Unlock negotiated rates, centralized billing and simple reporting for your company’s travel. Ideal for teams that book frequently.",
  },
  {
    key: "AGENCY",
    code: 4,
    title: "Agency",
    icon: Briefcase,
    blurb:
      "Book on behalf of clients with access to agency tools, aggregated perks and dedicated support for premium itineraries.",
  },
]

export default function BecomePartner() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoggedIn, user } = useSelector((s) => s.auth)
  const [loadingKey, setLoadingKey] = useState("")
  const [message, setMessage] = useState("")

  const sendRequest = async (roleKey, roleCode) => {
    if (!isLoggedIn) {
      dispatch(showAuthModal({ mode: "login" }))
      return
    }
    setMessage("")
    setLoadingKey(roleKey)
    try {
      // Backend endpoint — ajusta la ruta si usas otra.
      await axios.post(`${API_URL}/users/request-info`, {
        requestedRoleKey: roleKey,   // "INFLUENCER" | "CORPORATE" | "AGENCY"
        requestedRole: roleCode,     // 2 | 3 | 4
        userId: user?.id ?? null,
        name: user?.name ?? "",
        email: user?.email ?? "",
      })

      setMessage("Thank you! You will receive information from our team shortly.")
    } catch (err) {
      // Fallback a mailto por si el backend no está listo:
      const subject = encodeURIComponent(`Partner Information Request — ${roleKey}`)
      const body = encodeURIComponent(
        `Hi team,\n\nPlease contact me with more information about the ${roleKey.toLowerCase()} program.\n\nName: ${user?.name || ""}\nEmail: ${user?.email || ""}\nUser ID: ${user?.id || "-"}\n\nThanks!`
      )
      window.location.href = `mailto:${MAIN_EMAIL}?subject=${subject}&body=${body}`
      setMessage("Thank you! You will receive information from our team shortly.")
    } finally {
      setLoadingKey("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 font-semibold bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Partner with Insiderbookings
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Choose the program that fits your goals. Tell us who you are and we’ll reach out with the next steps.
        </p>
        {message && (
          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded-xl">
            <MailCheck size={18} />
            <span className="font-semibold">{message}</span>
          </div>
        )}
      </header>

      {/* Cards */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ key, code, title, icon: Icon, blurb }) => (
            <div
              key={key}
              className="group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{title} Program</h3>
                </div>
              </div>

              <p className="mt-4 text-gray-600 leading-relaxed flex-1">{blurb}</p>

              <button
                onClick={() => sendRequest(key, code)}
                disabled={loadingKey === key || !isLoggedIn}
                className={`mt-6 inline-flex items-center justify-center font-bold rounded-2xl px-5 py-3
                  ${loadingKey === key
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"}
                `}
                aria-disabled={loadingKey === key || !isLoggedIn}
                title={isLoggedIn ? "Request more information" : "Please sign in first"}
              >
                {loadingKey === key ? "Sending…" : "Request more information"}
              </button>
            </div>
          ))}
        </div>

        {!isLoggedIn && (
          <div className="mt-8 text-center">
            <p className="text-gray-700 font-medium">
              Please sign in to request partner information.
            </p>
            <button
              onClick={() => dispatch(showAuthModal({ mode: "login" }))}
              className="mt-3 inline-flex items-center justify-center font-bold rounded-2xl px-5 py-3 bg-white border border-gray-300 hover:border-gray-400 shadow-sm"
            >
              Sign in
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
