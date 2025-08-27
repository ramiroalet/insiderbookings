"use client"
import { useEffect, useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, CalendarDays, Info, Gift, MapPin, Phone, Star, User, Home } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL
const oneDayMs = 86_400_000
const diffDays = (d1, d2) => Math.max(1, Math.ceil((new Date(d2) - new Date(d1)) / oneDayMs))

const iosStyle = {
  WebkitAppearance: "none",
  appearance: "none",
  WebkitTapHighlightColor: "transparent",
  WebkitUserSelect: "none",
  userSelect: "none",
}

const Stars = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={`transition-colors duration-200 ${
          i < Math.round(rating) ? "fill-current text-amber-400 drop-shadow-sm" : "text-gray-300"
        }`}
      />
    ))}
  </div>
)

export default function MyStay() {
  const { token, user } = useSelector((s) => s.auth)
  const navigate = useNavigate()
  const [search] = useSearchParams()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramId = search.get("id")
  const paramType = search.get("type")
  const endpoint = useMemo(() => {
    if (paramId) {
      if (paramType === "outside") return `/bookings/outside/id/${paramId}`
      return `/bookings/${paramId}`
    }
    return "/bookings/me?latest=true"
  }, [paramId, paramType])

  useEffect(() => {
    if (!token && !paramId) return
    ;(async () => {
      try {
        const { data } = await axios.get(`${API_URL}${endpoint}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        setBooking(data)
      } catch (e) {
        console.error(e)
        setError("Unable to load your reservation.")
      } finally {
        setLoading(false)
      }
    })()
  }, [endpoint, token, paramId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-600 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-300/20 border-b-red-400 rounded-full animate-spin animate-reverse" />
          </div>
          <p className="text-lg font-medium">Loading your stay…</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservation Not Found</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error || "No reservation found."}</p>
          <button
            onClick={() => navigate("/bookings")}
            style={iosStyle}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            View All Bookings
          </button>
        </div>
      </div>
    )
  }

  const {
    bookingConfirmation: confirmation,
    checkIn,
    checkOut,
    status,
    paymentStatus,
    hotel = {},
    room = {},
    guestName,
    guestLastName,
    guestEmail,
    guestPhone,
    user: bookingUser,
    addons = [],
  } = booking

  const hotelName = hotel.name ?? "—"
  const hotelId = hotel.id ?? null
  const hotelAddr = hotel.address ?? "-"
  const hotelCity = hotel.city ?? "-"
  const hotelPhone = hotel.phone ?? "-"
  const roomType = room.name ?? "—"
  const roomNumber = room.room_number ?? room.number ?? "—"
  const primaryGuest =
    guestName && guestLastName
      ? `${guestName} ${guestLastName}`
      : bookingUser?.name ?? "—"
  const contactEmail = guestEmail ?? bookingUser?.email ?? "-"
  const contactPhone = guestPhone ?? "-"
  const nights = diffDays(checkIn, checkOut)
  const ratingVal = Number(hotel.rating) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-6 max-w-7xl mx-auto pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate("/bookings")}
        style={iosStyle}
        className="flex items-center gap-3 text-gray-700 hover:text-red-500 font-semibold transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl mb-8"
      >
        <ArrowLeft size={18} />
        Back to Bookings
      </button>

      <div className="space-y-10">
        {/* Account Creation Banner */}
        {!paramId && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 flex gap-4 text-blue-900 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Account Created Automatically</h3>
              <p className="leading-relaxed">
                Your account was created automatically. Next time you visit, click <strong>"Login"</strong> and enter{" "}
                <strong>{user.email}</strong>. We'll email you a secure link so you can set a password and sign in.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="text-center">
          
          <p className="text-gray-700 text-lg font-semibold">
            Here is the summary of your {paramId ? "selected" : "upcoming"} stay.
          </p>
        </div>

        {/* Reservation Details */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <CalendarDays size={32} className="text-red-100" />
                Reservation Details
              </h2>
              <p className="text-red-100 font-semibold">Your complete booking information</p>
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Hotel Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Home size={20} className="text-blue-500" />
                  Hotel Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{hotelName}</h4>
                    {ratingVal > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Stars rating={ratingVal} size={14} />
                        <span className="text-sm font-semibold text-gray-700 bg-white/80 px-2 py-1 rounded-lg">
                          {ratingVal.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="font-medium">{hotelAddr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="font-medium">{hotelCity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-500" />
                      <span className="font-medium">{hotelPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User size={20} className="text-purple-500" />
                  Guest Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Primary Guest</p>
                    <p className="text-gray-900 font-semibold text-lg">{primaryGuest}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold">{contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Phone</p>
                    <p className="text-gray-900 font-semibold">{contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Booking Details */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border border-green-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Confirmation #</p>
                    <p className="text-gray-900 font-semibold">{confirmation ?? booking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Status</p>
                    <p className="text-gray-900 font-semibold capitalize">
                      {status} {paymentStatus ? `(${paymentStatus})` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Room Type</p>
                    <p className="text-gray-900 font-semibold">{roomType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Room Number</p>
                    <p className="text-gray-900 font-semibold">{roomNumber}</p>
                  </div>
                </div>
              </div>

              {/* Stay Dates */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 border border-amber-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Stay Dates</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Check-in</p>
                    <p className="text-gray-900 font-semibold">{checkIn}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Check-out</p>
                    <p className="text-gray-900 font-semibold">{checkOut}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Duration</p>
                    <p className="text-gray-900 font-semibold">
                      {nights} night{nights > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 border border-red-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  {hotelId && (
                    <button
                      onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
                      style={iosStyle}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      View Hotel →
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/bookings")}
                    style={iosStyle}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    All Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add-Ons */}
        {Array.isArray(addons) && addons.length > 0 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Gift size={24} className="text-amber-100" />
                  Your Add-Ons
                </h2>
                <p className="text-amber-100 font-semibold">Additional services and amenities</p>
              </div>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                      <th className="text-left px-6 py-4 font-bold text-gray-900 rounded-l-2xl">Add-On</th>
                      <th className="text-center px-6 py-4 font-bold text-gray-900">Quantity</th>
                      <th className="text-right px-6 py-4 font-bold text-gray-900 rounded-r-2xl">Total</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {addons.map((a, index) => (
                      <tr
                        key={a.bookingAddOnId ?? `${a.addOnId}-${a.optionId}-${index}`}
                        className="border-t border-gray-200/50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">{a.optionName ?? a.addOnName}</td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{a.qty}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ${(a.unitPrice * a.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
