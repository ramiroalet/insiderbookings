/* ────────────────────────────────────────────────
   src/components/HotelSlider/Hotel-slider.jsx
   COMPLETO — robusto para datos locales y TGX
   ──────────────────────────────────────────────── */
"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Heart, Star, CheckCircle } from "lucide-react"

export default function HotelSlider({ title, hotels, showArrow = true, searchParams, onHotelClick }) {
  const [favs, setFavs] = useState(new Set())
  const ref = useRef(null)

  const toggleFav = (id) => {
    const next = new Set(favs)
    next.has(id) ? next.delete(id) : next.add(id)
    setFavs(next)
  }

  const scroll = (dir) => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  if (!hotels?.length) return null

  const isSearchResults = hotels.some((h) => h.hotelName && h.price && h.currency && h.rateKey)

  const handleHotelClick = (hotel) => {
    if (onHotelClick) {
      onHotelClick(hotel)
    }
  }

  return (
    <section className="mb-8">
      {/* title + flechas */}
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
          {showArrow && <span className="ml-2">→</span>}
        </h2>
        {showArrow && (
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:border-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:border-gray-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* slider */}
      <div ref={ref} className="flex gap-3 overflow-x-auto px-4 pb-2 md:gap-4 scrollbar-hide">
        {hotels.map((h, idx) => {
          /* ── Normalización para soportar TGX, modelo local y resultados de búsqueda ───────────── */

          if (isSearchResults) {
            // Estructura de resultados de búsqueda de la API
            const id = h.hotelCode || h.rateKey || `search-${idx}`
            const keyStr = String(id)
            const name = h.hotelName || "Unnamed Hotel"
            const image = h.image || h.images?.[0]?.url || "/placeholder.svg"
            const locationText = h.location || h.city || ""
            const rating = h.rating || h.starRating || 4

            const searchPrice = h.price && h.currency ? `${h.price} ${h.currency}` : null

            const isRefundable = h.refundable
            const paymentType = h.paymentType

            const detailPath = `/hotels/${encodeURIComponent(id)}/rooms`

            return (
              <article
                key={keyStr}
                onClick={() => handleHotelClick(h)}
                className="group w-40 flex-none cursor-pointer overflow-hidden rounded-xl bg-white md:w-72 border-2 border-green-200"
              >
                {/* imagen */}
                <div className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={name}
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-48"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Available
                  </div>
                  {/* fav */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFav(keyStr)
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white md:h-8 md:w-8"
                  >
                    <Heart
                      className={`h-3 w-3 md:h-4 md:w-4 ${favs.has(keyStr) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </button>
                </div>

                {/* info */}
                <div className="p-3 md:p-4">
                  {/* título + rating */}
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-xs font-semibold text-gray-900 md:text-sm">{name}</h3>
                      {locationText && <p className="truncate text-xs text-gray-500">{locationText}</p>}
                    </div>
                    <div className="ml-2 flex flex-shrink-0 items-center">
                      <Star className="h-3 w-3 fill-current text-gray-900" />
                      <span className="ml-1 text-xs font-medium text-gray-900">{rating}</span>
                    </div>
                  </div>

                  {searchPrice && (
                    <div className="mb-2">
                      <p className="text-sm font-bold text-green-600 md:text-base">from {searchPrice} total stay</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    {isRefundable !== undefined && (
                      <p className="text-xs text-gray-600">
                        <span className={isRefundable ? "text-green-600" : "text-orange-600"}>
                          {isRefundable ? "✓ Refundable options" : "⚠ Non-refundable"}
                        </span>
                      </p>
                    )}
                    {paymentType && <p className="text-xs text-gray-500">Payment: {paymentType}</p>}
                  </div>
                </div>
              </article>
            )
          } else {
            // id estable para key y navegación
            const id = h.id ?? h.hotelCode ?? h.code ?? h._id ?? `${h.hotelName || h.name || "hotel"}-${idx}`
            const keyStr = String(id)

            // nombre visible
            const name = h.name || h.hotelName || h.title || "Unnamed Hotel"

            // imagen principal
            const image =
              h.image || h.images?.[0]?.url || h.photos?.[0]?.url || h.media?.images?.[0]?.url || "/placeholder.svg"

            // ubicación en texto (TGX: h.location es objeto)
            const locationObj = typeof h.location === "object" && h.location !== null ? h.location : null
            const locationText =
              [locationObj?.city || h.city, locationObj?.country || h.country].filter(Boolean).join(", ") ||
              h.address ||
              (typeof h.location === "string" ? h.location : "") ||
              ""

            // rating: intenta tomar star rating o equivalente
            const rating =
              h.rating ||
              h.starRating ||
              (typeof h.category === "number" ? h.category : undefined) ||
              (typeof h.categoryCode === "string" && /\d/.test(h.categoryCode)
                ? Number(h.categoryCode.replace(/[^\d]/g, ""))
                : undefined) ||
              4

            // precio base (si padre no lo calculó)
            const basePrice =
              (h.basePrice !== null && h.basePrice !== undefined ? Number(h.basePrice) : null) ??
              (h.price?.gross !== undefined ? Number(h.price.gross) : null) ??
              (h.minPrice !== undefined ? Number(h.minPrice) : null)

            // amenities resumidos (acepta varios formatos)
            const amenListRaw =
              (Array.isArray(h.amenities?.in_room) && h.amenities.in_room) ||
              (Array.isArray(h.amenities) && h.amenities) ||
              (Array.isArray(h.hotelFacilities) && h.hotelFacilities) ||
              []
            const amenList = amenListRaw
              .map((a) => (typeof a === "string" ? a : a?.name || a?.description))
              .filter(Boolean)
            const amenText = amenList.length
              ? amenList.slice(0, 2).join(" • ") + (amenList.length > 2 ? ` • +${amenList.length - 2}` : "")
              : null

            // ruta de detalle (ajústala si tu app usa otra)
            const detailPath = `/hotels/${encodeURIComponent(id)}/rooms`

            return (
              <article
                key={keyStr}
                onClick={() => handleHotelClick(h)}
                className="group w-40 flex-none cursor-pointer overflow-hidden rounded-xl bg-white md:w-72"
              >
                {/* imagen */}
                <div className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={name}
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-48"
                  />
                  {/* fav */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFav(keyStr)
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white md:h-8 md:w-8"
                  >
                    <Heart
                      className={`h-3 w-3 md:h-4 md:w-4 ${favs.has(keyStr) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </button>
                </div>

                {/* info */}
                <div className="p-3 md:p-4">
                  {/* título + rating */}
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-xs font-semibold text-gray-900 md:text-sm">{name}</h3>
                      {locationText && <p className="truncate text-xs text-gray-500">{locationText}</p>}
                    </div>
                    <div className="ml-2 flex flex-shrink-0 items-center">
                      <Star className="h-3 w-3 fill-current text-gray-900" />
                      <span className="ml-1 text-xs font-medium text-gray-900">{rating}</span>
                    </div>
                  </div>

                  {/* precio */}
                  {Number.isFinite(basePrice) && (
                    <p className="text-xs font-semibold text-gray-900 md:text-sm">From ${Math.round(basePrice)} USD</p>
                  )}

                  {/* amenities resumidos */}
                  {amenText && <p className="line-clamp-1 text-xs text-gray-500">{amenText}</p>}
                </div>
              </article>
            )
          }
        })}
      </div>
    </section>
  )
}
