/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Calendar,
  MapPin,
  Minus,
  Plus,
  DoorClosedIcon as CloseIcon,
} from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { fetchHotels } from "../../features/hotel/hotelSlice"
import { fetchRooms } from "../../features/room/roomSlice"
import {
  setHotelId,
  setCheckIn,
  setCheckOut,
  setAdults,
  setChildren,
  setRoomsCount,
} from "../../features/booking/bookingSlice"

/* ─────────── Helpers ─────────── */
const today = () => new Date()
const tomorrow = () => new Date(Date.now() + 86_400_000)
const toIso10AM = (d) => `${d.toISOString().split("T")[0]}T10:00:00`

export default function SearchBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const booking = useSelector((s) => s.booking)
  const { list } = useSelector((s) => s.hotel)

  /* ───── State ───── */
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [destination, setDestination] = useState("")
  const [filteredHotels, setFilteredHotels] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [checkInDate, setCheckInDate] = useState(booking.checkIn ? new Date(booking.checkIn) : today())
  const [checkOutDate, setCheckOutDate] = useState(booking.checkOut ? new Date(booking.checkOut) : tomorrow())
  const [adultsLocal, setAdultsLocal] = useState(booking.adults || 1)
  const [childrenLocal, setChildrenLocal] = useState(booking.children || 0)
  const [roomsLocal, setRoomsLocal] = useState(booking.rooms || 1)
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)

  /* ───── Refs ───── */
  const suggestionsRef = useRef(null)
  const guestsDropdownRef = useRef(null)

  /* ───── Utils ───── */
  const lockScroll = () => {
    document.body.style.overflow = "hidden"
  }
  const unlockScroll = () => {
    document.body.style.overflow = ""
  }
  const openMobileSearch = () => {
    lockScroll()
    setIsExpanded(true)
  }
  const closeMobileSearch = useCallback((e) => {
    e?.stopPropagation()
    setIsExpanded(false)
    setTimeout(() => unlockScroll(), 50)
  }, [])

  const inc = (fn, v) => fn(v + 1)
  const dec = (fn, v, min = 0) => fn(v > min ? v - 1 : v)

  /* ───── Effects ───── */
  useEffect(() => {
    const s = document.createElement("style")
    s.innerHTML = `
      .react-datepicker-popper{z-index:9999!important;width:100%;transform:none!important;inset:auto!important;position:fixed!important;bottom:0!important;left:0!important}
      .react-datepicker{width:100%;border-radius:16px 16px 0 0!important;border:none!important;box-shadow:0 -2px 10px rgba(0,0,0,.1)}
      .react-datepicker__month-container{width:100%}
      @media(min-width:768px){
        .react-datepicker-popper{position:absolute!important;transform:translate3d(0,40px,0)!important;width:auto;bottom:auto!important;left:auto!important;z-index:9999!important}
        .react-datepicker{width:auto;border-radius:8px!important;border:1px solid #e5e7eb!important}
        .react-datepicker__month-container{width:auto}
      }`
    document.head.appendChild(s)
    return () => document.head.removeChild(s)
  }, [])

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768
      setIsMobile(m)
      setIsExpanded(!m)
      if (!m) unlockScroll()
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!booking.checkIn) dispatch(setCheckIn(toIso10AM(checkInDate)))
    if (!booking.checkOut) dispatch(setCheckOut(toIso10AM(checkOutDate)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!destination.trim()) {
      setFilteredHotels(list)
    } else {
      const t = destination.toLowerCase()
      setFilteredHotels(list.filter((h) => h.name.toLowerCase().includes(t)))
    }
  }, [destination, list])

  useEffect(() => {
    const out = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setShowSuggestions(false)
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(e.target)) setShowGuestsDropdown(false)
    }
    document.addEventListener("click", out)
    return () => document.removeEventListener("click", out)
  }, [])

  /* ───── Handlers ───── */
  const selHotel = (h) => {
    setDestination(h.name)
    dispatch(setHotelId(h.id))
    setShowSuggestions(false)
  }

  const doSearch = (e) => {
    e.preventDefault()
    if (checkInDate >= checkOutDate) return alert("Check-out must be after check-in")
    if (adultsLocal < 1) return alert("At least 1 adult required")
    if (roomsLocal < 1) return alert("At least 1 room required")

    dispatch(setCheckIn(toIso10AM(checkInDate)))
    dispatch(setCheckOut(toIso10AM(checkOutDate)))
    dispatch(setAdults(adultsLocal))
    dispatch(setChildren(childrenLocal))
    dispatch(setRoomsCount(roomsLocal))

    if (booking.hotelId) {
      dispatch(
        fetchRooms({
          hotelId: booking.hotelId,
          searchParams: {
            checkIn: toIso10AM(checkInDate),
            checkOut: toIso10AM(checkOutDate),
            adults: adultsLocal,
            children: childrenLocal,
            rooms: roomsLocal,
          },
        }),
      )
      navigate(`/hotels/${booking.hotelId}/rooms`)
    } else {
      dispatch(
        fetchHotels({
          location: destination,
          checkIn: toIso10AM(checkInDate),
          checkOut: toIso10AM(checkOutDate),
          adults: adultsLocal,
          children: childrenLocal,
          rooms: roomsLocal,
        }),
      )
      navigate("/hotels")
    }
    if (isMobile) closeMobileSearch()
  }

  /* ───── Render ───── */

  /* === MOBILE COLLAPSED === */
  if (isMobile && !isExpanded) {
    return (
      <div className="px-4 py-3">
        <div className="bg-white rounded-full shadow-md border border-gray-200 mb-4" onClick={openMobileSearch}>
          <div className="flex items-center p-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Start your search</p>
              <p className="text-xs text-gray-500">Where • When • Who</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-6 mb-6">
          <button className="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-2">Stays</button>
          <button className="text-sm font-medium text-gray-500 pb-2">Experiences</button>
          <button className="text-sm font-medium text-gray-500 pb-2">Services</button>
        </div>
      </div>
    )
  }

  /* === MOBILE EXPANDED === */
  if (isMobile && isExpanded) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
        <button
          onClick={closeMobileSearch}
          className="fixed top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-lg z-10"
        >
          <CloseIcon className="w-5 h-5 text-gray-700" />
        </button>

        <div className="p-6 pt-16">
          <form onSubmit={doSearch} className="space-y-6">
            {/* WHERE */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Where?</h3>
              <div className="relative" ref={suggestionsRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value)
                    dispatch(setHotelId(null))
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  type="text"
                  placeholder="Search destinations"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
                {showSuggestions && filteredHotels.length > 0 && (
                  <div className="mt-3 space-y-2 relative z-[10000]">
                    <p className="text-sm font-medium text-gray-700">Suggested destinations</p>
                    {filteredHotels.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer"
                        onClick={() => selHotel(h)}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{h.name}</p>
                          <p className="text-sm text-gray-500">{h.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* WHEN */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">When?</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <DatePicker
                      selected={checkInDate}
                      onChange={(d) => {
                        setCheckInDate(d)
                        if (d >= checkOutDate) {
                          const n = new Date(d)
                          n.setDate(n.getDate() + 1)
                          setCheckOutDate(n)
                        }
                      }}
                      selectsStart
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={today()}
                      dateFormat="MMM dd"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <DatePicker
                      selected={checkOutDate}
                      onChange={(d) => setCheckOutDate(d)}
                      selectsEnd
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={new Date(checkInDate.getTime() + 86_400_000)}
                      dateFormat="MMM dd"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WHO */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Who?</h3>
              <div className="border border-gray-300 rounded-2xl p-4 space-y-4">
                {[
                  {
                    label: "Adults",
                    sub: "13+",
                    value: adultsLocal,
                    set: setAdultsLocal,
                    min: 1,
                  },
                  {
                    label: "Children",
                    sub: "0-12",
                    value: childrenLocal,
                    set: setChildrenLocal,
                    min: 0,
                  },
                  {
                    label: "Rooms",
                    sub: "",
                    value: roomsLocal,
                    set: setRoomsLocal,
                    min: 1,
                  },
                ].map(({ label, sub, value, set, min }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      {sub && <p className="text-sm text-gray-500">{sub}</p>}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        disabled={value <= min}
                        onClick={() => dec(set, value, min)}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{value}</span>
                      <button
                        type="button"
                        onClick={() => inc(set, value)}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDestination("")
                setAdultsLocal(1)
                setChildrenLocal(0)
                setRoomsLocal(1)
                setCheckInDate(today())
                setCheckOutDate(tomorrow())
              }}
              className="text-sm text-gray-600 underline"
            >
              Clear all
            </button>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <Search size={20} /> Search
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* === DESKTOP === */
  return (
    <div className="bg-white rounded-full shadow-lg border border-gray-200 overflow-visible relative z-40">
      <form onSubmit={doSearch}>
        <div className="flex items-center divide-x divide-gray-300">
          {/* Destination */}
          <div className="flex-1 relative" ref={suggestionsRef}>
            <div className="px-6 py-4">
              <label className="block text-xs font-semibold text-gray-900 mb-1">Where</label>
              <input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  dispatch(setHotelId(null))
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search destinations"
                className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
              />
              {showSuggestions && filteredHotels.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-auto z-[9999]">
                  {filteredHotels.map((h) => (
                    <li
                      key={h.id}
                      onClick={() => selHotel(h)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex gap-3 items-center"
                    >
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{h.name}</p>
                        <p className="text-sm text-gray-500">{h.address}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Check-in */}
          <div className="flex-1">
            <div className="px-6 py-4">
              <label className="block text-xs font-semibold text-gray-900 mb-1">Check-in</label>
              <DatePicker
                selected={checkInDate}
                onChange={(d) => {
                  setCheckInDate(d)
                  if (d >= checkOutDate) {
                    const n = new Date(d)
                    n.setDate(n.getDate() + 1)
                    setCheckOutDate(n)
                  }
                }}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={today()}
                dateFormat="MMM dd"
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                placeholderText="Add dates"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex-1">
            <div className="px-6 py-4">
              <label className="block text-xs font-semibold text-gray-900 mb-1">Check-out</label>
              <DatePicker
                selected={checkOutDate}
                onChange={setCheckOutDate}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date(checkInDate.getTime() + 86_400_000)}
                dateFormat="MMM dd"
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                placeholderText="Add dates"
              />
            </div>
          </div>

          {/* Guests & rooms */}
          <div className="flex-1 relative" ref={guestsDropdownRef}>
            <div className="px-6 py-4">
              <label className="block text-xs font-semibold text-gray-900 mb-1">Who</label>
              <div
                onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                className="text-sm text-gray-600 cursor-pointer"
              >
                {adultsLocal + childrenLocal} guest{adultsLocal + childrenLocal !== 1 && "s"},{" "}
                {roomsLocal} room{roomsLocal !== 1 && "s"}
              </div>

              {showGuestsDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[9999] p-6 w-80">
                  {[
                    { label: "Adults", sub: "13+", val: adultsLocal, set: setAdultsLocal, min: 1 },
                    { label: "Children", sub: "0-12", val: childrenLocal, set: setChildrenLocal, min: 0 },
                    { label: "Rooms", sub: "", val: roomsLocal, set: setRoomsLocal, min: 1 },
                  ].map(({ label, sub, val, set, min }) => (
                    <div key={label} className="flex items-center justify-between mb-4 last:mb-0">
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        {sub && <p className="text-xs text-gray-500">{sub}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={val <= min}
                          onClick={() => dec(set, val, min)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 hover:border-gray-900 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center">{val}</span>
                        <button
                          type="button"
                          onClick={() => inc(set, val)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-900 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="pl-2 pr-2">
            <button
              type="submit"
              className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
