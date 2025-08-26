"use client"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  X,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Coffee,
  Bath,
  Users,
  ChevronDown,
  ChevronUp,
  Bed,
  Maximize,
  Crown,
  Loader2,
  AlertCircle,
  Info,
  Check,
  DollarSign,
  MapPin,
} from "lucide-react"
import { setBookingRoom } from "../features/booking/bookingSlice"

const API_URL = import.meta.env.VITE_API_URL

const HotelModalRooms = ({ hotel, isOpen, onClose, onBook, searchParams }) => {
  const dispatch = useDispatch()
  const discount = useSelector((state) => state.discount)
  const navigate = useNavigate()
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hotelRooms, setHotelRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [editableSearchParams, setEditableSearchParams] = useState(searchParams)
  const [isUpdatingRooms, setIsUpdatingRooms] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("description")


  console.log(user, "user")

  const loadImages = async () => {
    setLoadingImages(true)
    try {
      setImages([
        `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(hotel.hotelName || "Hotel")}`,
        `/placeholder.svg?height=400&width=600&text=Room+View`,
        `/placeholder.svg?height=400&width=600&text=Bathroom`,
        `/placeholder.svg?height=400&width=600&text=Lobby`,
        `/placeholder.svg?height=400&width=600&text=Pool`,
        `/placeholder.svg?height=400&width=600&text=Restaurant`,
      ])
    } catch (error) {
      console.error("Error loading images:", error)
      setImages([
        `/placeholder.svg?height=400&width=600&text=Hotel`,
        `/placeholder.svg?height=400&width=600&text=Room+View`,
      ])
    } finally {
      setLoadingImages(false)
    }
  }

  const loadHotelRooms = async () => {
    if (!hotel?.hotelCode || !isOpen) return

    setEditableSearchParams(searchParams || {})

    setLoadingRooms(true)
    console.log(`🏨 Loading rooms for hotel: ${hotel.hotelCode} - ${hotel.hotelName || "Unknown Hotel"}`)

    const defaultCheckIn = searchParams?.checkIn || new Date().toISOString().split("T")[0]
    const defaultCheckOut = searchParams?.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0]

    const paramsToUse = {
      ...searchParams,
      checkIn: defaultCheckIn,
      checkOut: defaultCheckOut,
    }

    await updateRoomSearch(paramsToUse)
    setLoadingRooms(false)
  }

  // HotelModalRooms.jsx (dentro del componente)
const updateRoomSearch = async (newParams) => {
  setIsUpdatingRooms(true)
  setDebugInfo(null)

  try {
    // Rol desde Redux; fallback a 1 (guest)
    const effectiveRole = Number.isFinite(+user?.role) ? +user.role : 1

    const occupancies = `${newParams?.adults || 1}|${newParams?.children || 0}`
    const qp = new URLSearchParams({
      checkIn: newParams?.checkIn || new Date().toISOString().split("T")[0],
      checkOut: newParams?.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      occupancies,
      currency: (newParams?.currency || "EUR").toUpperCase(),
      hotelCodes: hotel.hotelCode,
      user_role: String(effectiveRole), // 👈 en query
      _role: String(effectiveRole),     // cache-buster rol
      _ts: String(Date.now()),          // cache-buster tiempo
    })

    const searchUrl = `${API_URL}/tgx/search?${qp.toString()}`
    console.log(`🔍 Searching for hotel ${hotel.hotelCode}:`, searchUrl)

    setDebugInfo({
      hotelCode: hotel.hotelCode,
      hotelName: hotel.hotelName || "Unknown Hotel",
      searchUrl,
      searchParams: newParams,
      timestamp: new Date().toISOString(),
    })

    const response = await fetch(searchUrl, {
      cache: "no-store",
      credentials: "omit", // 👈 sin cookies; evita CORS preflight
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Search failed for hotel ${hotel.hotelCode}:`, response.status, errorText)
      setDebugInfo((prev) => ({
        ...prev,
        error: `HTTP ${response.status}: ${errorText}`,
        success: false,
      }))
      setHotelRooms([])
      return
    }

    const results = await response.json()
    console.log(`📊 Search results for hotel ${hotel.hotelCode}:`, results)

    if (!results || results.length === 0) {
      setDebugInfo((prev) => ({
        ...prev,
        results: [],
        message: "No results returned from API",
        success: false,
      }))
      setHotelRooms([])
      return
    }

    // ⚠️ Mapeo: siempre preferir priceUser cuando esté disponible
    const rooms = results.flatMap((result, rIdx) => {
      const base = {
        hotelCode: result.hotelCode,
        hotelName: result.hotelName,
        board: result.board,
        paymentType: result.paymentType,
        cancelPolicy: result.cancelPolicy || null,
        rateRules: Array.isArray(result.rateRules) ? result.rateRules : [],
        status: result.status,
        surcharges: result.surcharges || [],
      }

      const refundableFromRules = !(base.rateRules || []).includes("NON_REFUNDABLE")

      // A) rateKey al tope
      const topLevel = result.rateKey
        ? [
            {
              ...base,
              id: `${result.hotelCode}_${rIdx}_top`,
              name: result.roomDescription || result.description || "Room",
              description: result.roomDescription || result.description || "Room",
              price: Number(result.priceUser ?? result.price ?? 0),
              currency: (result.currency || newParams?.currency || "EUR").toUpperCase(),
              rateKey: result.rateKey,
              capacity: result.maxGuests || newParams?.adults || 2,
              refundable: typeof result.refundable === "boolean" ? result.refundable : refundableFromRules,
            },
          ]
        : []

      // B) rooms hijas
      const childRooms = Array.isArray(result.rooms)
        ? result.rooms.map((room, i) => {
            const isNRF =
              (base.rateRules || []).includes("NON_REFUNDABLE") ||
              (Array.isArray(room.rateRules) && room.rateRules.includes("NON_REFUNDABLE"))
            const refundable =
              typeof room.refundable === "boolean"
                ? room.refundable
                : typeof result.refundable === "boolean"
                ? result.refundable
                : !isNRF

            return {
              ...base,
              id: `${result.hotelCode}_${rIdx}_${i}`,
              name: room.description || room.name || `Room ${i + 1}`,
              description: room.description || room.name || `Room ${i + 1}`,
              price: Number(room.priceUser ?? room.price ?? result.priceUser ?? result.price ?? 0),
              currency: (room.currency || result.currency || newParams?.currency || "EUR").toUpperCase(),
              rateKey: room.rateKey || result.rateKey,
              capacity: room.maxGuests || newParams?.adults || 2,
              roomCode: room.code,
              refundable,
            }
          })
        : []

      return [...topLevel, ...childRooms].filter((r) => r.rateKey)
    })

    setDebugInfo((prev) => ({
      ...prev,
      results,
      roomsFound: rooms.length,
      rooms: rooms.slice(0, 3),
      success: true,
    }))

    setHotelRooms(rooms)
    if (rooms.length > 0) setSelectedRoomIndex(0)
  } catch (error) {
    console.error(`💥 Error searching for hotel ${hotel.hotelCode}:`, error)
    setDebugInfo((prev) => ({
      ...prev,
      error: error.message,
      success: false,
    }))
    setHotelRooms([])
  } finally {
    setIsUpdatingRooms(false)
  }
}



  // Helpers de precio: siempre prioriza priceUser
  const getRoomBasePrice = (room) => Number(room?.priceUser ?? room?.priceBase ?? room?.price ?? 0)

  const handleDateChange = (field, value) => {
    const newParams = { ...editableSearchParams, [field]: value }
    setEditableSearchParams(newParams)

    if (newParams.checkIn && newParams.checkOut && newParams.checkIn < newParams.checkOut) {
      updateRoomSearch(newParams)
    }
  }

  const handleGuestChange = (field, value) => {
    const newParams = { ...editableSearchParams, [field]: value }
    setEditableSearchParams(newParams)

    if (newParams.checkIn && newParams.checkOut) {
      updateRoomSearch(newParams)
    }
  }

  const handleRoomSelection = (roomIndex) => {
    setSelectedRoomIndex(roomIndex)
    console.log(`🏠 Room selected:`, hotelRooms[roomIndex])
  }

  const handleBookNow = () => {
    if (hotelRooms.length === 0 || selectedRoomIndex < 0) {
      alert("Please select a room first")
      return
    }

    const selectedRoom = hotelRooms[selectedRoomIndex]
    const priceForBooking = getRoomBasePrice(selectedRoom) // usar priceUser

    const bookingData = {
      room: {
        id: selectedRoom.id ?? null,
        hotel_id: selectedRoom.hotelCode,
        name: selectedRoom.name,
        price: Number.parseFloat(priceForBooking) || 0, // 👈 usa priceUser
        capacity: selectedRoom.capacity,
        description: selectedRoom.description,
        currency: (selectedRoom.currency || "EUR").toUpperCase(),
        rateKey: selectedRoom.rateKey,
        tgx: true,
        refundable: !!selectedRoom.refundable,
        paymentType: selectedRoom.paymentType || null,
        board: selectedRoom.board || null,
        // por si necesitas en checkout
        priceBase: Number(selectedRoom.priceBase ?? 0),
        priceUser: Number(selectedRoom.priceUser ?? priceForBooking),
        markup: selectedRoom.markup || null,
      },
      hotel: {
        id: hotel.hotelCode ?? null,
        name: hotel.hotelName || "Unknown Hotel",
        address: `${hotel.location?.city || "Unknown City"}, ${hotel.location?.country || "Unknown Country"}`,
        rating: hotel.categoryCode || "4",
        image: null,
        hotelCode: hotel.hotelCode,
        tgx: true,
      },
      checkIn: (editableSearchParams?.checkIn || new Date().toISOString().split("T")[0]) + "T15:00:00",
      checkOut:
        (editableSearchParams?.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0]) + "T11:00:00",
      source: "TGX",
      tgxHotel: { hotelCode: hotel.hotelCode },
    }

    console.log("🎯 Booking data to dispatch:", bookingData)

    dispatch(setBookingRoom(bookingData))
    onClose()
    navigate("/checkout")
  }

  const testHotelAvailability = async () => {
    console.log(`🧪 Testing availability for hotel ${hotel.hotelCode}...`)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)

    const testParams = {
      checkIn: tomorrow.toISOString().split("T")[0],
      checkOut: dayAfter.toISOString().split("T")[0],
      adults: 1,
      children: 0,
      currency: "EUR",
    }

    await updateRoomSearch(testParams)
  }

  const processedAmenities = hotel?.amenities
    ? (Array.isArray(hotel.amenities) ? hotel.amenities : Object.keys(hotel.amenities))
      .filter((amenity) => amenity && typeof amenity === "string")
      .map((amenity) => ({
        name: amenity,
        icon: getAmenityIcon(amenity),
        category: getAmenityCategory(amenity),
      }))
    : []

  function getAmenityIcon(amenity) {
    const name = amenity.toLowerCase()
    if (name.includes("wifi") || name.includes("internet")) return Wifi
    if (name.includes("pool") || name.includes("spa")) return Waves
    if (name.includes("gym") || name.includes("fitness")) return Dumbbell
    if (name.includes("restaurant") || name.includes("dining")) return Utensils
    if (name.includes("parking") || name.includes("car")) return Car
    if (name.includes("coffee") || name.includes("breakfast")) return Coffee
    if (name.includes("bath") || name.includes("bathroom")) return Bath
    return Users
  }

  function getAmenityCategory(amenity) {
    const name = amenity.toLowerCase()
    if (name.includes("pool") || name.includes("spa")) return "Pool & Spa"
    if (name.includes("gym") || name.includes("fitness")) return "Fitness"
    if (name.includes("restaurant") || name.includes("dining")) return "Dining"
    if (name.includes("parking")) return "Parking"
    if (name.includes("wifi") || name.includes("internet")) return "Internet"
    return "Services"
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const calculateNights = () => {
    if (!editableSearchParams?.checkIn || !editableSearchParams?.checkOut) return 1
    const checkIn = new Date(editableSearchParams.checkIn)
    const checkOut = new Date(editableSearchParams.checkOut)
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  }

  // aplica descuento de Redux sobre un precio base (que ya incluye markup)
  const applyReduxDiscount = (basePrice) => {
    if (!discount.active) return basePrice

    if (discount.specialDiscountPrice !== null && discount.specialDiscountPrice !== undefined) {
      const n = Number(discount.specialDiscountPrice)
      return Number.isFinite(n) ? n : basePrice
    }

    if (discount.percentage) {
      const p = Number(discount.percentage)
      if (Number.isFinite(p) && p > 0) {
        const discountAmount = (basePrice * p) / 100
        return basePrice - discountAmount
      }
    }
    return basePrice
  }

  const getSelectedRoom = () => {
    if (hotelRooms.length > 0 && selectedRoomIndex >= 0) {
      return hotelRooms[selectedRoomIndex]
    }
    return null
  }

  const selectedRoom = getSelectedRoom()

  // precio por noche mostrado (markup incluido; luego aplica descuento si corresponde)
  const getSelectedRoomPrice = () => {
    const base = selectedRoom ? getRoomBasePrice(selectedRoom) : 120
    return applyReduxDiscount(base)
  }

  console.log(discount, "discount")

  useEffect(() => {
    if (isOpen && hotel) {
      loadImages()
      loadHotelRooms()
    }
  }, [hotel, isOpen])

  if (!isOpen || !hotel) return null

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Debug</span>
            </button>
            <button
              onClick={() => navigator.share?.({ title: hotel.hotelName || "Hotel", url: window.location.href })}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium underline">Share</span>
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-sm font-medium underline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {showDebug && debugInfo && (
        <div className="bg-gray-900 text-white p-4 text-xs font-mono">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-yellow-400 font-bold mb-2">🐛 Debug Info for {debugInfo.hotelName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="text-blue-400">Hotel Code:</span> {debugInfo.hotelCode}
                </p>
                <p>
                  <span className="text-blue-400">Search URL:</span> {debugInfo.searchUrl}
                </p>
                <p>
                  <span className="text-blue-400">Timestamp:</span> {debugInfo.timestamp}
                </p>
                <p>
                  <span className="text-blue-400">user_role:</span> {String(debugInfo.user_role)}
                </p>
                <p>
                  <span className="text-blue-400">Success:</span> {debugInfo.success ? "✅" : "❌"}
                </p>
              </div>
              <div>
                <p>
                  <span className="text-green-400">Rooms Found:</span> {debugInfo.roomsFound || 0}
                </p>
                <p>
                  <span className="text-purple-400">Selected Room:</span> {selectedRoomIndex + 1} of {hotelRooms.length}
                </p>
                {debugInfo.markup && (
                  <p>
                    <span className="text-amber-300">Markup:</span>{" "}
                    role {debugInfo.markup.roleNum} · {Math.round((debugInfo.markup.pct ?? 0) * 100)}%
                  </p>
                )}
                {debugInfo.error && (
                  <p>
                    <span className="text-red-400">Error:</span> {debugInfo.error}
                  </p>
                )}
                {debugInfo.message && (
                  <p>
                    <span className="text-yellow-400">Message:</span> {debugInfo.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={testHotelAvailability}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
              >
                Test Availability
              </button>
              <button
                onClick={() => console.log("Full debug info:", debugInfo)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
              >
                Log Full Info
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{hotel.hotelName || "Hotel Name"}</h1>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-black" />
              <span className="font-medium">{hotel.categoryCode || "4.8"}</span>
            </div>
            <span className="text-gray-600 underline cursor-pointer">
              {hotel.location?.city || "Unknown City"}, {hotel.location?.country || "Unknown Country"}
            </span>
            <span className="text-gray-500">Code: {hotel.hotelCode}</span>
          </div>
        </div>

        {/* Photos */}
        <div className="mb-8">
          {loadingImages ? (
            <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : showAllPhotos ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All photos</h2>
                <button
                  onClick={() => setShowAllPhotos(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${hotel.hotelName || "Hotel"} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
              <div className="col-span-2 row-span-2 relative group cursor-pointer">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={hotel.hotelName || "Hotel"}
                  className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${hotel.hotelName || "Hotel"} ${index + 2}`}
                    className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
                  />
                  {index === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <button
                        onClick={() => setShowAllPhotos(true)}
                        className="text-white font-medium text-sm border border-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        Show all photos
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Hotel hosted by {hotel.location?.city || "Premium"} Hotels
                  </h2>
                  <p className="text-gray-600">
                    {searchParams?.adults || 1} guest{(searchParams?.adults || 1) > 1 ? "s" : ""} · 1 room
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {hotel.hotelName?.charAt(0) || "H"}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`${activeTab === "description"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  className={`${activeTab === "location"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveTab("amenities")}
                  className={`${activeTab === "amenities"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Amenities
                </button>
              </nav>
            </div>

            <div className="py-6">
              {activeTab === "description" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">About this hotel</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {hotel.descriptions?.[0]?.texts?.[0]?.text ||
                      "Experience comfort and luxury in this exceptional hotel. Located in a prime location with world-class amenities and service, perfect for both business and leisure travelers."}
                  </p>
                </div>
              )}

              {activeTab === "location" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Location</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <MapPin className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {hotel.location?.address ||
                            `${hotel.location?.city || "Unknown City"}, ${hotel.location?.country || "Unknown Country"}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {hotel.location?.city || "Unknown City"}, {hotel.location?.country || "Unknown Country"}
                          {hotel.location?.zipCode && ` ${hotel.location.zipCode}`}
                        </div>
                        {hotel.location?.coordinates && (
                          <div className="text-xs text-gray-500 mt-1">
                            Lat: {hotel.location.coordinates.latitude}, Lng: {hotel.location.coordinates.longitude}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {hotel.location?.coordinates ? (
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc&q=${hotel.location.coordinates.latitude},${hotel.location.coordinates.longitude}&zoom=15`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-500">Map will be displayed here</span>
                          <div className="text-xs text-gray-400 mt-1">Coordinates needed for map display</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Nearby Attractions</h4>
                      <div className="text-sm text-blue-700">
                        <div className="flex justify-between py-1">
                          <span>City Center</span>
                          <span>2.1 km</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Airport</span>
                          <span>15.3 km</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Beach</span>
                          <span>0.8 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "amenities" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">What this place offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(showAllAmenities ? processedAmenities : processedAmenities.slice(0, 10)).map((amenity, index) => {
                      const IconComponent = amenity.icon
                      return (
                        <div key={index} className="flex items-center space-x-4 py-2">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700">{amenity.name}</span>
                        </div>
                      )
                    })}
                  </div>
                  {processedAmenities.length > 10 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <span>Show {showAllAmenities ? "less" : `all ${processedAmenities.length}`} amenities</span>
                      {showAllAmenities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Rooms */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Available rooms</h3>
                {debugInfo && (
                  <div className="text-sm text-gray-500">
                    Last search: {debugInfo.success ? "✅" : "❌"} ({debugInfo.roomsFound || 0} rooms)
                  </div>
                )}
              </div>

              {loadingRooms || isUpdatingRooms ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">
                    {isUpdatingRooms ? "Updating rooms..." : "Loading rooms..."}
                  </span>
                </div>
              ) : hotelRooms.length > 0 ? (
                <div className="space-y-4">
                  {hotelRooms.map((room, index) => {
                    const base = getRoomBasePrice(room) // priceUser priorizado
                    const discounted = applyReduxDiscount(base)

                    return (
                      <div
                        key={index}
                        onClick={() => handleRoomSelection(index)}
                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${selectedRoomIndex === index
                            ? "border-red-500 bg-red-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 mr-2">
                                {room.description || room.name || `Room ${index + 1}`}
                              </h4>

                              {/* badges */}
                              {room.paymentType && (
                                <span
                                  className={
                                    "px-2 py-1 rounded-full text-xs font-medium " +
                                    (room.paymentType === "DIRECT"
                                      ? "bg-amber-100 text-amber-800"
                                      : room.paymentType === "CARD_CHECK_IN"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800")
                                  }
                                  title="Payment method"
                                >
                                  {room.paymentType === "DIRECT" ? "Direct" : room.paymentType.replace(/_/g, " ")}
                                </span>
                              )}
                              <span
                                className={
                                  "px-2 py-1 rounded-full text-xs font-medium " +
                                  (room.refundable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")
                                }
                                title="Refundability"
                              >
                                {room.refundable ? "Refundable" : "Non-refundable"}
                              </span>
                              {room.board && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                  Board {room.board}
                                </span>
                              )}
                              {room.markup && (
                                <span
                                  className="px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800"
                                  title="Markup (role-based)"
                                >
                                  +{Math.round((room.markup.pct ?? 0) * 100)}% role {room.markup.roleNum}
                                </span>
                              )}

                              {room.suite && (
                                <span className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                                  <Crown className="h-3 w-3" />
                                  <span>Suite</span>
                                </span>
                              )}
                              {selectedRoomIndex === index && (
                                <span className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                  <Check className="h-3 w-3" />
                                  <span>Selected</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                              <span className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{room.capacity || room.maxGuests || searchParams?.adults || 2} guests</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Bed className="h-4 w-4" />
                                <span>{room.beds || "1 bed"}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Maximize className="h-4 w-4" />
                                <span>{room.size || "25"} m²</span>
                              </span>
                            </div>

                            {room.amenities && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.slice(0, 3).map((amenity, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right ml-6">
                            <div className="text-2xl font-semibold text-gray-900 mb-1">
                              {discount.active && Number(discount.percentage) > 0 && (
                                <div className="text-sm text-gray-500 line-through mb-1">
                                  ${base.toFixed(2)} {room.currency}
                                </div>
                              )}
                              <div className={discount.active && Number(discount.percentage) > 0 ? "text-red-600" : ""}>
                                ${discounted.toFixed(2)} {room.currency}
                              </div>
                              {discount.active && Number(discount.percentage) > 0 && (
                                <div className="text-xs text-green-600 font-medium">{discount.percentage}% OFF</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">per night</div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRoomIndex === index
                                  ? "border-red-500 bg-red-500"
                                  : "border-gray-300 hover:border-red-300"
                                }`}
                            >
                              {selectedRoomIndex === index && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <Bed className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No rooms available for selected dates</p>
                  <p className="text-sm mb-4">Try different dates or modify your search above</p>

                  {debugInfo && debugInfo.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                      <div className="flex items-center space-x-2 text-red-700 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Search Error</span>
                      </div>
                      <p className="text-sm text-red-600">{debugInfo.error}</p>
                    </div>
                  )}

                  <button
                    onClick={testHotelAvailability}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Test with Tomorrow's Date
                  </button>
                </div>
              )}
            </div>

            {processedAmenities.length > 0 && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold mb-6">What this place offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(showAllAmenities ? processedAmenities : processedAmenities.slice(0, 10)).map((amenity, index) => {
                    const IconComponent = amenity.icon
                    return (
                      <div key={index} className="flex items-center space-x-4 py-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">{amenity.name}</span>
                      </div>
                    )
                  })}
                </div>
                {processedAmenities.length > 10 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-6 px-6 py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <span>Show {showAllAmenities ? "less" : `all ${processedAmenities.length}`} amenities</span>
                    {showAllAmenities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-baseline space-x-2 mb-6">
                  {discount.active && Number(discount.percentage) > 0 && selectedRoom && (
                    <span className="text-lg text-gray-500 line-through">
                      ${getRoomBasePrice(selectedRoom).toFixed(2)}
                    </span>
                  )}
                  <span
                    className={`text-2xl font-semibold ${discount.active && Number(discount.percentage) > 0 ? "text-red-600" : ""
                      }`}
                  >
                    ${getSelectedRoomPrice().toFixed(2)}
                  </span>
                  <span className="text-gray-600">night</span>
                  {selectedRoom && <span className="text-sm text-gray-500">({selectedRoom.currency})</span>}
                  {discount.active && Number(discount.percentage) > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      {discount.percentage}% OFF
                    </span>
                  )}
                </div>

                {selectedRoom && (
                  <>
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Check className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Selected Room</span>
                      </div>
                      <p className="text-sm text-red-700">{selectedRoom.description || selectedRoom.name}</p>
                    </div>

                    {/* quick facts */}
                    <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                      {selectedRoom.paymentType && (
                        <div className="px-2 py-1 rounded bg-gray-100 text-gray-800">
                          Payment: {selectedRoom.paymentType.replace(/_/g, " ")}
                        </div>
                      )}
                      <div
                        className={
                          "px-2 py-1 rounded " +
                          (selectedRoom.refundable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")
                        }
                      >
                        {selectedRoom.refundable ? "Refundable" : "Non-refundable"}
                      </div>
                      {selectedRoom.board && (
                        <div className="px-2 py-1 rounded bg-violet-100 text-violet-800">Board {selectedRoom.board}</div>
                      )}
                      {selectedRoom.markup && (
                        <div className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                          Markup: +{Math.round((selectedRoom.markup.pct ?? 0) * 100)}% (role{" "}
                          {selectedRoom.markup.roleNum})
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="border border-gray-300 rounded-lg mb-4">
                  <div className="grid grid-cols-2">
                    <div className="p-3 border-r border-gray-300">
                      <div className="text-xs font-semibold text-gray-700 uppercase mb-1">Check-in</div>
                      <input
                        type="date"
                        value={editableSearchParams?.checkIn || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => handleDateChange("checkIn", e.target.value)}
                        className="w-full text-sm border-0 p-0 focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Add date"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-700 uppercase mb-1">Check-out</div>
                      <input
                        type="date"
                        value={editableSearchParams?.checkOut || ""}
                        min={editableSearchParams?.checkIn || new Date().toISOString().split("T")[0]}
                        onChange={(e) => handleDateChange("checkOut", e.target.value)}
                        className="w-full text-sm border-0 p-0 focus:ring-0 focus:outline-none bg-transparent"
                        placeholder="Add date"
                      />
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-300">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Guests</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Adults:</span>
                          <button
                            onClick={() =>
                              handleGuestChange("adults", Math.max(1, (editableSearchParams?.adults || 1) - 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm">{editableSearchParams?.adults || 1}</span>
                          <button
                            onClick={() =>
                              handleGuestChange("adults", Math.min(6, (editableSearchParams?.adults || 1) + 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Children:</span>
                          <button
                            onClick={() =>
                              handleGuestChange("children", Math.max(0, (editableSearchParams?.children || 0) - 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm">{editableSearchParams?.children || 0}</span>
                          <button
                            onClick={() =>
                              handleGuestChange("children", Math.min(4, (editableSearchParams?.children || 0) + 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={hotelRooms.length === 0 || isUpdatingRooms || selectedRoomIndex < 0}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 mb-4 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingRooms ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : hotelRooms.length > 0 && selectedRoom ? (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Book Now - ${getSelectedRoomPrice().toFixed(2)}
                    </>
                  ) : (
                    "No rooms available"
                  )}
                </button>

                <p className="text-center text-sm text-gray-600 mb-4">You won't be charged yet</p>

                {editableSearchParams?.checkIn && editableSearchParams?.checkOut && selectedRoom && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="underline">
                        ${getSelectedRoomPrice().toFixed(2)} x {calculateNights()} nights
                      </span>
                      <span>${(getSelectedRoomPrice() * calculateNights()).toFixed(2)}</span>
                    </div>
                    {discount.active && Number(discount.percentage) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="underline">Discount savings</span>
                        <span>
                          -$
                          {(
                            (getRoomBasePrice(selectedRoom) - getSelectedRoomPrice()) *
                            calculateNights()
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span>$50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Service fee</span>
                      <span>$25</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${(getSelectedRoomPrice() * calculateNights() + 75).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column done */}
        </div>
      </div>
    </div>
  )
}

export default HotelModalRooms
