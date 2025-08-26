/* eslint-disable react/prop-types */
"use client"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Calendar, User, Hash, Building, Phone, Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function SendReservationEmail() {
  /* ─────────────────────────────────────
     STATE
  ───────────────────────────────────── */
  const [form, setForm] = useState({
    arrivalDate: "",
    departureDate: "",
    firstName: "",
    lastName: "",
    bookingConfirmation: "",
    hotelId: "", // FK to save in DB
    hotel: "", // readable name for email
    roomType: "",
    roomNumber: "",
    email: "",
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [hotels, setHotels] = useState([])

  /* ─────────────────────────────────────
     DERIVED DATA
  ───────────────────────────────────── */
  const selectedHotel = useMemo(
    () => hotels.find((h) => String(h.id) === String(form.hotelId)) ?? null,
    [hotels, form.hotelId],
  )

  const roomOptions = useMemo(() => {
    if (!selectedHotel) return []
    const list = selectedHotel.Rooms || selectedHotel.rooms || []
    return list.map((r) => ({ value: r.name, label: r.name }))
  }, [selectedHotel])

  /* keep hotel readable name in sync */
  useEffect(() => {
    if (selectedHotel && selectedHotel.name !== form.hotel) {
      setForm((prev) => ({ ...prev, hotel: selectedHotel.name }))
    }
  }, [selectedHotel])

  /* ─────────────────────────────────────
     HELPERS
  ───────────────────────────────────── */
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      await axios.post(`${API_URL}/email/reservation`, form)
      setMessage({ type: "success", text: "Email sent successfully!" })
      setForm({
        arrivalDate: "",
        departureDate: "",
        firstName: "",
        lastName: "",
        bookingConfirmation: "",
        hotelId: "",
        hotel: "",
        roomType: "",
        roomNumber: "",
        email: "",
        phoneNumber: "",
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: "error", text: "There was an error while sending the email." })
    } finally {
      setLoading(false)
    }
  }

  /* fetch hotels + rooms only once */
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/hotels/hotelsAndRooms`)
        setHotels(data)
      } catch (err) {
        console.error(err)
        setMessage({ type: "error", text: "Could not load hotels list." })
      }
    }
    fetchHotels()
  }, [])

  /* ─────────────────────────────────────
     UI
  ───────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ─────────── Header ─────────── */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Mail className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">Reservation Confirmation</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            Fill in the booking details to send the confirmation email to the guest.
          </p>
        </div>

        {/* ─────────── Main Card ─────────── */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">
            {/* Alert message */}
            {message && (
              <div
                className={`mb-8 rounded-xl p-4 ${
                  message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  {message.type === "success" ? (
                    <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="mr-3 h-5 w-5 text-red-600" />
                  )}
                  <span className="font-semibold">{message.text}</span>
                </div>
              </div>
            )}

            {/* ─────────── Form ─────────── */}
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* ─────── Stay Dates ─────── */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Stay Dates</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="arrivalDate" className="mb-3 block text-sm font-semibold text-gray-700">
                      Arrival Date
                    </label>
                    <input
                      id="arrivalDate"
                      type="date"
                      name="arrivalDate"
                      value={form.arrivalDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="departureDate" className="mb-3 block text-sm font-semibold text-gray-700">
                      Departure Date
                    </label>
                    <input
                      id="departureDate"
                      type="date"
                      name="departureDate"
                      value={form.departureDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* ─────── Guest Information ─────── */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Guest Information</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-3 block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Enter first name"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-3 block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Enter last name"
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* ─────── Reservation Details ─────── */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Hash className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Reservation Details</h3>
                </div>

                {/* Confirmation number */}
                <div>
                  <label htmlFor="bookingConfirmation" className="mb-3 block text-sm font-semibold text-gray-700">
                    Confirmation Number
                  </label>
                  <input
                    id="bookingConfirmation"
                    type="text"
                    name="bookingConfirmation"
                    value={form.bookingConfirmation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. BK123456789"
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                  />
                </div>

                {/* Hotel & room type */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Hotel select */}
                  <div>
                    <label htmlFor="hotelId" className="mb-3 block text-sm font-semibold text-gray-700">
                      Hotel
                    </label>
                    <select
                      id="hotelId"
                      name="hotelId"
                      value={form.hotelId}
                      onChange={(e) => {
                        handleChange(e)
                        setForm((prev) => ({ ...prev, roomType: "" }))
                      }}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                    >
                      <option value="">Select a hotel</option>
                      {hotels.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room type */}
                  <div>
                    <label htmlFor="roomType" className="mb-3 block text-sm font-semibold text-gray-700">
                      Room Type
                    </label>
                    <select
                      id="roomType"
                      name="roomType"
                      value={form.roomType}
                      onChange={handleChange}
                      disabled={!form.hotelId}
                      required
                      className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select a room type</option>
                      {roomOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Room number */}
                <div>
                  <label htmlFor="roomNumber" className="mb-3 block text-sm font-semibold text-gray-700">
                    Room Number
                  </label>
                  <input
                    id="roomNumber"
                    type="text"
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 205"
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* ─────── Contact Information ─────── */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Building className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-3 block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pr-12 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                      />
                      <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="mb-3 block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        id="phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="+1 (555) 123-4567"
                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pr-12 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/20 placeholder:text-gray-400"
                      />
                      <Phone className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────── Submit button ─────── */}
              <div className="border-t border-gray-200 pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6" />
                      Send Confirmation Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
