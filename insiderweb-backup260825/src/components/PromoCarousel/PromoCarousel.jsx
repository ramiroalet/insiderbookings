"use client"

import { useNavigate } from "react-router-dom"
import { Star, MapPin, Users } from "lucide-react"

/**
 * PromoCarousel
 * Displays a 2-column grid of featured hotels similar to the provided design.
 * Each card shows: image, name, date range, total price and rating.
 * No favorite icon or "Guest favourite" badge.
 * The entire card is clickable and navigates to /hotels/:id/rooms
 */
const PromoCarousel = ({ hotels }) => {
  const navigate = useNavigate()
  const handleHotelClick = (id) => navigate(`/hotels/${id}/rooms`)

  if (!hotels?.length) return null

  return (
    <section className="mb-8 lg:mb-12">
      {/* Title */}
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-900">Popular places to stay nearby</h2>

      {/* 2-column grid of cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        {hotels.map((hotel) => {
          const nights = hotel.nights || 2

          // 1) Convertir price a número de forma segura
          const rawPrice = Number(hotel.price) || 0
          const totalPrice = hotel.totalPrice ?? rawPrice * nights

          const dateRange = hotel.dateRange || hotel.dates || ""

          // Procesar amenities como en HotelCard
          const amenitiesData = hotel.amenities
          let amenitiesList = []

          if (Array.isArray(amenitiesData)) {
            amenitiesList = amenitiesData
          } else if (amenitiesData && typeof amenitiesData === "object") {
            amenitiesList = [
              ...(amenitiesData.pools || []),
              ...(amenitiesData.dining || []),
              ...(amenitiesData.in_room || []),
              ...(amenitiesData.services || []),
            ]
          }

          // Fallback si no hay nada
          if (amenitiesList.length === 0) {
            amenitiesList = ["WiFi", "Breakfast"]
          }

          // Tomar las primeras 2-3 para mostrar en móvil
          const displayAmenities = amenitiesList.slice(0, 3)

          return (
            <div
              key={hotel.id}
              onClick={() => handleHotelClick(hotel.id)}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
            >
              {/* Image container with overlay */}
              <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                <img
                  src={hotel.image || "/placeholder.svg?height=300&width=400"}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Overlay with hotel info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 mb-1">{hotel.name}</h3>
                    <div className="flex items-start gap-1 text-xs opacity-90">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{hotel.address || `${hotel.location || "Miami Beach"}, FL`}</span>
                    </div>
                    {hotel.zipCode && <span className="text-xs opacity-75">{hotel.zipCode}</span>}
                  </div>
                </div>
              </div>

              {/* Information section */}
              <div className="p-2 sm:p-3 lg:p-4 space-y-2">
                {/* Rating and price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{hotel.rating || "4.5"}</span>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-600">from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-semibold text-gray-900">
                          £{totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        for {nights} night{nights > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amenities - optimized for mobile */}
                {displayAmenities.length > 0 && (
                  <div className="space-y-1">
                    {displayAmenities.slice(0, 2).map((amenity, index) => (
                      <div key={index} className="text-xs text-gray-600 line-clamp-1">
                        {amenity}
                      </div>
                    ))}
                    {displayAmenities.length > 2 && (
                      <div className="text-xs text-gray-500">+{displayAmenities.length - 2} more amenities</div>
                    )}
                  </div>
                )}

                {/* Guest capacity */}
                {hotel.maxGuests && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    <span>Max {hotel.maxGuests} guests</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Optional "Show more" button */}
      {hotels.length > 6 && (
        <div className="text-center mt-6 sm:mt-8">
          <button className="text-yellow-600 hover:text-yellow-700 font-medium text-xs sm:text-sm border border-yellow-600 hover:border-yellow-700 px-4 sm:px-6 py-2 rounded-lg transition-colors">
            Show more properties
          </button>
        </div>
      )}
    </section>
  )
}

export default PromoCarousel
