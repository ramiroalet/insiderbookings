/* ───────────────────────────────────────────────────────────────
   src/pages/Bookings.jsx   (componente COMPLETO, sin omitir líneas)
   ─ Muestra todas las reservas del usuario
   ─ Incluye nombre del hotel (hotel_name / hotelName)
   ─ Etiqueta “Finalizada” cuando booking.active === false
   ─ Añadido: confirmación y cancelación vía axios (TGX o interna)
──────────────────────────────────────────────────────────────── */

"use client"
import { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Briefcase,
  AlertCircle,
  Info,
  X,
} from "lucide-react"

import {
  fetchUserBookings,
  // cancelBooking,  // ← ya no lo usamos; dejamos la acción por si la querés mantener
  clearBookingErrors,
} from "../../features/booking/bookingSlice"

const API_URL = import.meta.env.VITE_API_URL

/* ───── estilos iOS-like (para <button>) ───── */
const iosStyle = {
  WebkitAppearance: "none",
  appearance: "none",
  WebkitTapHighlightColor: "transparent",
  WebkitUserSelect: "none",
  userSelect: "none",
}

/* ───── Componente estrellas ───── */
const Stars = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={`transition-colors duration-200 ${
          i < Math.round(rating)
            ? "fill-current text-amber-400 drop-shadow-sm"
            : "text-gray-300"
        }`}
      />
    ))}
  </div>
)

export default function Bookings() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  /* ───────── redux state ───────── */
  const { isLoggedIn, token } = useSelector((s) => s.auth) || { token: null }
  const {
    userBookings,
    userBookingsStatus,
    userBookingsError,
    // cancelStatus, cancelError, // ← del slice; ahora mostramos error local
  } = useSelector((s) => s.booking)

  /* ───────── local state ───────── */
  const [filter, setFilter] = useState("all")

  // modal de cancelación
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [cancelTarget, setCancelTarget]   = useState(null)   // { ...booking }
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelMsg, setCancelMsg]         = useState(null)   // éxito o error

  /* ───────── effects ───────── */
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    dispatch(fetchUserBookings())
  }, [isLoggedIn, dispatch, navigate])

  /* limpiar errores al desmontar */
  useEffect(() => () => dispatch(clearBookingErrors()), [dispatch])

  /* ───────── helpers ───────── */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year : "numeric",
      month: "short",
      day  : "numeric",
    })

  const now = useMemo(() => new Date(), [])
  /* filtrado según pestaña */
  const filtered = userBookings.filter((b) => {
    if (filter === "all")        return true
    if (filter === "cancelled")  return b.status === "cancelled"
    if (filter === "upcoming")   return b.status === "confirmed" && new Date(b.checkIn)  > now
    if (filter === "completed")  return b.status === "confirmed" && new Date(b.checkOut) < now
    return true
  })

  /* se puede cancelar si falta > 24 h y estado permitido */
const canCancel = (b) => {
  const s = String(b.status || "").toLowerCase()
  return s === "confirmed" || s === "pending"
}

  const goDetails = (b) => navigate(`/my-stay?type=${b.source}&id=${b.id}`)

  /* ───────── cancelar: abre modal ───────── */
  const openCancelModal = (b) => {
    setCancelMsg(null)
    setCancelTarget(b)
    setConfirmOpen(true)
  }

  console.log(cancelTarget, "cancel target")

  /* ───────── cancelar: confirma modal ─────────
     Lógica:
       - Si la reserva es TGX → obtener externalRef y llamar /api/tgx/cancel { bookingID }
         (Como en la lista no tenemos externalRef, pedimos /api/bookings/:id)
       - Si NO es TGX → PUT /api/bookings/:id/cancel
  */
  const confirmCancel = async () => {
    if (!cancelTarget) return
    setCancelLoading(true)
    setCancelMsg(null)

    try {
      // Prepara headers si usás JWT
      const cfg = {
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },

}

      // Cargamos detalles para saber si es TGX y obtener externalRef
      const { data: detail } = await axios.get(`${API_URL}/bookings/${cancelTarget.id}`, cfg)

      // Si el booking viene de TGX esperamos externalRef (bookingID del proveedor)
      const isTGX = detail?.meta && detail?.source !== "OUTSIDE" && !!detail?.meta // heurística
      const externalRef = detail?.externalRef || null

      if (isTGX && externalRef) {
        // TravelgateX cancel
        await axios.post(`${API_URL}/tgx/cancel`, { bookingID: externalRef }, cfg)
      } else {
        // Interna / Outside
        await axios.put(`${API_URL}/bookings/${cancelTarget.id}/cancel`, {}, cfg)
      }

      setCancelMsg("Booking cancelled successfully.")
      // refrescar listado
      await dispatch(fetchUserBookings())
      // cerrar modal unos ms después para que el usuario vea el mensaje
      setTimeout(() => {
        setConfirmOpen(false)
        setCancelTarget(null)
        setCancelMsg(null)
      }, 900)
    } catch (err) {
      const apiErr =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Cancellation failed"
      setCancelMsg(apiErr)
    } finally {
      setCancelLoading(false)
    }
  }

  /* ───────── render ───────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-6 max-w-7xl mx-auto pb-20">
      {/* ---------- Header ---------- */}
      <div className="flex items-center mb-10">
        <button
          onClick={() => navigate("/profile")}
          style={iosStyle}
          className="mr-6 p-3 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200/50"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          My Bookings
        </h1>
      </div>

      {/* ---------- Filter Tabs ---------- */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-2 mb-10 border border-white/50 inline-flex">
        {["all", "upcoming", "completed", "cancelled"].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={iosStyle}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
              filter === k
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* ---------- Error Messages (redux) ---------- */}
      {[userBookingsError]
        .filter(Boolean)
        .map((e, i) => (
          <div
            key={i}
            className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8 flex items-center backdrop-blur-sm"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <span className="text-red-700 font-semibold">{e}</span>
          </div>
        ))}

      {/* ---------- Loading ---------- */}
      {userBookingsStatus === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-300/20 border-b-red-400 rounded-full animate-spin animate-reverse" />
          </div>
          <p className="text-gray-600 text-lg font-semibold">
            Loading your bookings…
          </p>
        </div>
      ) : filtered.length ? (
        /* ---------- Lista de reservas ---------- */
        <div className="space-y-8">
          {filtered.map((b) => {
            const hotelName = b.hotel_name ?? b.hotelName ?? "Hotel"
            const roomName  = b.room_name  ?? b.roomName  ?? null
            const finished  = b.active === false

            return (
              <div
                key={`${b.source}-${b.id}`}
                role="button"
                onClick={() => goDetails(b)}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border border-white/50 group cursor-pointer"
              >
                <div className="lg:flex">
                  {/* ---------- Imagen ---------- */}
                  <div className="lg:w-1/3 relative">
                    <img
                      src={b.image || "/placeholder.svg?height=300&width=400"}
                      alt={hotelName}
                      className="h-64 lg:h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>

                  {/* ---------- Contenido ---------- */}
                  <div className="p-8 lg:w-2/3 lg:p-10">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold mb-3 text-gray-900 truncate group-hover:text-red-600 transition-colors duration-200">
                          {hotelName}
                        </h2>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin
                            size={16}
                            className="mr-2 text-red-500 flex-shrink-0"
                          />
                          <span className="font-medium truncate">
                            {b.location}
                          </span>
                        </div>
                        {roomName && (
                          <p className="text-gray-600 font-medium mb-3 truncate">
                            Room: {roomName}
                          </p>
                        )}
                        {/* Source Badge */}
                        {b.source === "insider" && (
                          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-sm font-bold px-4 py-2 rounded-2xl border border-blue-200/50">
                            <Info size={14} />
                            Insider Booking
                          </span>
                        )}
                      </div>

                      {/* Status & Cancel / Finished badge */}
                      <div className="flex flex-col items-end gap-3">
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ${
                            finished
                              ? "bg-gray-50 text-gray-800 border border-gray-200/50"
                              : b.status === "confirmed"
                              ? "bg-green-50 text-green-800 border border-green-200/50"
                              : b.status === "pending"
                              ? "bg-amber-50 text-amber-800 border border-amber-200/50"
                              : b.status === "cancelled"
                              ? "bg-red-50 text-red-800 border border-red-200/50"
                              : "bg-gray-50 text-gray-800 border border-gray-200/50"
                          }`}
                        >
                          {finished ? "Finalizada" : b.status[0].toUpperCase() + b.status.slice(1)}
                        </div>

                        {canCancel(b) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openCancelModal(b)
                            }}
                            disabled={cancelLoading && cancelTarget?.id === b.id}
                            style={iosStyle}
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-xl transition-all duration-200"
                          >
                            {cancelLoading && cancelTarget?.id === b.id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
                        <p className="text-xs text-gray-500 font-bold mb-2">
                          Check-in
                        </p>
                        <div className="flex items-center text-gray-900">
                          <Calendar
                            size={16}
                            className="mr-2 text-red-500"
                          />
                          <span className="font-semibold">
                            {formatDate(b.checkIn)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
                        <p className="text-xs text-gray-500 font-bold mb-2">
                          Check-out
                        </p>
                        <div className="flex items-center text-gray-900">
                          <Calendar
                            size={16}
                            className="mr-2 text-red-500"
                          />
                          <span className="font-semibold">
                            {formatDate(b.checkOut)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating (si completado) */}
                    {b.status === "completed" && b.rating && (
                      <div className="flex items-center mb-6 bg-amber-50 rounded-2xl px-4 py-3 border border-amber-200/50">
                        <Star
                          size={16}
                          className="text-amber-500 fill-amber-500 mr-2"
                        />
                        <span className="font-semibold text-amber-800">
                          Rated {b.rating}/5
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="text-gray-500">
                        <span className="text-sm font-medium">
                          Booking ID: {b.id}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          goDetails(b)
                        }}
                        style={iosStyle}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {b.status === "completed" ? "Book Again" : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ---------- No results ---------- */
        <div className="text-center py-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200/50">
              <Briefcase size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {filter === "all"
                ? "You haven't made any bookings yet."
                : `You don't have any ${filter} bookings.`}
            </p>
            <button
              onClick={() => navigate("/")}
              style={iosStyle}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start exploring
            </button>
          </div>
        </div>
      )}

      {/* ---------- Modal de confirmación ---------- */}
      {confirmOpen && cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => !cancelLoading && setConfirmOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel booking</h3>
              <button
                onClick={() => !cancelLoading && setConfirmOpen(false)}
                style={iosStyle}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                disabled={cancelLoading}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel your booking at{" "}
              <span className="font-semibold">{cancelTarget.hotel_name ?? cancelTarget.hotelName ?? "this hotel"}</span>{" "}
              (check-in {formatDate(cancelTarget.checkIn)})?
            </p>

            {cancelMsg && (
              <div
                className={`mb-4 text-sm font-semibold ${
                  /successfully|ok/i.test(cancelMsg) ? "text-green-700" : "text-red-700"
                }`}
              >
                {cancelMsg}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                style={iosStyle}
                className="px-4 py-2 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
                disabled={cancelLoading}
              >
                Keep booking
              </button>
              <button
                onClick={confirmCancel}
                style={iosStyle}
                className="px-4 py-2 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
