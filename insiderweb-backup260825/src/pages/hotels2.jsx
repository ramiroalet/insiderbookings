"use client"
import { useEffect, useState, useMemo } from "react"
import {
  Loader2,
  Search,
  ChevronDown,
  Filter,
  X,
  Eye,
  Shield,
  Calendar,
  HeadphonesIcon,
  Mail,
  CheckCircle,
  User,
  Heart,
  Percent,
  Sparkles,
  MapPin,
  Building,
} from "lucide-react"
import { useDestinations } from "../hooks/use-destinations"
import { useRooms } from "../hooks/use-rooms"
import { useBoards } from "../hooks/use-boards"
import HotelDetailsModal from "../components/HotelDetailsModal"
import HotelModalRooms from "../components/HotalModalRooms"
import HotelCard from "../components/HotelCard/HotelCard"
import HotelSlider from "../components/HotelSlider/Hotel-slider"
import { useSelector } from "react-redux"

const API_URL = import.meta.env.VITE_API_URL
const HOTELS_URL = `${API_URL}/tgx/getHotels?access=2`
const SEARCH_URL = `${API_URL}/tgx/search`

const HotelSearch = () => {
  const [hotels, setHotels] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [listError, setListError] = useState(null)
  const { isLoggedIn, user } = useSelector((s) => s.auth)

  console.log(user, "user")

  // Estados de búsqueda
  const [searchParams, setSearchParams] = useState({
    selectedHotel: null,
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    currency: "EUR",
    refundableMode: "any",
    paymentMethod: "",
    certCase: "",
  })



  // Resultados
  const [searchResults, setSearchResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Dropdowns
  const [showHotelDropdown, setShowHotelDropdown] = useState(false)
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)
  const [showDestinationsDropdown, setShowDestinationsDropdown] = useState(false)

  // Filtros (maestro)
  const [filters, setFilters] = useState({
    categories: [],
    destinations: [],
    destinationType: "all", // all | CITY | ZONE
    rooms: [],
    boards: [],
    priceRange: { min: 0, max: 1000 },
  })

  // Otros estados
  const [favorites, setFavorites] = useState(new Set())
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [selectedHotelForAirbnb, setSelectedHotelForAirbnb] = useState(null)
  const [showAirbnbModal, setShowAirbnbModal] = useState(false)

  // Paginación
  const [allHotels, setAllHotels] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextToken, setNextToken] = useState("")
  const [hasMoreHotels, setHasMoreHotels] = useState(true)

  // Precios reales (si usas checker externo)
  const [realPrices, setRealPrices] = useState({})
  const [showPriceChecker, setShowPriceChecker] = useState(false)

  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("discover")
  const [isMobile, setIsMobile] = useState(false)

  // Hooks TGX
  const { cities, zones, loading: destinationsLoading, getDestinationText } = useDestinations()
  const { rooms, loading: roomsLoading, getRoomText } = useRooms()
  const { boards, loading: boardsLoading, getBoardText } = useBoards()


  console.log(hotels, "hotels")

  // ⬇️ Descuento global
  const discount = useSelector((state) => state.discount)
  const hasSpecial =
    Number.isFinite(Number(discount?.specialDiscountPrice)) && Number(discount?.specialDiscountPrice) > 0
  const hasActiveDiscount = !!discount?.active
  const validatorName =
    typeof discount?.validatedBy === "string" ? discount?.validatedBy : discount?.validatedBy?.name || null
  const discountShortText = hasSpecial
    ? `Special rate ${discount.specialDiscountPrice} ${searchParams.currency}/night`
    : `${Number(discount?.percentage || 0)}% OFF`

  // Helpers de precio
  const baseForClient = (obj) => Number(obj?.priceUser ?? obj?.price)
  const calculateDiscountedPrice = (originalPrice) => {
    if (!discount.active) return originalPrice
    if (discount.specialDiscountPrice !== null && Number.isFinite(+discount.specialDiscountPrice)) {
      return +discount.specialDiscountPrice
    }
    if (discount.percentage) {
      const discountAmount = (originalPrice * discount.percentage) / 100
      return originalPrice - discountAmount
    }
    return originalPrice
  }
  const getBasePrice = (hotel) => {
    let originalPrice = null
    if (hotel.Rooms?.length) {
      originalPrice = Math.min(
        ...hotel.Rooms.map((r) => baseForClient(r)).filter((n) => Number.isFinite(n) && n > 0),
      )
    } else {
      originalPrice = baseForClient(hotel)
    }
    return Number.isFinite(originalPrice) ? calculateDiscountedPrice(originalPrice) : null
  }

  // Cargar hoteles iniciales
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoadingList(true)
        const res = await fetch(HOTELS_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        if (!data.edges || !Array.isArray(data.edges)) {
          setHotels([])
          setAllHotels([])
          return
        }
        const hotelData = data.edges.map((e) => e.node?.hotelData).filter(Boolean)
        setHotels(hotelData)
        setAllHotels(hotelData)
        setNextToken(data.nextToken || "")
        setHasMoreHotels(!!data.nextToken)
      } catch (err) {
        setListError(err.message || "Failed to load hotels")
      } finally {
        setLoadingList(false)
      }
    }
    loadHotels()
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Cargar más hoteles
  const loadMoreHotels = async () => {
    if (!nextToken || loadingMore) return
    setLoadingMore(true)
    try {
      const url = `${HOTELS_URL}&nextToken=${nextToken}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Network error")
      const data = await res.json()
      const newHotels = data.edges?.map((e) => e.node?.hotelData).filter(Boolean) || []
      const updatedHotels = [...allHotels, ...newHotels]
      setAllHotels(updatedHotels)
      setHotels(updatedHotels)
      setNextToken(data.nextToken || "")
      setHasMoreHotels(!!data.nextToken)
    } catch {
      // noop
    } finally {
      setLoadingMore(false)
    }
  }

  /* ───────────────────────────────
     FILTRO EN MEMORIA POR DESTINATIONS
  ─────────────────────────────── */
  const filteredHotels = useMemo(() => {
    let filtered = [...allHotels]

    if (filters.categories.length > 0) {
      filtered = filtered.filter((hotel) => filters.categories.includes(hotel.categoryCode))
    }

    if (filters.destinations.length > 0) {
      filtered = filtered.filter((hotel) => {
        const hotelDestinations = [
          hotel.location?.city,
          hotel.location?.country,
          hotel.location?.zone,
          hotel.destinationCode,
          hotel.location?.destinationCode,
        ].filter(Boolean)

        return filters.destinations.some((selectedDest) => {
          if (hotelDestinations.some((dest) => dest === selectedDest)) return true
          const selectedDestination = [...cities, ...zones].find((d) => d.code === selectedDest)
          if (selectedDestination) {
            const destText = getDestinationText(selectedDestination).toLowerCase()
            return hotelDestinations.some((dest) => dest && dest.toLowerCase().includes(destText))
          }
          return false
        })
      })
    }
    return filtered
  }, [allHotels, filters, cities, zones, getDestinationText])

  const enriched = filteredHotels?.map((h) => ({ ...h, basePrice: getBasePrice(h) })) || []

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
          let area = hotel.location?.city || hotel.location?.country || hotel.city || "Available Hotels"
          if (area.includes("South Beach")) area = "Available in South Beach"
          else if (area.includes("North Beach")) area = "Available in North Beach"
          else if (area.includes("Mid-Beach")) area = "Available in Mid-Beach"
          else if (area.includes("Hollywood")) area = "Available in Hollywood Beach"
          else area = "Available Hotels"
          category = area
        }
      }
      if (!acc[category]) acc[category] = []
      acc[category].push(hotel)
      return acc
    }, {})
  }

  // Agrupar resultados de búsqueda
  const groupSearchResultsByHotel = (results) => {
    if (!results || results.length === 0) return []
    const hotelMap = new Map()
    results.forEach((result) => {
      const hotelCode = result.hotelCode
      const hotelName = result.hotelName
      const currentBase = baseForClient(result)
      if (!hotelMap.has(hotelCode)) {
        hotelMap.set(hotelCode, {
          hotelCode,
          hotelName,
          price: result.price,
          priceUser: result.priceUser,
          currency: result.currency,
          refundable: result.refundable,
          paymentType: result.paymentType,
          rateKey: result.rateKey,
          name: hotelName,
          basePrice: Number.parseFloat(currentBase),
          isSearchResult: true,
          allRooms: result.rooms || [],
        })
      } else {
        const existingHotel = hotelMap.get(hotelCode)
        if (Number(currentBase) < existingHotel.basePrice) {
          existingHotel.price = result.price
          existingHotel.priceUser = result.priceUser
          existingHotel.basePrice = Number(currentBase)
          existingHotel.refundable = result.refundable
          existingHotel.paymentType = result.paymentType
          existingHotel.rateKey = result.rateKey
        }
        if (result.rooms) {
          existingHotel.allRooms = [...existingHotel.allRooms, ...result.rooms]
        }
      }
    })
    return Array.from(hotelMap.values())
  }

  const displayHotels = searchResults.length > 0 ? searchResults : enriched
  const groupedSearchHotels = groupSearchResultsByHotel(searchResults)
  const hotelGroups =
    searchResults.length > 0 ? { "Search Results": groupedSearchHotels } : groupHotelsByCategory(enriched)

  // Ejecutar búsqueda
  const executeSearch = async () => {
    const effectiveRole = Number.isFinite(+user?.role) ? +user.role : 1
    const ensured = { ...searchParams }
    if (!ensured.checkIn || !ensured.checkOut) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      ensured.checkIn = today.toISOString().split("T")[0]
      ensured.checkOut = tomorrow.toISOString().split("T")[0]
      setSearchParams((prev) => ({ ...prev, checkIn: ensured.checkIn, checkOut: ensured.checkOut }))
    }

    setLoadingSearch(true)
    setSearchError(null)

    try {
      const occupancies = `${ensured.adults}|${ensured.children}`
      const qp = new URLSearchParams({
        checkIn: ensured.checkIn,
        checkOut: ensured.checkOut,
        occupancies,
        currency: ensured.currency.toUpperCase(),
        ...(ensured.selectedHotel && { hotelCodes: ensured.selectedHotel.hotelCode }),
      })

      if (ensured.refundableMode === "refundable") qp.set("refundableMode", "refundable")
      else if (ensured.refundableMode === "non_refundable") qp.set("refundableMode", "non_refundable")
      if (ensured.paymentMethod) qp.set("paymentMethod", ensured.paymentMethod)
      if (ensured.certCase) qp.set("certCase", ensured.certCase)

      qp.set("user_role", String(effectiveRole))
      qp.set("_role", String(effectiveRole))
      qp.set("_ts", String(Date.now()))

      const url = `${SEARCH_URL}?${qp.toString()}`
      const res = await fetch(url, { cache: "no-store", credentials: "omit" })

      if (!res.ok) {
        const errorData = await res.text()
        throw new Error(`Search failed: ${res.status} ${res.statusText} — ${errorData}`)
      }

      const results = await res.json()
      if (!results || results.length === 0) {
        setSearchError("No hotels found for your search criteria. Please try different dates or parameters.")
        setSearchResults([])
      } else {
        setSearchResults(results)
      }
      setShowResults(true)
    } catch (err) {
      setSearchError(err.message || "Search failed. Please try again.")
      setSearchResults([])
      setShowResults(true)
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    executeSearch()
  }

  const handleFiltersChange = (newFiltersPartial) =>
    setFilters((prev) => ({ ...prev, ...newFiltersPartial }))

  const toggleFavorite = (hotelCode) => {
    const next = new Set(favorites)
    if (next.has(hotelCode)) next.delete(hotelCode)
    else next.add(hotelCode)
    setFavorites(next)
  }

  const toggleCompare = (hotel) => {
    const isIn = compareList.find((h) => h.hotelCode === hotel.hotelCode)
    if (isIn) setCompareList(compareList.filter((h) => h.hotelCode !== hotel.hotelCode))
    else if (compareList.length < 3) setCompareList([...compareList, hotel])
  }

  const openHotelDetails = (hotel) => {
    setSelectedHotelForDetails(hotel)
    setShowDetailsModal(true)
  }

  const openHotelAirbnbDetails = (hotel) => {
    setSelectedHotelForAirbnb(hotel)
    setShowAirbnbModal(true)
  }

  const handleBooking = (bookingData) => {
    console.log("Booking data:", bookingData)
  }

  const handlePricesLoaded = (prices) => setRealPrices(prices)

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

  const handleDiscountClick = () => {
    console.log("Navigate to discount page")
  }

  /* UI — Banner de descuento */
  const DiscountBanner = () =>
    hasActiveDiscount ? (
      <div className="mx-auto mt-3 max-w-4xl animate-in fade-in slide-in-from-top-2">
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Percent className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-green-800">
              {discount.code ? `Code ${discount.code}` : "Special discount"} —{" "}
              {hasSpecial
                ? `Special rate ${discount.specialDiscountPrice} ${searchParams.currency}/night`
                : `${Number(discount?.percentage || 0)}% OFF`}
            </div>
            <div className="text-xs text-green-700">
              Applied to all shown prices{validatorName ? ` • validated by ${validatorName}` : ""}
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-green-600" />
        </div>
      </div>
    ) : null

  /* ───────────────────────────────
     Dropdown "Destinations" dentro de WHERE
  ─────────────────────────────── */
  const handleDestinationTypeChange = (value) =>
    setFilters((prev) => ({ ...prev, destinationType: value }))

  const handleDestinationToggle = (code) =>
    setFilters((prev) => ({
      ...prev,
      destinations: prev.destinations.includes(code)
        ? prev.destinations.filter((c) => c !== code)
        : [...prev.destinations, code],
    }))

  const clearDestinationFilters = () =>
    setFilters((prev) => ({ ...prev, destinations: [], destinationType: "all" }))

  return (
    <div className={`min-h-screen bg-white ${isMobile ? "pb-20" : ""}`}>
      {/* HERO + SEARCH */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSearch}>
              {/* Barra más fina */}
              <div className="bg-white rounded-md border border-gray-200 p-1 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                  {/* Where */}
                  <div className="p-2 border-r border-gray-200 relative space-y-1">
                    <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Where</label>

                    {/* Selector de hotel */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowHotelDropdown(!showHotelDropdown)
                        setShowDestinationsDropdown(false)
                      }}
                      className="w-full h-9 text-left text-[13px] text-gray-900 focus:outline-none flex items-center justify-between"
                    >
                      <span>
                        {searchParams.selectedHotel
                          ? searchParams.selectedHotel.hotelName
                          : `All Hotels (${filteredHotels.length} available)`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {showHotelDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto left-0 right-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchParams((prev) => ({ ...prev, selectedHotel: null }))
                            setShowHotelDropdown(false)
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 text-sm"
                        >
                          All Hotels ({filteredHotels.length} available)
                        </button>
                        {filteredHotels.map((hotel) => (
                          <button
                            key={hotel.hotelCode}
                            type="button"
                            onClick={() => {
                              setSearchParams((prev) => ({ ...prev, selectedHotel: hotel }))
                              setShowHotelDropdown(false)
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                          >
                            <div className="font-medium">{hotel.hotelName}</div>
                            <div className="text-xs text-gray-500">
                              {hotel.location?.city}, {hotel.location?.country}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Destinations dentro del search bar */}
                    <div className="mt-1">
                      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Destinations</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDestinationsDropdown(!showDestinationsDropdown)
                          setShowHotelDropdown(false)
                        }}
                        className="w-full h-9 rounded-md border border-gray-300 px-2 text-left text-[13px] text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="truncate">
                          {filters.destinations.length > 0 ? `${filters.destinations.length} selected` : "Any"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      {showDestinationsDropdown && (
                        <div className="absolute z-20 mt-1 w-[min(42rem,calc(100vw-2rem))] bg-white border border-gray-300 rounded-lg shadow-lg p-3 left-0">
                          {/* Tipo de destino */}
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">Destination Type</div>
                            <div className="flex gap-3">
                              {[
                                { v: "all", label: "All" },
                                { v: "CITY", label: "Cities" },
                                { v: "ZONE", label: "Zones" },
                              ].map((opt) => (
                                <label key={opt.v} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="radio"
                                    name="destinationType"
                                    value={opt.v}
                                    checked={filters.destinationType === opt.v}
                                    onChange={(e) => handleDestinationTypeChange(e.target.value)}
                                    className="text-red-600 focus:ring-red-500"
                                  />
                                  {opt.label}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Lista de destinos (chips horizontales) */}
                          <div className="max-h-48 overflow-y-auto">
                            <div className="flex flex-wrap gap-1.5">
                              {(filters.destinationType === "all" || filters.destinationType === "CITY") &&
                                cities.slice(0, 20).map((d) => {
                                  const active = filters.destinations.includes(d.code)
                                  return (
                                    <button
                                      key={d.code}
                                      type="button"
                                      onClick={() => handleDestinationToggle(d.code)}
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs
                                        ${active
                                          ? "bg-red-50 border-red-300 text-red-700"
                                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                                      title={`${getDestinationText(d)} (${d.code})`}
                                    >
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {getDestinationText(d)} ({d.code})
                                    </button>
                                  )
                                })}

                              {(filters.destinationType === "all" || filters.destinationType === "ZONE") &&
                                zones.slice(0, 20).map((d) => {
                                  const active = filters.destinations.includes(d.code)
                                  return (
                                    <button
                                      key={d.code}
                                      type="button"
                                      onClick={() => handleDestinationToggle(d.code)}
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs
                                        ${active
                                          ? "bg-blue-50 border-blue-300 text-blue-700"
                                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                                      title={`${getDestinationText(d)} (${d.code})`}
                                    >
                                      <Building className="h-3 w-3 mr-1" />
                                      {getDestinationText(d)} ({d.code})
                                    </button>
                                  )
                                })}
                            </div>

                            {((filters.destinationType === "all" || filters.destinationType === "CITY") &&
                              cities.length > 20) ||
                            ((filters.destinationType === "all" || filters.destinationType === "ZONE") &&
                              zones.length > 20) ? (
                              <div className="text-[11px] text-gray-500 mt-2">
                                Showing first 20. Narrow by type to see more.
                              </div>
                            ) : null}
                          </div>

                          {/* Acciones */}
                          <div className="mt-3 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={clearDestinationFilters}
                              className="text-xs text-gray-600 hover:text-gray-800 underline"
                            >
                              Clear destinations
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDestinationsDropdown(false)}
                              className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-black"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-in */}
                  <div className="p-2 border-r border-gray-200">
                    <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Check-in</label>
                    <input
                      type="date"
                      value={searchParams.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSearchParams((prev) => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full text-[13px] text-gray-900 border-0 p-0 h-9 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  {/* Check-out */}
                  <div className="p-2 border-r border-gray-200">
                    <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Check-out</label>
                    <input
                      type="date"
                      value={searchParams.checkOut}
                      min={searchParams.checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSearchParams((prev) => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full text-[13px] text-gray-900 border-0 p-0 h-9 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  {/* Who + Search */}
                  <div className="flex items-center">
                    <div className="p-2 flex-1 relative">
                      <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Who</label>
                      <button
                        type="button"
                        onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                        className="w-full h-9 text-left text-[13px] text-gray-900 focus:outline-none flex items-center justify-between"
                      >
                        <span>
                          {searchParams.adults} guest{searchParams.adults !== 1 ? "s" : ""}, 1 room
                          {searchParams.children > 0 &&
                            `, ${searchParams.children} child${searchParams.children !== 1 ? "ren" : ""}`}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      {showGuestsDropdown && (
                        <div className="absolute z-20 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 right-0">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Adults</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSearchParams((prev) => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))
                                  }
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{searchParams.adults}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSearchParams((prev) => ({ ...prev, adults: Math.min(6, prev.adults + 1) }))
                                  }
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Children</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSearchParams((prev) => ({ ...prev, children: Math.max(0, prev.children - 1) }))
                                  }
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{searchParams.children}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSearchParams((prev) => ({ ...prev, children: Math.min(4, prev.children + 1) }))
                                  }
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowGuestsDropdown(false)}
                              className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={loadingSearch}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                      {loadingSearch ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Banner descuento */}
            <DiscountBanner />

            {searchError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{searchError}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promo “Have a code?” */}
      <section className="mx-auto -mt-6 max-w-md px-3 py-0 sm:-mt-8 sm:px-4">
        <div
          onClick={handleDiscountClick}
          className="group relative cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-3 shadow transition-transform duration-300 hover:scale-[1.03] hover:shadow-md"
        >
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-blue-400 opacity-0 transition-opacity duration-500 group-hover:opacity-15" />
          <div className="pointer-events-none absolute -right-2 -top-2 h-10 w-10 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Percent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white leading-none">Have a code?</h3>
                <p className="text-blue-100 text-xs leading-tight">Unlock exclusive offers</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-1">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/30">
                Unlock →
              </span>
            </div>
          </div>

          <div className="sm:hidden mt-2 text-center">
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/30">
              <Sparkles className="h-3 w-3 text-yellow-300" />
              <span>Unlock</span>
            </span>
          </div>
        </div>
      </section>

      {/* Secciones / Sliders */}
      <section className="mx-auto max-w-7xl py-2">
        {loadingList ? (
          <div className="flex flex-col items-center p-8 text-gray-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            <p>Loading hotels…</p>
          </div>
        ) : loadingSearch ? (
          <div className="flex flex-col items-center p-8 text-gray-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p>Searching hotels with your dates...</p>
          </div>
        ) : (
          <>
            {searchError && (
              <div className="mx-4 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{searchError}</p>
              </div>
            )}

            {Object.entries(hotelGroups)
              .sort(([a], [b]) => {
                const order = {
                  "Search Results": 0,
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
                <HotelSlider
                  key={cat}
                  title={cat}
                  hotels={hotels}
                  showArrow
                  searchParams={searchResults.length > 0 ? searchParams : undefined}
                  onHotelClick={openHotelAirbnbDetails}
                />
              ))}
            {Object.keys(hotelGroups).length === 0 && displayHotels.length > 0 && (
              <HotelSlider
                title="All Available Stays"
                hotels={displayHotels}
                showArrow
                onHotelClick={openHotelAirbnbDetails}
              />
            )}

            {filteredHotels.length === 0 && allHotels.length > 0 && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No hotels match your current filters</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters to see more results</p>
                <button
                  onClick={() =>
                    setFilters({
                      categories: [],
                      destinations: [],
                      destinationType: "all",
                      rooms: [],
                      boards: [],
                      priceRange: { min: 0, max: 1000 },
                    })
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {hasMoreHotels && filteredHotels.length > 0 && searchResults.length === 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreHotels}
                  disabled={loadingMore}
                  className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading more hotels...</span>
                    </>
                  ) : (
                    <>
                      <span>Load more hotels</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: <Shield className="h-8 w-8 text-red-600" />,
              title: "Best-Price Guarantee",
              text: "Find a lower price? We'll refund the difference and give you an extra 10% off.",
            },
            {
              icon: <Calendar className="h-8 w-8 text-red-600" />,
              title: "Free Cancellation",
              text: "Plans change. Most bookings can be cancelled for free up to 24 hours before arrival.",
            },
            {
              icon: <HeadphonesIcon className="h-8 w-8 text-red-600" />,
              title: "24/7 Support",
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

      {/* NEWSLETTER */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Join Insider Bookings Today</h2>
          <p className="mb-8 text-lg text-red-100">Subscribe for exclusive deals, travel tips, and more!</p>
          {isSubmitted ? (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-green-500 p-4 text-white animate-in slide-in-from-bottom-2 fade-in duration-300">
              <CheckCircle className="h-5 w-5" />
              <span>Thank you! You're now subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full px-6 py-4 text-lg text-gray-8 00 focus:outline-none focus:ring-4 focus:ring-white/30"
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

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="text-3xl font-bold text-red-500 mb-4">
                insider<span className="text-white">bookings</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Transforming the hospitality industry through innovative technology,
                strategic partnerships, and unparalleled guest experiences.
              </p>
              <div className="flex space-x-4">
                {["LinkedIn", "Twitter", "Instagram"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    <span className="text-sm font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Solutions</h4>
              <ul className="space-y-3">
                {[
                  "Revenue Optimization",
                  "Guest Experience",
                  "Analytics Platform",
                  "Automation Suite",
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {["Partner Portal", "Documentation", "24/7 Support", "Training"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Insider Bookings. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-around py-2">
            {[
              { id: "discover", icon: Search, label: "Discover" },
              { id: "favorites", icon: Heart, label: "Favorites" },
              { id: "profile", icon: User, label: "Sign in" },
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

      {/* Compare, Modals */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 transition-transform duration-300 ${
          compareList.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compare Hotels ({compareList.length}/3)</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCompare(true)}
                disabled={compareList.length < 2}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button onClick={() => setCompareList([])} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareList.map((hotel) => (
              <HotelCard
                key={hotel.hotelCode}
                hotel={hotel}
                showActions={false}
                searchParams={searchParams}
                onViewDetails={openHotelAirbnbDetails}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={toggleCompare}
                favorites={favorites}
                compareList={compareList}
              />
            ))}
          </div>
        </div>
      </div>

      <HotelDetailsModal
        hotel={selectedHotelForDetails}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onBook={handleBooking}
      />

      <HotelModalRooms
        hotel={selectedHotelForAirbnb}
        isOpen={showAirbnbModal}
        onClose={() => setShowAirbnbModal(false)}
        onBook={handleBooking}
        searchParams={searchParams}
      />
    </div>
  )
}

export default HotelSearch
