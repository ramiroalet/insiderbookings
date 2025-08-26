"use client"
import { useState, useEffect } from "react"
import { Star, Heart, Eye, ContrastIcon as Compare, Loader2, DollarSign } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

const HotelCard = ({
  hotel,
  index,
  showActions = true,
  searchParams,
  onViewDetails,
  onToggleFavorite,
  onToggleCompare,
  favorites,
  compareList,
}) => {
  const [priceInfo, setPriceInfo] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [priceError, setPriceError] = useState(false)

  // Función para obtener precio real del hotel
  const fetchRealPrice = async () => {
    if (!searchParams?.checkIn || !searchParams?.checkOut) return

    setLoadingPrice(true)
    setPriceError(false)

    try {
      const occupancies = `${searchParams.adults || 1}|${searchParams.children || 0}`
      const queryParams = new URLSearchParams({
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        occupancies,
        currency: searchParams.currency || "EUR",
        hotelCodes: hotel.hotelCode,
      })

      const response = await fetch(`${API_URL}/tgx/search?${queryParams}`)

      if (response.ok) {
        const results = await response.json()
        if (results.length > 0 && results[0].rooms?.length > 0) {
          const minPrice = Math.min(...results[0].rooms.map((room) => Number.parseFloat(room.price) || 0))
          setPriceInfo({
            price: minPrice,
            currency: results[0].currency || "EUR",
            available: true,
            roomCount: results[0].rooms.length,
          })
        } else {
          setPriceInfo({ available: false })
        }
      } else {
        setPriceError(true)
      }
    } catch (error) {
      console.error("Error fetching price:", error)
      setPriceError(true)
    } finally {
      setLoadingPrice(false)
    }
  }

  // Cargar precio cuando hay fechas disponibles
  useEffect(() => {
    if (searchParams?.checkIn && searchParams?.checkOut) {
      fetchRealPrice()
    }
  }, [searchParams?.checkIn, searchParams?.checkOut, hotel.hotelCode])

  const renderPriceSection = () => {
    if (loadingPrice) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">Loading price...</span>
        </div>
      )
    }

    if (priceError) {
      return (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Price unavailable</span>
        </div>
      )
    }

    if (priceInfo?.available === false) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600 font-medium">No availability</span>
        </div>
      )
    }

    if (priceInfo?.available) {
      return (
        <div>
          <span className="text-sm text-gray-500">From </span>
          <span className="font-semibold text-green-600">
            ${priceInfo.price} {priceInfo.currency}
          </span>
          <div className="text-xs text-gray-500">
            {priceInfo.roomCount} room{priceInfo.roomCount !== 1 ? "s" : ""} available
          </div>
        </div>
      )
    }

    // Fallback cuando no hay fechas seleccionadas
    return (
      <div>
        <span className="text-sm text-gray-500">Select dates </span>
        <span className="font-semibold text-gray-400">for pricing</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative group">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <span className="text-4xl font-bold text-white opacity-80">{hotel.hotelName.slice(0, 1)}</span>
        </div>

        {showActions && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={() => onToggleFavorite(hotel.hotelCode)}
              className={`p-2 rounded-full transition-colors ${
                favorites.has(hotel.hotelCode) ? "bg-red-500 text-white" : "bg-white/80 hover:bg-white text-gray-600"
              }`}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleCompare(hotel)}
              className={`p-2 rounded-full transition-colors ${
                compareList.find((h) => h.hotelCode === hotel.hotelCode)
                  ? "bg-blue-500 text-white"
                  : "bg-white/80 hover:bg-white text-gray-600"
              }`}
            >
              <Compare className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center bg-white/90 rounded px-2 py-1">
          <span className="text-sm font-medium text-gray-800">{hotel.categoryCode || "4"}.0</span>
          <Star className="h-3 w-3 text-yellow-400 fill-current ml-1" />
        </div>

        {/* Availability indicator */}
        {priceInfo?.available === true && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Available
          </div>
        )}
        {priceInfo?.available === false && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            No rooms
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{hotel.hotelName}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {hotel.location?.address && <span className="block">{hotel.location.address}</span>}
          <span>
            {hotel.location?.city || "Miami Beach"}, {hotel.location?.country || "Florida"}
          </span>
          {hotel.location?.zipCode && <span className="text-xs text-gray-500 ml-1">({hotel.location.zipCode})</span>}
        </p>

        <div className="flex items-center justify-between mb-2">{renderPriceSection()}</div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {hotel.descriptions?.[0]?.texts?.[0]?.text ||
            "Luxury hotel with premium amenities and excellent service in prime location."}
        </p>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(hotel)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </button>
            {priceInfo?.available && (
              <button
                onClick={() => fetchRealPrice()}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
              >
                Check
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelCard
