// src/pages/DiscountCodes.jsx
"use client"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { validateCode } from "../../features/discount/discountSlice"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar, Percent, Sparkles, CheckCircle, Loader2 } from "lucide-react"
import { setHotelId, setCheckIn, setCheckOut, setCustomPrice } from "../../features/booking/bookingSlice"

export default function DiscountCodes() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  /* ───────────────── Redux state ───────────────── */
  const {
    code,
    percentage,
    active,
    status,
    error,
    validatedBy,            // { name, staff_id?, user_id? } | string
    hotel,                  // { id, name, image, location, … } | null
    specialDiscountPrice,
  } = useSelector((s) => s.discount)

  /* ───────────────── Local state ───────────────── */
  const [discountCode, setDiscountCode] = useState(code || "")
  const [checkIn, setCheckInLocal] = useState(new Date())
  const [checkOut, setCheckOutLocal] = useState(new Date(Date.now() + 86_400_000))
  const [showCI, setShowCI] = useState(false)
  const [showCO, setShowCO] = useState(false)

  /* ───────────────── Refs ───────────────── */
  const ciRef = useRef(null)
  const coRef = useRef(null)

  /* ───────────────── Derived flags ───────────────── */
  const isStaff = !!(validatedBy && typeof validatedBy === "object" && validatedBy.staff_id)
  const isInfluencer = !!(validatedBy && typeof validatedBy === "object" && validatedBy.user_id && !validatedBy.staff_id)

  /* ───────────────── Effects ───────────────── */
  // close date pickers on outside click
  useEffect(() => {
    const h = (e) => {
      if (ciRef.current && !ciRef.current.contains(e.target)) setShowCI(false)
      if (coRef.current && !coRef.current.contains(e.target)) setShowCO(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // sync input with validated code
  useEffect(() => {
    if (active && code) setDiscountCode(code)
  }, [active, code])

  // ✅ Auto-navigate SOLO para STAFF (mantiene comportamiento anterior)
  useEffect(() => {
    if (active && !hotel && isStaff) {
      const toIso10 = (d) => `${d.toISOString().split("T")[0]}T10:00:00`
      dispatch(setCheckIn(toIso10(checkIn)))
      dispatch(setCheckOut(toIso10(checkOut)))
      navigate("/hotels")
    }
  }, [active, hotel, isStaff, checkIn, checkOut, dispatch, navigate])

  /* ───────────────── Helpers ───────────────── */
  const fmt = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / 86_400_000))
  const datesReady = Boolean(checkIn && checkOut)
  const hasSpecial = Number.isFinite(Number(specialDiscountPrice)) && Number(specialDiscountPrice) > 0

  // Safe rendering for validatedBy (object or string)
  const validatorName = typeof validatedBy === "string" ? validatedBy : validatedBy?.name || ""
  const validatorBadge = isStaff ? "Staff" : isInfluencer ? "Influencer" : ""

  /* ───────────────── Handlers ───────────────── */
  const handleValidateCode = (e) => {
    e.preventDefault()
    if (!discountCode) return alert("Please enter a discount code")
    dispatch(
      validateCode({
        code: discountCode, // numeric (1234) or influencer (IXXXX…)
        checkIn: checkIn.toISOString().split("T")[0],
        checkOut: checkOut.toISOString().split("T")[0],
      }),
    )
  }

  // date selection
  const onSelectCI = (d) => {
    setCheckInLocal(d)
    if (d >= checkOut) setCheckOutLocal(new Date(d.getTime() + 86_400_000))
    setShowCI(false)
  }
  const onSelectCO = (d) => {
    if (d <= checkIn) return alert("Check-out must be after check-in")
    setCheckOutLocal(d)
    setShowCO(false)
  }

  // manual navigation to rooms (hotel-specific)
  const isoCI = `${checkIn.toISOString().split("T")[0]}T10:00:00`
  const isoCO = `${checkOut.toISOString().split("T")[0]}T10:00:00`

  const goRooms = () => {
    if (!hotel) return
    dispatch(setHotelId(hotel.id))
    dispatch(setCheckIn(isoCI))
    dispatch(setCheckOut(isoCO))
    navigate(`/hotels/${hotel.id}/rooms`)
  }

  const goCheckout = () => {
    if (!hotel) return
    dispatch(setHotelId(hotel.id))
    dispatch(setCheckIn(isoCI))
    dispatch(setCheckOut(isoCO))
    dispatch(setCustomPrice(+specialDiscountPrice))
    navigate("/checkout")
  }

  // NEW: manual navigation to hotel list for influencer codes (platform-wide)
  const goDiscountedHotels = () => {
    const toIso10 = (d) => `${d.toISOString().split("T")[0]}T10:00:00`
    dispatch(setCheckIn(toIso10(checkIn)))
    dispatch(setCheckOut(toIso10(checkOut)))
    navigate("/hotels")
  }

  /* ───────────────── UI ───────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Percent className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Unlock Special Rates</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Enter your insider code to access exclusive discounts on your next stay.
          </p>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* STEP 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Enter Your Code</h2>
              </div>

              <form className="space-y-6" onSubmit={handleValidateCode}>
                <div>
                  <label className="mb-3 block text-lg font-medium text-gray-900">Insider Discount Code</label>
                  <input
                    value={discountCode}
                    onChange={(e) => {
                      // allow A-Z and 0-9; uppercase; max 16 (e.g. "IABCD1234")
                      const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      setDiscountCode(v.slice(0, 16))
                    }}
                    maxLength={16}
                    placeholder="1234 or IAB12"
                    inputMode="text"
                    pattern="[A-Za-z0-9]*"
                    className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-center text-2xl font-bold tracking-wider text-gray-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Staff: 4 digits (e.g. 1234). Influencers: starts with <span className="font-semibold">I</span> (e.g.
                    IAB12).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || !discountCode}
                  className="flex w-full items-center justify-center rounded-xl bg-red-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Validating Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Unlock Special Rate
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-red-600">
                    <p className="font-medium">{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* STEP 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your Special Rate</h2>
              </div>

              <div className="space-y-6">
                {/* Validation Result */}
                {active ? (
                  hasSpecial ? (
                    /* Special fixed-price offer */
                    <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                        <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                          SPECIAL OFFER
                        </span>
                      </div>

                      <p className="mb-4 text-2xl font-bold text-yellow-700">
                        ${+specialDiscountPrice} <span className="text-lg font-normal">per night</span>
                      </p>

                      {/* Generator */}
                      <div className="rounded-lg bg-white/60 p-3 mb-4">
                        <p className="text-sm text-gray-600">Generated by:</p>
                        <p className="font-semibold text-gray-900">
                          {validatorName}
                          {validatorBadge && <span className="ml-2 text-xs text-gray-500">({validatorBadge})</span>}
                        </p>
                      </div>

                      {/* Hotel Info */}
                      {hotel && (
                        <div className="flex items-center gap-4">
                          <img
                            src={hotel.image || "/placeholder.svg"}
                            alt={hotel.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm text-gray-500">Hotel</p>
                            <p className="font-semibold text-gray-900">{hotel.name}</p>
                            {hotel.location && <p className="text-xs text-gray-500">{hotel.location}</p>}
                          </div>
                        </div>
                      )}

                      {/* Influencer: no hotel → CTA manual */}
                      {!hotel && isInfluencer && (
                        <div className="mt-4">
                          <button
                            onClick={goDiscountedHotels}
                            disabled={!datesReady}
                            className="w-full rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            See discounted hotels
                          </button>
                        </div>
                      )}

                      {/* Staff: no hotel → mensaje de auto-navegación */}
                      {!hotel && isStaff && (
                        <p className="mt-3 text-sm text-gray-600">
                          This code applies platform-wide. We’re taking you to the hotel list…
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Percentage discount */
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                          DISCOUNT UNLOCKED
                        </span>
                      </div>

                      <p className="mb-4 text-2xl font-bold text-green-700">{percentage}% OFF</p>

                      {/* Generator */}
                      <div className="rounded-lg bg-white/60 p-3 mb-4">
                        <p className="text-sm text-gray-600">Generated by:</p>
                        <p className="font-semibold text-gray-900">
                          {validatorName}
                          {validatorBadge && <span className="ml-2 text-xs text-gray-500">({validatorBadge})</span>}
                        </p>
                      </div>

                      {/* Hotel Info (only if attached) */}
                      {hotel && (
                        <div className="flex items-center gap-4">
                          <img
                            src={hotel.image || "/placeholder.svg"}
                            alt={hotel.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm text-gray-500">Hotel</p>
                            <p className="font-semibold text-gray-900">{hotel.name}</p>
                            {hotel.location && <p className="text-xs text-gray-500">{hotel.location}</p>}
                          </div>
                        </div>
                      )}

                      {/* Influencer: no hotel → CTA manual */}
                      {!hotel && isInfluencer && (
                        <div className="mt-4">
                          <button
                            onClick={goDiscountedHotels}
                            disabled={!datesReady}
                            className="w-full rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            See discounted hotels
                          </button>
                        </div>
                      )}

                      {/* Staff: no hotel → mensaje de auto-navegación */}
                      {!hotel && isStaff && (
                        <p className="text-sm text-gray-600">
                          This code applies platform-wide. We’re taking you to the hotel list…
                        </p>
                      )}
                    </div>
                  )
                ) : (
                  /* Default placeholder */
                  <div className="rounded-xl bg-gray-50 p-6 text-center">
                    <Percent className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">Validate your code to see your exclusive offer</p>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Select Your Dates</h3>

                  {/* Check-in */}
                  <div className="relative">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Check-in
                    </label>
                    <button
                      type="button"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 transition-colors hover:border-red-300 focus:border-red-500 focus:outline-none"
                      onClick={() => setShowCI(true)}
                    >
                      {fmt(checkIn)}
                    </button>
                    {showCI && (
                      <div ref={ciRef} className="absolute z-50 mt-2">
                        <div className="rounded-xl bg-white p-4 shadow-xl">
                          <DatePicker
                            selected={checkIn}
                            onChange={onSelectCI}
                            inline
                            monthsShown={typeof window !== "undefined" && window.innerWidth > 768 ? 2 : 1}
                            minDate={new Date()}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Check-out */}
                  <div className="relative">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Check-out
                    </label>
                    <button
                      type="button"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 transition-colors hover:border-red-300 focus:border-red-500 focus:outline-none"
                      onClick={() => setShowCO(true)}
                    >
                      {fmt(checkOut)}
                    </button>
                    {showCO && (
                      <div ref={coRef} className="absolute z-50 mt-2">
                        <div className="rounded-xl bg-white p-4 shadow-xl">
                          <DatePicker
                            selected={checkOut}
                            onChange={onSelectCO}
                            inline
                            monthsShown={typeof window !== "undefined" && window.innerWidth > 768 ? 2 : 1}
                            minDate={new Date(checkIn.getTime() + 86_400_000)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nights */}
                  <div className="rounded-xl bg-red-50 p-4 text-center">
                    <p className="font-semibold text-red-600">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {hasSpecial ? (
                    hotel ? (
                      <button
                        onClick={goCheckout}
                        disabled={!active || !datesReady}
                        className="w-full rounded-xl bg-red-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Proceed to Checkout
                      </button>
                    ) : (
                      // Si es influencer y no hay hotel, ya mostramos el CTA arriba.
                      // Si es staff, auto-navega, así que aquí no mostramos nada extra.
                      <></>
                    )
                  ) : (
                    hotel ? (
                      <button
                        onClick={goRooms}
                        disabled={!active || !datesReady}
                        className="w-full rounded-xl bg-red-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        View Available Rooms
                      </button>
                    ) : (
                      // Misma lógica que arriba: influencer → CTA arriba; staff → auto-nav
                      <></>
                    )
                  )}

                  {!active && (
                    <p className="mt-3 text-center text-sm text-gray-500">Please validate your discount code first</p>
                  )}
                </div>
              </div>
            </div>
            {/* END STEP 2 */}
          </div>
        </div>
      </div>
    </div>
  )
}
