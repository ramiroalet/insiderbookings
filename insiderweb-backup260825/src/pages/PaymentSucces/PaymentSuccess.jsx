"use client"
import { useEffect, useState, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import axios from "axios"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { CheckCircle, Download, Calendar, Home, User, CreditCard, Clock, MapPin, Phone, Star } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const iosStyle = {
  WebkitAppearance: "none",
  appearance: "none",
  WebkitTapHighlightColor: "transparent",
  WebkitUserSelect: "none",
  userSelect: "none",
}

const Stars = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={`transition-colors duration-200 ${
          i < Math.round(rating) ? "fill-current text-amber-400 drop-shadow-sm" : "text-gray-300"
        }`}
      />
    ))}
  </div>
)

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  const ticketRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID was received in the URL.")
      setLoading(false)
      return
    }
    const fetchBooking = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/bookings/${bookingId}`)
        setBooking(data)
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred while retrieving the booking.")
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  const downloadTicket = async () => {
    if (!ticketRef.current) return
    setIsGeneratingPDF(true)
    const ticketWrapper = ticketRef.current.parentNode
    const prevVisibility = ticketWrapper.style.visibility
    try {
      ticketWrapper.style.visibility = "visible"
      await new Promise((r) => setTimeout(r, 100))
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        onclone: (_, element) => {
          element.querySelectorAll("img").forEach((img) => (img.crossOrigin = "anonymous"))
        },
      })
      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)
      pdf.save(`booking-confirmation-${booking.id}.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("There was a problem generating the PDF. Please try again.")
    } finally {
      ticketWrapper.style.visibility = prevVisibility
      setIsGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-600 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-300/20 border-b-red-400 rounded-full animate-spin animate-reverse" />
          </div>
          <p className="text-lg font-medium">Loading booking information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment confirmed, but...</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <Link
              to="/"
              style={iosStyle}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Home size={18} />
              Return to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const {
    id,
    guestName,
    guestEmail,
    guestPhone,
    hotel,
    room,
    checkIn,
    checkOut,
    adults,
    children,
    total,
    paymentStatus,
  } = booking

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  const pricePerNight = Number.parseFloat(total) / nights
  const taxesAndFees = Number.parseFloat(total) * 0.15
  const subtotal = Number.parseFloat(total) - taxesAndFees
  const ratingVal = Number(hotel?.rating) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-6 max-w-7xl mx-auto pb-20">
      {/* Success Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-10">
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-green-100/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-100" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Payment Confirmed!</h1>
            <p className="text-green-100 text-lg font-semibold max-w-2xl mx-auto leading-relaxed">
              Your booking has been successfully processed. Below you will find your booking details.
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/bookings"
              style={iosStyle}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <User size={20} />
              View my bookings
            </Link>
            <button
              onClick={downloadTicket}
              disabled={isGeneratingPDF}
              style={iosStyle}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download confirmation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Booking Details</h2>
            <p className="text-red-100 font-semibold">Your complete reservation information</p>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Hotel Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Home size={24} className="text-red-500" />
              Hotel Information
            </h3>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-4">{hotel?.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-red-500" />
                    <span className="font-medium">{hotel?.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={18} className="text-red-500" />
                    <span className="font-medium">+1 305-674-3878</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars rating={ratingVal} size={16} />
                    <span className="text-sm font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-lg">
                      {ratingVal.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Guest Information */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User size={20} className="text-blue-500" />
                Guest Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Name</p>
                  <p className="text-gray-900 font-semibold">{guestName}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Email</p>
                  <p className="text-gray-900 font-semibold">{guestEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Phone</p>
                  <p className="text-gray-900 font-semibold">{guestPhone}</p>
                </div>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border border-purple-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar size={20} className="text-purple-500" />
                Stay Dates
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Check-in</p>
                  <p className="text-gray-900 font-semibold">
                    {checkInDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Check-out</p>
                  <p className="text-gray-900 font-semibold">
                    {checkOutDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Duration</p>
                  <p className="text-gray-900 font-semibold">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Details */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border border-green-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard size={20} className="text-green-500" />
                Payment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Status</p>
                  <p className="text-green-600 font-bold text-lg">
                    {paymentStatus === "paid" ? "Paid" : paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Method</p>
                  <p className="text-gray-900 font-semibold">Credit Card</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Total</p>
                  <p className="text-gray-900 font-bold text-2xl">${Number.parseFloat(total).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 border border-amber-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock size={20} className="text-amber-500" />
                Room Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Room</p>
                  <p className="text-gray-900 font-bold text-lg">{room?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Guests</p>
                    <p className="text-gray-900 font-semibold">
                      {adults} adults, {children} children
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Price per night</p>
                    <p className="text-gray-900 font-semibold">${pricePerNight.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Booking ID</p>
                  <p className="text-gray-900 font-semibold">{id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-blue-900 mb-2">Important Information</h4>
                <p className="text-blue-800 leading-relaxed">
                  Free cancellation until 24 hours before check-in. After that, a cancellation fee may apply. Please
                  present this booking confirmation upon check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Ticket */}
      <div className="absolute top-0 left-[-9999px] invisible">
        <div ref={ticketRef} className="w-[800px] p-10 bg-white font-sans">
          <div className="border-b-2 border-red-500 pb-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black text-white px-3 py-1 rounded text-sm font-bold">••••</div>
              <span className="text-xl font-bold">Insider</span>
            </div>
            <h1 className="text-2xl font-bold text-red-500">BOOKING CONFIRMATION</h1>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Booking ID:</span>
                <span className="text-gray-600">{id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Guest Name:</span>
                <span className="text-gray-600">{guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Property:</span>
                <span className="text-gray-600">{hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Address:</span>
                <span className="text-gray-600">{hotel?.address}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Check-In:</span>
                <span className="text-gray-600">
                  {checkInDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Check-Out:</span>
                <span className="text-gray-600">
                  {checkOutDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Guests:</span>
                <span className="text-gray-600">{adults + children}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-bold text-gray-900 mb-4">RATES AND PAYMENT</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Subtotal:</span>
                <span className="text-gray-600">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700">Taxes and Fees:</span>
                <span className="text-gray-600">${taxesAndFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <span>Total Cost:</span>
                <span>${Number.parseFloat(total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="mb-6">Please present this booking confirmation upon check-in.</p>
            <div className="flex justify-end">
              <div className="border-b border-gray-400 w-48 text-center pb-1">
                <div className="text-sm text-gray-600 italic">Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
