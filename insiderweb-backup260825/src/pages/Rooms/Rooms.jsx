// ───────────────────────────────────────────────────────────────
// src/pages/Rooms.jsx   (versión completa, sin omitir NINGUNA línea)
// ───────────────────────────────────────────────────────────────

/* eslint-disable react/prop-types */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  Coffee,
  Tv,
  Bath,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  Grid3X3,
  List,
  Users,
  Bed,
  Maximize,
  ImageIcon,
  Share2,
  Heart,
  Filter,
  SortAsc,
  Crown,
  Shield,
  Loader2,
} from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"
import { fetchRooms } from "../../features/room/roomSlice"
import {
  fetchHotels, // 🔥 se añade para cargar hoteles si no existen
  selectHotel,
} from "../../features/hotel/hotelSlice"
import {
  setCheckIn,
  setCheckOut,
  setBookingRoom,
} from "../../features/booking/bookingSlice"
import RoomCard from "../../components/RoomCard/RoomCard"
import SearchBar from "../../components/SearchBar/SearchBar"

/* ───────── helpers ───────── */
const API_URL = import.meta.env.VITE_API_URL
const toIso10AM = (d) => `${d.toISOString().split("T")[0]}T10:00:00`

const iosStyle = {
  WebkitAppearance: "none",
  appearance: "none",
  WebkitTapHighlightColor: "transparent",
  WebkitUserSelect: "none",
  userSelect: "none",
}

/* Detecta suites de forma robusta (name/type/category/suite flag) */
const isSuite = (r = {}) => {
  if (typeof r.suite === "boolean") return r.suite
  const t = String(r.type || r.category || "").toLowerCase()
  if (t) return /(suite|junior|executive|presidential)/i.test(t)
  return /(suite)/i.test(String(r.name || ""))
}

/* ───────── AmenityIcon & Stars ───────── */
const AmenityIcon = (a = "") => {
  switch (a.toLowerCase()) {
    case "wifi":
      return <Wifi size={16} />
    case "breakfast":
      return <Coffee size={16} />
    case "tv":
      return <Tv size={16} />
    case "bathroom":
      return <Bath size={16} />
    default:
      return null
  }
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

/* ───────── Badges ───────── */
// 1) Minimalist
const MinimalistBadge = ({ type, className = "" }) => {
  const isS = type === "suite"
  return (
    <div className={`absolute -top-2 -right-2 z-20 ${className}`}>
      <div className="relative group">
        <div
          className={`
            px-3 py-1.5 rounded-lg
            ${
              isS
                ? "bg-amber-50 border border-amber-200/60 text-amber-800"
                : "bg-slate-50 border border-slate-200/60 text-slate-700"
            }
            shadow-sm backdrop-blur-sm
            transition-all duration-200 hover:shadow-md
            font-medium text-xs uppercase tracking-wide
          `}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isS ? "bg-amber-400" : "bg-slate-400"}`} />
            <span>{isS ? "Suite" : "Standard"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2) Metallic
const MetallicBadge = ({ type, className = "" }) => {
  const isS = type === "suite"
  return (
    <div className={`absolute -top-3 -right-3 z-20 ${className}`}>
      <div className="relative group">
        <div
          className={`
            relative px-4 py-2 rounded-lg
            ${isS ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"
                  : "bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600"}
            shadow-2xl transform hover:scale-105 transition-all duration-300
            before:absolute before:inset-0 before:rounded-lg
            before:bg-gradient-to-r ${
              isS
                ? "before:from-amber-300/50 before:via-yellow-400/30 before:to-amber-500/50"
                : "before:from-slate-300/50 before:via-gray-400/30 before:to-slate-500/50"
            }
            before:blur-sm
            after:absolute after:inset-0 after:rounded-lg
            after:bg-gradient-to-br after:from-white/40 after:via-transparent after:to-black/20
          `}
        >
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ top: `${i * 5}%`, transform: "skewX(-45deg)" }}
              />
            ))}
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <div className={`p-1 rounded ${isS ? "bg-amber-800/50" : "bg-slate-800/50"}`}>
              {isS ? (
                <Crown size={10} className="text-amber-100" />
              ) : (
                <Shield size={10} className="text-slate-100" />
              )}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isS ? "text-amber-100" : "text-slate-100"} drop-shadow-lg`}
            >
              {isS ? "SUITE" : "STANDARD"}
            </span>
          </div>
          <div className="absolute inset-0 rounded-lg border border-white/30 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

// 3) Crystal
const CrystalBadge = ({ type, className = "" }) => {
  const isS = type === "suite"
  return (
    <div className={`absolute -top-4 -right-4 z-20 ${className}`}>
      <div className="relative group">
        <div
          className={`
            relative w-16 h-16 transform rotate-45
            ${isS
              ? "bg-gradient-to-br from-amber-200/80 via-yellow-100/60 to-amber-300/80"
              : "bg-gradient-to-br from-slate-200/80 via-gray-100/60 to-slate-300/80"}
            backdrop-blur-xl border-2 ${isS ? "border-amber-300/60" : "border-slate-300/60"}
            shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 hover:scale-110
            before:absolute before:inset-1 before:bg-gradient-to-br
            ${isS ? "before:from-amber-100/40 before:to-yellow-200/40"
                  : "before:from-slate-100/40 before:to-gray-200/40"}
            before:backdrop-blur-sm
          `}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br ${isS ? "from-amber-100/60 to-transparent" : "from-slate-100/60 to-transparent"}`} />
            <div className={`absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl ${isS ? "from-amber-300/40 to-transparent" : "from-slate-300/40 to-transparent"}`} />
            <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br ${isS ? "from-yellow-200/80 to-amber-200/40" : "from-gray-200/80 to-slate-200/40"}`} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
            <div className="text-center">
              <div className={`p-1 rounded-full ${isS ? "bg-amber-500/80" : "bg-slate-500/80"} mb-1 backdrop-blur-sm`}>
                {isS ? (
                  <Crown size={10} className="text-amber-100" />
                ) : (
                  <Shield size={10} className="text-slate-100" />
                )}
              </div>
              <span
                className={`text-[7px] font-black uppercase tracking-wider ${isS ? "text-amber-800" : "text-slate-800"} drop-shadow-sm`}
              >
                {isS ? "SUITE" : "STD"}
              </span>
            </div>
          </div>
          <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-sm" />
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// 4) Ribbon
const RibbonBadge = ({ type, className = "" }) => {
  const isS = type === "suite"
  return (
    <div className={`absolute -top-2 -right-6 z-20 ${className}`}>
      <div className="relative group">
        <div
          className={`
            relative px-6 py-2
            ${isS ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
                  : "bg-gradient-to-r from-slate-500 via-gray-400 to-slate-500"}
            transform rotate-12 shadow-2xl hover:rotate-6 transition-all duration-300
            before:absolute before:inset-0
            before:bg-gradient-to-b before:from-white/30 before:via-transparent before:to-black/20
          `}
        >
          <div
            className={`
              absolute -left-2 top-0 w-0 h-0
              border-t-[16px] ${isS ? "border-t-amber-600" : "border-t-slate-600"}
              border-r-[8px] border-r-transparent
              border-b-[16px] ${isS ? "border-b-amber-600" : "border-b-slate-600"}
            `}
          />
          <div
            className={`
              absolute -right-2 top-0 w-0 h-0
              border-t-[16px] ${isS ? "border-t-amber-600" : "border-t-slate-600"}
              border-l-[8px] border-l-transparent
              border-b-[16px] ${isS ? "border-b-amber-600" : "border-b-slate-600"}
            `}
          />
          <div className="relative z-10 flex items-center gap-2">
            <div className={`p-0.5 rounded ${isS ? "bg-amber-700/50" : "bg-slate-700/50"}`}>
              {isS ? <Crown size={8} className="text-amber-100" /> : <Shield size={8} className="text-slate-100" />}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isS ? "text-amber-100" : "text-slate-100"} drop-shadow-lg`}
            >
              {isS ? "SUITE" : "STD"}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12" />
        </div>
        <div
          className={`
            absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0
            border-l-[6px] border-l-transparent
            border-r-[6px] border-r-transparent
            border-t-[8px] ${isS ? "border-t-amber-600" : "border-t-slate-600"}
          `}
        />
      </div>
    </div>
  )
}

// 5) Holographic
const HolographicBadge = ({ type, className = "" }) => {
  const isS = type === "suite"
  return (
    <div className={`absolute -top-3 -right-3 z-20 ${className}`}>
      <div className="relative group">
        <div
          className={`
            relative px-4 py-2 rounded-xl
            ${isS ? "bg-gradient-to-br from-amber-400/80 via-yellow-300/60 to-amber-500/80"
                  : "bg-gradient-to-br from-slate-400/80 via-gray-300/60 to-slate-500/80"}
            backdrop-blur-xl border border-white/30
            shadow-2xl transform hover:scale-105 transition-all duration-500
            before:absolute before:inset-0 before:rounded-xl
            before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
            before:transform before:skew-x-12 before:animate-pulse
            after:absolute after:inset-0 after:rounded-xl
            after:bg-gradient-to-br after:from-white/20 after:via-transparent after:to-black/10
          `}
        >
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div
              className={`
                absolute inset-0 opacity-60
                bg-gradient-to-r ${
                  isS ? "from-amber-300 via-yellow-200 to-amber-400" : "from-slate-300 via-gray-200 to-slate-400"
                }
                animate-pulse
              `}
              style={{
                background: isS
                  ? "linear-gradient(45deg, #f59e0b, #eab308, #f59e0b, #eab308)"
                  : "linear-gradient(45deg, #64748b, #94a3b8, #64748b, #94a3b8)",
                backgroundSize: "200% 200%",
                animation: "shimmer 3s ease-in-out infinite",
              }}
            />
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <div className={`p-1 rounded-full ${isS ? "bg-amber-600/60" : "bg-slate-600/60"} backdrop-blur-sm`}>
              {isS ? <Crown size={10} className="text-amber-100" /> : <Shield size={10} className="text-slate-100" />}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${isS ? "text-amber-900" : "text-slate-900"} drop-shadow-sm`}
            >
              {isS ? "SUITE" : "STANDARD"}
            </span>
          </div>
          <div className="absolute inset-0 rounded-xl border-2 border-white/40 pointer-events-none" />
          <div className={`absolute -top-1 -left-1 w-2 h-2 rounded-full ${isS ? "bg-amber-300" : "bg-slate-300"} opacity-80`} />
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isS ? "bg-amber-300" : "bg-slate-300"} opacity-80`} />
          <div className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full ${isS ? "bg-amber-300" : "bg-slate-300"} opacity-80`} />
          <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${isS ? "bg-amber-300" : "bg-slate-300"} opacity-80`} />
        </div>
      </div>
    </div>
  )
}

/* Badge seleccionado */
const PremiumBadge = MinimalistBadge // cambia si quieres otro estilo

/* ───────── COMPONENTE PRINCIPAL ───────── */
export default function Rooms() {
  /* redux / routing */
  const { id } = useParams()
  const hotelId = Number(id)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const hotels = useSelector((s) => s.hotel.list)
  const hotelStatus = useSelector((s) => s.hotel.status) // para mostrar loader
  const { byHotel, status, error } = useSelector((s) => s.room)
  const booking = useSelector((s) => s.booking)

  const hotel = hotels.find((h) => h.id === hotelId)
  const rooms = byHotel[hotelId] || []

  /* ───────── estado local ───────── */
  const [images, setImages] = useState([])
  const [imgIdx, setImgIdx] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  const [favorite, setFavorite] = useState(false)
  const [showAmenities, setShowAmenities] = useState(false)
  const [dateModal, setDateModal] = useState(false)
  const [newIn, setNewIn] = useState(booking.checkIn ? new Date(booking.checkIn) : new Date())
  const [newOut, setNewOut] = useState(
    booking.checkOut ? new Date(booking.checkOut) : new Date(Date.now() + 86_400_000),
  )

  /* UX */
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("price")
  const [filterBy, setFilterBy] = useState("all")
  const [roomTypeFilter, setRoomTypeFilter] = useState("all")
  const [visibleRooms, setVisibleRooms] = useState(12)

  /* ───────── datos derivados ───────── */
  const ratingVal = Number(hotel?.rating) || 0

  const amenities = useMemo(() => {
    if (!hotel || !hotel.amenities) return []
    const raw = hotel.amenities
    if (Array.isArray(raw)) return [...new Set(raw.filter((x) => typeof x === "string" && x.trim()))]
    if (typeof raw === "object") {
      const keysTruthy = Object.entries(raw)
        .filter(([_, v]) => v === true || v === 1)
        .map(([k]) => k)
      const flatValues = Object.values(raw).flat().filter((v) => typeof v === "string")
      return [...new Set([...keysTruthy, ...flatValues])]
    }
    return []
  }, [hotel])

  const processedRooms = useMemo(() => {
    let arr = [...rooms]
    if (roomTypeFilter === "standard") arr = arr.filter((r) => !isSuite(r))
    else if (roomTypeFilter === "suite") arr = arr.filter((r) => isSuite(r))
    if (filterBy !== "all") arr = arr.filter((r) => r.name.toLowerCase().includes(filterBy.toLowerCase()))
    arr.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "size":
          return (b.size || 0) - (a.size || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    return arr
  }, [rooms, filterBy, sortBy, roomTypeFilter])

  const groupedRooms = useMemo(() => {
    const g = {}
    processedRooms.forEach((r) => {
      const k = isSuite(r)
        ? "Suites"
        : r.name.includes("Deluxe")
        ? "Deluxe Rooms"
        : "Standard Rooms"
      ;(g[k] ||= []).push(r)
    })
    return g
  }, [processedRooms])

  const minRoomPrice = useMemo(() => {
    if (!rooms.length) return 0
    const p = rooms.map((r) => Number.parseFloat(r.price)).filter((n) => !Number.isNaN(n) && n > 0)
    return p.length ? Math.min(...p) : 0
  }, [rooms])

  const roomTypeCounts = useMemo(
    () => ({
      standard: rooms.filter((r) => !isSuite(r)).length,
      suite: rooms.filter((r) => isSuite(r)).length,
      total: rooms.length,
    }),
    [rooms],
  )

  /* ───────── effects ───────── */
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // cargar hoteles si no existen
  useEffect(() => {
    if (hotels.length === 0 && hotelStatus !== "loading") {
      dispatch(fetchHotels())
    }
  }, [hotels.length, hotelStatus, dispatch])

  useEffect(() => {
    if (hotel) dispatch(selectHotel(hotel))
    if (!byHotel[hotelId]) {
      dispatch(fetchRooms({ hotelId, searchParams: booking }))
    }
  }, [dispatch, hotel, hotelId, byHotel, booking])

  useEffect(() => {
    if (!hotelId) return
    axios
      .get(`${API_URL}/hotels/${hotelId}/images`)
      .then((res) => setImages(res.data.map((i) => i.url)))
      .catch(console.error)
  }, [hotelId])

  /* ───────── handlers ───────── */
  const back = () => navigate("/")
  const share = () => navigator.share?.({ title: hotel?.name, url: window.location.href })
  const toggleFav = () => setFavorite((f) => !f)
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length)
  const prevImg = () => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  const loadMore = () => setVisibleRooms((v) => v + 8)

  // ⛳ Siempre ir en modo PARTNER al checkout
  const bookRoom = (room) => {
    const ci = booking.checkIn || toIso10AM(new Date())
    const co = booking.checkOut || toIso10AM(new Date(Date.now() + 86_400_000))
    dispatch(
      setBookingRoom({
        room,
        hotel,
        checkIn: ci,
        checkOut: co,
        // banderitas para el checkout
        source: "PARTNER",
        partnerMode: true,
        paymentProvider: "STRIPE",
        paymentType: "MERCHANT",
      }),
    )
    // También por querystring por si el Checkout lo lee de la URL
    navigate("/checkout?source=PARTNER")
  }

  const saveDates = () => {
    if (newIn >= newOut) return alert("Check-out must be after check-in")
    dispatch(setCheckIn(toIso10AM(newIn)))
    dispatch(setCheckOut(toIso10AM(newOut)))
    dispatch(
      fetchRooms({
        hotelId,
        searchParams: { ...booking, checkIn: toIso10AM(newIn), checkOut: toIso10AM(newOut) },
      }),
    )
    setDateModal(false)
  }

  /* ───────── GUARD ───────── */
  if (!hotel) {
    return hotelStatus === "loading" ? (
      <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center text-gray-600">
          <Loader2 className="h-16 w-16 animate-spin" />
          <p className="mt-4 text-lg font-medium">Loading hotel details…</p>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-red-600 text-xl font-bold">Hotel not found</p>
      </div>
    )
  }

  /* ───────── MOBILE VIEW ───────── */
  if (mobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
          <button
            onClick={back}
            style={iosStyle}
            className="p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={share}
              style={iosStyle}
              className="p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
            <button
              onClick={toggleFav}
              style={iosStyle}
              className="p-3 rounded-2xl bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Heart size={20} className={favorite ? "fill-current text-red-500" : "text-gray-600"} />
            </button>
          </div>
        </div>

        {/* Gallery mobile */}
        <div className="relative overflow-hidden">
          {images.length ? (
            <>
              <div className="relative">
                <img
                  src={images[imgIdx] || "/placeholder.svg"}
                  alt={`${hotel.name} ${imgIdx + 1}`}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft size={18} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <ChevronRight size={18} className="text-gray-800" />
                  </button>
                </>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                {imgIdx + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Camera className="text-gray-400" size={40} />
            </div>
          )}
        </div>

        {/* Hotel info mobile */}
        <div className="relative -mt-8 mx-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin size={14} className="text-red-500" />
                <span className="font-medium">{hotel.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Stars rating={ratingVal} size={16} />
                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                  {ratingVal.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed text-base">
            {hotel.description || "Comfort and luxury in one place."}
          </p>

          {/* Amenities mobile */}
          <div className="mb-6">
            <h3 className="font-bold mb-6 text-gray-900 text-xl">Popular amenities</h3>
            <div className="space-y-4">
              {(showAmenities ? amenities : amenities.slice(0, 8)).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-base text-gray-700 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-md border border-gray-200/50 hover:shadow-lg hover:bg-white transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                    <div className="text-red-500">{AmenityIcon(a)}</div>
                  </div>
                  <span className="font-semibold text-gray-800 leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
            {amenities.length > 8 && (
              <button
                onClick={() => setShowAmenities(!showAmenities)}
                className="text-base text-red-600 font-bold mt-6 hover:text-red-700 transition-colors duration-200 flex items-center gap-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
                style={iosStyle}
              >
                {showAmenities ? "Show less amenities" : "Show all amenities"}
                {showAmenities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Rooms mobile */}
        <div className="space-y-6 px-4 pt-8 pb-24">
          {processedRooms.map((room) => (
            <div
              key={room.id}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <PremiumBadge type={isSuite(room) ? "suite" : "standard"} />
              <h4 className="font-bold text-gray-900 mb-2 text-xl leading-tight">{room.name}</h4>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{room.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-gray-900">${room.price}</span>
                  <span className="text-sm text-gray-500 block font-medium">per night</span>
                </div>
                <button
                  onClick={() => bookRoom(room)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ───────── DESKTOP VIEW ───────── */
  return (
    <div className="py-8 px-6 max-w-7xl mx-auto pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* ---------- Top Controls ---------- */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={back}
          style={iosStyle}
          className="flex items-center gap-3 text-gray-700 hover:text-red-500 font-semibold transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl"
        >
          <ArrowLeft size={18} /> Back to Hotels
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={share}
            style={iosStyle}
            className="p-3 text-gray-600 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={toggleFav}
            style={iosStyle}
            className={`p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105 ${
              favorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="mb-10">
        <SearchBar />
      </div>

      {/* ---------- Hotel Header ---------- */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-12 border border-white/50">
        {/* —— Galería —— */}
        <div className="relative w-full">
          {images.length ? (
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <img
                  src={images[imgIdx] || "/placeholder.svg"}
                  alt={`${hotel.name} ${imgIdx + 1}`}
                  className="object-cover w-full h-full cursor-pointer transition-all duration-500 hover:scale-105"
                  onClick={() => setShowGallery(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {imgIdx + 1} / {images.length}
                </div>
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-2xl shadow-xl hover:bg-white hover:shadow-2xl flex items-center gap-3 text-sm font-bold transition-all duration-200 hover:scale-105"
                >
                  <ImageIcon size={16} />
                  View all photos
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.slice(0, 8).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-3 transition-all duration-200 hover:scale-105 ${
                        i === imgIdx
                          ? "border-red-500 shadow-lg ring-2 ring-red-200"
                          : "border-transparent hover:border-gray-300 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <img src={img || "/placeholder.svg"} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length > 8 && (
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 border-3 border-transparent hover:border-gray-400 flex items-center justify-center text-xs text-gray-700 font-bold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      +{images.length - 8}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 lg:h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Camera className="text-gray-400" size={48} />
            </div>
          )}
        </div>

        {/* Info hotel debajo de las fotos */}
        <div className="p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">{hotel.name}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-red-500" />
                  {hotel.address}
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Star size={16} className="text-amber-500" />
                  {ratingVal.toFixed(1)}
                </span>
              </div>
              <Stars rating={ratingVal} size={18} />
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 px-6 py-4 rounded-3xl text-center border border-red-200 shadow-lg lg:min-w-[200px]">
              <div className="text-sm text-red-800 font-semibold">From</div>
              <div className="text-3xl font-bold text-red-600">${minRoomPrice || "—"}</div>
              <div className="text-sm text-red-600 font-medium">per night</div>
            </div>
          </div>

          <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-4xl">
            {hotel.description || "Comfort and luxury in one place."}
          </p>

          {/* Amenities */}
          <div className="border-t border-gray-200/50 pt-8">
            <h3 className="font-bold mb-8 text-gray-900 text-2xl">Popular amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {(showAmenities ? amenities : amenities.slice(0, 12)).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-base bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 hover:bg-white hover:shadow-md transition-all duration-200 shadow-sm border border-gray-200/50 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-red-500">
                    {AmenityIcon(a)}
                  </div>
                  <span className="font-semibold text-gray-800 leading-relaxed group-hover:text-gray-900 transition-colors duration-200">
                    {a}
                  </span>
                </div>
              ))}
            </div>
            {amenities.length > 12 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAmenities(!showAmenities)}
                  style={iosStyle}
                  className="text-base font-bold text-red-600 flex items-center gap-2 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md mx-auto"
                >
                  {showAmenities ? "Show less amenities" : "Show all amenities"}
                  {showAmenities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- List Controls ---------- */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-10 border border-white/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Available rooms ({processedRooms.length})</h2>

          {/* Room Type Tabs */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-slate-100 to-gray-100 rounded-2xl p-1 border border-slate-200/50 shadow-inner">
            <button
              onClick={() => setRoomTypeFilter("all")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                roomTypeFilter === "all"
                  ? "bg-white text-slate-900 shadow-lg border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              All Rooms ({roomTypeCounts.total})
            </button>
            <button
              onClick={() => setRoomTypeFilter("standard")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                roomTypeFilter === "standard"
                  ? "bg-white text-slate-900 shadow-lg border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Shield size={14} className="text-slate-500" />
              Standard ({roomTypeCounts.standard})
            </button>
            <button
              onClick={() => setRoomTypeFilter("suite")}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                roomTypeFilter === "suite"
                  ? "bg-white text-slate-900 shadow-lg border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Crown size={14} className="text-amber-500" />
              Suites ({roomTypeCounts.suite})
            </button>
          </div>
        </div>

        {/* Sort / Filter / View */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <SortAsc size={16} />
                <label className="text-sm font-bold">Sort by:</label>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <option value="price">Price</option>
                <option value="size">Size</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter size={16} />
                <label className="text-sm font-bold">Filter:</label>
              </div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <option value="all">All rooms</option>
                <option value="suite">Suites</option>
                <option value="deluxe">Deluxe</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>

          <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 shadow-inner">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{processedRooms.length}</div>
            <div className="text-sm text-red-800 font-semibold">Available Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              $
              {processedRooms.length
                ? Math.min(...processedRooms.map((r) => Number.parseFloat(r.price) || 0))
                : "—"}
            </div>
            <div className="text-sm text-red-800 font-semibold">Starting Price</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{Object.keys(groupedRooms).length}</div>
            <div className="text-sm text-red-800 font-semibold">Room Types</div>
          </div>
        </div>
      </div>

      {/* ---------- Rooms ---------- */}
      {status === "loading" ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-300/20 border-b-red-400 rounded-full animate-spin animate-reverse mx-auto" />
          </div>
          <p className="text-gray-600 text-lg font-semibold">Loading rooms…</p>
        </div>
      ) : status === "failed" ? (
        <div className="text-center py-16">
          <p className="text-red-600 text-xl font-bold">Error: {error}</p>
        </div>
      ) : Object.keys(groupedRooms).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-xl font-semibold">No rooms found</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedRooms).map(([group, groupRooms]) => (
            <div
              key={group}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
            >
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{group}</h3>
                  <p className="text-red-100 font-semibold">{groupRooms.length} rooms available</p>
                </div>
              </div>
              <div className="p-8">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid gap-6 grid-cols-1"
                  }
                >
                  {groupRooms.slice(0, visibleRooms).map((room) =>
                    viewMode === "grid" ? (
                      <div
                        key={room.id}
                        className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-gray-200/50 group"
                      >
                        <PremiumBadge type={isSuite(room) ? "suite" : "standard"} />
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-red-600 transition-colors duration-200">
                            {room.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{room.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                            <span className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                              <Users className="w-3 h-3 text-red-500" />
                              <span className="font-medium">{room.maxGuests || room.capacity || 2}</span>
                            </span>
                            <span className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                              <Bed className="w-3 h-3 text-red-500" />
                              <span className="font-medium">{room.beds || "1 Bed"}</span>
                            </span>
                            <span className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                              <Maximize className="w-3 h-3 text-red-500" />
                              <span className="font-medium">{room.size || "25 m²"}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">${room.price}</span>
                              <span className="text-sm text-gray-500 block font-medium">per night</span>
                            </div>
                            <button
                              onClick={() => bookRoom(room)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <RoomCard
                        key={room.id}
                        room={room}
                        hotel={hotel}
                        checkIn={booking.checkIn}
                        checkOut={booking.checkOut}
                        onBook={() => bookRoom(room)}
                      />
                    ),
                  )}
                </div>
                {groupRooms.length > visibleRooms && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      className="px-8 py-4 border-2 border-gray-300 rounded-3xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    >
                      Show {Math.min(8, groupRooms.length - visibleRooms)} more rooms
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- GALLERY MODAL ---------- */}
      {showGallery && (
        <div className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-6 text-white">
            <div>
              <h3 className="text-2xl font-bold">{hotel.name}</h3>
              <p className="text-gray-300 font-semibold">{images.length} photos</p>
            </div>
            <button
              onClick={() => setShowGallery(false)}
              style={iosStyle}
              className="p-3 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    setImgIdx(i)
                    setShowGallery(false)
                  }}
                >
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`${hotel.name} ${i + 1}`}
                    className="w-full h-64 object-cover rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl" />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- DATE MODAL ---------- */}
      {dateModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit dates</h3>
              <button
                onClick={() => setDateModal(false)}
                style={iosStyle}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm mb-2 font-bold text-gray-700">Check-in</label>
                <DatePicker
                  selected={newIn}
                  onChange={(d) => {
                    setNewIn(d)
                    if (d >= newOut) {
                      const n = new Date(d)
                      n.setDate(n.getDate() + 1)
                      setNewOut(n)
                    }
                  }}
                  selectsStart
                  startDate={newIn}
                  endDate={newOut}
                  minDate={new Date()}
                  dateFormat="MMM dd"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 font-bold text-gray-700">Check-out</label>
                <DatePicker
                  selected={newOut}
                  onChange={(d) => setNewOut(d)}
                  selectsEnd
                  startDate={newIn}
                  endDate={newOut}
                  minDate={new Date(newIn.getTime() + 86_400_000)}
                  dateFormat="MMM dd"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                />
              </div>
            </div>
            <button
              onClick={saveDates}
              style={iosStyle}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────── Animación shimmer global ───────── */
const shimmerKeyframes = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = shimmerKeyframes
  document.head.appendChild(style)
}
