/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function AddOnsSuccess() {
  /* routing */
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const bookingId      = searchParams.get("bookingId")

  /* local state */
  const [booking,    setBooking]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  /* modal (auto-signup) */
  const [showModal,     setShowModal]     = useState(false)
  const [name,          setName]          = useState("")
  const [phone,         setPhone]         = useState("")
  const [email,         setEmail]         = useState("")
  const [roomNumber,    setRoomNumber]    = useState("")
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  console.log(booking, "booking")

  /* fetch booking */
  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking ID.")
      setLoading(false)
      return
    }
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/bookings/${bookingId}`,
          { headers: { "Content-Type": "application/json" } },
        )
        setBooking(data)

        // pre-fill modal inputs
        const fullName = `${data.guestName ?? ""} ${data.guestLastName ?? ""}`.trim()
        setName(fullName)
        setPhone(data.guestPhone ?? "")
        setEmail(data.guestEmail ?? "")

        // pre-fill room number for OUTSIDE
        setRoomNumber(data.meta?.room_number ?? "")

        // open modal only if booking has no user yet
        if (!data.user) setShowModal(true)
      } catch {
        setError("Could not load booking details.")
      } finally {
        setLoading(false)
      }
    })()
  }, [bookingId])

  /* date formatter */
  const fmtDate = (d, time) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month  : "long",
      day    : "numeric",
      year   : "numeric",
    }) + (time ? ` at ${time}` : "")

  /* auto-signup */
  const handleConfirm = async () => {
    if (submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const [firstName, ...rest] = name.split(" ")
      const lastName = rest.join(" ") || "-"
      await axios.post(`${API_URL}/auth/auto-signup`, {
        email,
        firstName,
        lastName,
        phone,
        bookingId,
      })
      setSubmitSuccess(true)
    } catch (e) {
      console.error(e)
      setSubmitError(e.response?.data?.error || "Server error")
    } finally {
      setSubmitting(false)
    }
  }

  /* loading & error states */
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    )

  /* destructure booking */
  const {
    externalRef,  // confirmation for OUTSIDE
    hotel,
    checkIn,
    checkOut,
    room,         // will be null for OUTSIDE
    meta,         // contains roomType & room_number for OUTSIDE
    addons,
  } = booking

  // decide which room type to show
  const guestRoomType = meta?.notes.roomType ?? room?.name ?? "Room"

  return (
    <>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle2 size={56} className="text-green-600" />
          <h1 className="text-2xl font-bold">
            Your add-on has been added successfully!
          </h1>
        </div>

        {/* Booking summary */}
        <section className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Booking Details</h2>
          <p><strong>Confirmation #:</strong> {externalRef}</p>
          <p><strong>Hotel:</strong> {hotel?.name}</p>
          <p><strong>Room Type:</strong> {guestRoomType}</p>
          <p><strong>Check-in:</strong>  {fmtDate(checkIn,  "3:00 PM")}</p>
          <p><strong>Check-out:</strong> {fmtDate(checkOut, "11:00 AM")}</p>
        </section>

        {/* Add-ons */}
        <section className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Your Add-Ons</h2>
          {addons.length === 0 ? (
            <p className="text-gray-500">No add-ons found.</p>
          ) : (
            <ul className="space-y-4">
              {addons.map((a) => (
                <li
                  key={a.bookingAddOnId}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{a.addOnName}</p>
                    {a.optionName && (
                      <p className="text-sm text-gray-600">
                        Option: {a.optionName}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Qty: {a.quantity} • Price: ${(a.unitPrice ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      a.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : a.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : a.status === "ready"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {a.status === "pending"
                      ? "Pending approval"
                      : a.status === "confirmed"
                      ? "Accepted – click to pay"
                      : a.status === "ready"
                      ? "Ready"
                      : "Cancelled"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* AUTO-SIGNUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {submitSuccess ? (
              <div className="text-center">
                <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Account created!</h2>
                <p className="text-gray-700 mb-6">
                  We sent a magic link to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Guest Information Confirmation
                </h2>

                {/* locked fields */}
                <div className="space-y-4 mb-6">
                  <LockedRow label="Confirmation #" value={externalRef} />
                  <LockedRow label="Room Type" value={guestRoomType} />
                  <LockedRow label="Arrival Date" value={fmtDate(checkIn,  "3:00 PM")} />
                  <LockedRow label="Departure Date" value={fmtDate(checkOut, "11:00 AM")} />
                </div>

                {/* editable fields */}
                <div className="space-y-4">
                  <EditableInput label="Name" value={name} onChange={setName} />
                  <EditableInput label="Phone Number" value={phone} onChange={setPhone} />
                  <EditableInput label="Email" value={email} onChange={setEmail} type="email" />
                  <EditableInput label="Room Number" value={roomNumber} onChange={setRoomNumber} />
                </div>

                {/* errors */}
                {submitError && (
                  <p className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle size={16} /> {submitError}
                  </p>
                )}

                {/* footer */}
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </span>
                  ) : (
                    "Finish confirmation"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* helpers */
const LockedRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-gray-500">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
)

const EditableInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)
