/* eslint-disable react/prop-types */
"use client"

import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { User, Wifi, Coffee, Tv, Bath, BadgePercent } from "lucide-react"
import { setBookingRoom } from "../../features/booking/bookingSlice"

/* —— iOS-friendly button tweaks —— */
const iosStyle = {
  WebkitAppearance      : "none",
  appearance            : "none",
  WebkitTapHighlightColor: "transparent",
  WebkitUserSelect      : "none",
  userSelect            : "none",
  transform             : "translateZ(0)",
  WebkitTransform       : "translateZ(0)",
  backfaceVisibility    : "hidden",
  WebkitBackfaceVisibility: "hidden",
}

/* —— Amenity icon helper —— */
const AmenityIcon = (a, size = 14) => {
  switch ((a || "").toLowerCase()) {
    case "wifi"     : return <Wifi size={size} />
    case "breakfast": return <Coffee size={size} />
    case "tv"       : return <Tv size={size} />
    case "bathroom" : return <Bath size={size} />
    default         : return null
  }
}

export default function RoomCard({
  room,
  hotel,
  checkIn,
  checkOut,
  isMobile = false,
}) {
  const dispatch                = useDispatch()
  const navigate                 = useNavigate()
  const { active, percentage }   = useSelector((s) => s.discount)

  const finalPrice = active
    ? Math.round(room.price * (1 - percentage / 100))
    : room.price

  const reserve = () => {
    dispatch(setBookingRoom({ room, hotel, checkIn, checkOut }))
    navigate("/checkout")
  }

  /* ───────── MOBILE ───────── */
  if (isMobile) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mx-4 mb-3">
        {/* Header */}
        <h3 className="text-lg font-semibold mb-1 leading-tight">
          {room.name}
        </h3>

        <p className="text-sm text-gray-600 mb-2">
          {room.beds} bed{room.beds > 1 && "s"} • up to {room.capacity} guests
        </p>

        {room.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.slice(0, 4).map((a, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
              >
                {AmenityIcon(a)} {a}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            {active && (
              <span className="text-sm text-gray-500 line-through">
                ${room.price}
              </span>
            )}
            <span className="text-xl font-bold ml-1">${finalPrice}</span>
            <span className="text-sm text-gray-600 ml-1">/night</span>
            {active && (
              <div className="flex items-center text-xs text-green-600 font-medium">
                <BadgePercent size={12} /> {percentage}% OFF
              </div>
            )}
          </div>

          <button
            onClick={reserve}
            style={{ ...iosStyle, backgroundColor: "#4f46e5" }}
            className="hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition min-h-[44px]"
          >
            Reserve
          </button>
        </div>
      </div>
    )
  }

  /* ───────── DESKTOP ───────── */
  return (
    <div className="relative flex border-l-4 border-indigo-600 bg-white rounded-xl shadow mb-6 overflow-hidden">
      {/* Info */}
      <div className="flex-1 p-6">
        <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
        {room.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
        )}

        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <User size={16} /> Up to {room.capacity}
          </span>
          <span>{room.beds} bed{room.beds > 1 && "s"}</span>
        </div>

        {/* Amenities (max 6 to avoid clutter) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {(room.amenities || []).slice(0, 6).map((a, i) => (
            <span key={i} className="flex items-center gap-1 text-sm">
              {AmenityIcon(a, 16)} {a}
            </span>
          ))}
        </div>
      </div>

      {/* Price & CTA */}
      <div className="flex flex-col items-center justify-center px-6 py-4 bg-gray-50 min-w-[220px]">
        <div className="text-center mb-4">
          {active && (
            <span className="text-sm text-gray-500 line-through mr-1">
              ${room.price}
            </span>
          )}
          <span className="text-2xl font-semibold">${finalPrice}</span>
          <span className="block text-sm text-gray-600">per night</span>
          {active && (
            <div className="flex items-center justify-center text-xs text-green-600 font-medium">
              <BadgePercent size={12} /> {percentage}% OFF
            </div>
          )}
        </div>

        <button
          onClick={reserve}
          style={{ ...iosStyle, backgroundColor: "#4f46e5" }}
          className="w-full py-2 text-white rounded-md font-medium hover:bg-indigo-700 transition min-h-[44px]"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}
