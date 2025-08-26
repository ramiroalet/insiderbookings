"use client"

import { Star, Heart } from "lucide-react"
import { useState } from "react"

export default function MobileHotelCard({ hotel, nights = 2 }) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
      {/* Image */}
      <div className="relative">
        <img
          src={hotel.image || `/placeholder.svg?height=200&width=300`}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>
        <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md">
          <span className="text-xs font-medium text-gray-900">Favorito entre huéspedes</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{hotel.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{hotel.address}</p>
          </div>
          <div className="flex items-center ml-2">
            <Star className="w-3 h-3 text-gray-900 fill-current" />
            <span className="text-xs font-medium text-gray-900 ml-1">{hotel.rating || "4.8"}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-3">
          <span className="text-sm font-semibold text-gray-900">
            ${hotel.price || "149"} USD por {nights} noches
          </span>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600">
              {hotel.amenities.slice(0, 2).join(" • ")}
              {hotel.amenities.length > 2 && ` • +${hotel.amenities.length - 2} más servicios`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
