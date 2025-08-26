// src/pages/FastCheckIn/FastCheckIn.jsx
/* eslint-disable react/prop-types */
"use client"

import { useEffect, useMemo, useState }          from "react"
import { useSearchParams, useNavigate }          from "react-router-dom"
import { useDispatch, useSelector }              from "react-redux"
import axios                                     from "axios"
import { loadStripe }                            from "@stripe/stripe-js"

/* ─── Redux actions ─────────────────────────────────────── */
import {
  addAddon,
  skipAddon,
  startFlow,
  markCompleted,
} from "../../features/fastCheckInSlice/fastCheckInSlice"

/* ─── UI components ─────────────────────────────────────── */
import Button       from "../../components/Ui/Button"
import ApplePayOnly from "../../components/ApplePayOnly/ApplePayOnly"

/* ─── Icons ─────────────────────────────────────────────── */
import * as Lucide from "lucide-react"

/* ─── Env & Stripe ──────────────────────────────────────── */
const API_URL       = import.meta.env.VITE_API_URL
const STRIPE_PK     = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(STRIPE_PK)

/* ─── Products ──────────────────────────────────────────── */
const confirmation = {
  id   : "confirmation-fee",
  label: "Confirmation Fee",
  price: 2,
  Icon : Lucide.CreditCard,
}

const coverage = {
  id     : "incidentals",
  label  : "Incidentals Coverage",
  price  : 10,
  Icon   : Lucide.ShieldCheck,
  bullets: [
    "Covers towel stains, key loss, etc.",
    "No surprise charges",
    "Faster assistance if needed",
  ],
}

/* ─── Helpers ───────────────────────────────────────────── */
const diffDays = (d1, d2) =>
  Math.max(1, Math.ceil((new Date(d2) - new Date(d1)) / 86_400_000))

/* ─── Component ─────────────────────────────────────────── */
export default function FastCheckIn() {
  /* routing ------------------------------------------------ */
  const [search]   = useSearchParams()
  const navigate   = useNavigate()
  const bookingKey = useMemo(() => search.get("booking") ?? "", [search])

  /* redux -------------------------------------------------- */
  const dispatch       = useDispatch()
  const { addons }     = useSelector((s) => s.fastCheckIn)

  /* local -------------------------------------------------- */
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [phase, setPhase]   = useState("select") // select | summary | pay | success
  const [busy,  setBusy]    = useState(false)
  const [appleOK, setApple] = useState(false)

  /* insider code state */
  const [insiderCode, setInsiderCode] = useState("")
  const [codeErr,     setCodeErr]     = useState(null)
  const [validating,  setValidating]  = useState(false)

  /* ensure confirmation fee + coverage are pre-selected ---- */
  useEffect(() => {
    if (bookingKey) {
      dispatch(startFlow(bookingKey))
      dispatch(addAddon({ ...confirmation }))
      dispatch(addAddon({ ...coverage })) // protection ON by default
    }
  }, [bookingKey, dispatch])

  /* fetch booking ----------------------------- */
  useEffect(() => {
    if (!bookingKey) return
    ;(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/bookings/confirmation/${bookingKey}`)
        setBooking(data)
      } catch {
        setError("Unable to load reservation.")
      } finally {
        setLoading(false)
      }
    })()
  }, [bookingKey])

  /* Apple Pay availability -------------------- */
  useEffect(() => {
    if (window?.ApplePaySession?.canMakePayments?.()) setApple(true)
  }, [])

  /* coverage toggle --------------------------- */
  const hasCoverage = addons.some((a) => a.id === coverage.id)
  const toggleCover = () =>
    hasCoverage
      ? dispatch(skipAddon(coverage.id))
      : dispatch(addAddon({ ...coverage }))

  /* totals ------------------------------------ */
  const totalUSD = useMemo(
    () => addons.reduce((s, a) => s + Number(a.price || 0), 0),
    [addons],
  )

  /* ---------- INSIDER CODE FLOW ---------- */
  const handleApplyCode = async () => {
    if (!insiderCode.trim() || validating || !booking) return
    setValidating(true)
    setCodeErr(null)
    try {
      /* 1. Validar código */
      await axios.post(`${API_URL}/discounts/validate`, {
        code   : insiderCode.trim().toUpperCase(),
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      })

      /* 2. Persistir add-ons como “pagados” */
      await axios.post(
        `${API_URL}/addons/bookings/${booking.id}`,
        { addons, discount: true },
      )

      /* 3. Redirigir al success global */
      navigate(
        `/payment/booking-addons-success?bookingId=${booking.id}`,
        { replace: true },
      )
    } catch (e) {
      setCodeErr(
        e.response?.data?.error ||
        "Code validation failed. Please try again.",
      )
    } finally {
      setValidating(false)
    }
  }

  /* ---------- STRIPE checkout ---------- */
  const payWithCard = async () => {
    if (busy || !booking) return
    try {
      setBusy(true)
      /* persist addons */
      await axios.post(`${API_URL}/addons/bookings/${booking.id}`, { addons })
      /* create Stripe session */
      const { data } = await axios.post(
        `${API_URL}/payments/booking-addons/create-session`,
        { bookingId: booking.id, amount: Math.round(totalUSD * 100) },
      )
      const stripe = await stripePromise
      await stripe.redirectToCheckout({ sessionId: data.sessionId })
    } finally {
      setBusy(false)
    }
  }

  /* ---------- UI states ---------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Loading…
      </div>
    )

  if (error || !booking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {error || "Error"}
      </div>
    )

  const { guestName, guestLastName, checkIn, checkOut } = booking
  const nights = diffDays(checkIn, checkOut)

  /* ---------- phase: select ---------- */
  if (phase === "select") {
    return (
      <section className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
        {/* header */}
        <div className="w-full max-w-4xl bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 mb-10">
          <p className="text-blue-600 font-semibold mb-1">
            Confirm your booking to unlock perks&nbsp;&amp;&nbsp;services
          </p>
          <h2 className="text-xl font-bold">Booking #{bookingKey}</h2>
          <p className="text-gray-700 mt-2">
            {guestName} {guestLastName} • {checkIn} → {checkOut} • {nights}{" "}
            {nights === 1 ? "night" : "nights"}
          </p>
        </div>

        {/* unified card */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* confirmation fee */}
          <div className="flex items-center gap-3 mb-6">
            <confirmation.Icon size={26} className="text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold">{confirmation.label}</p>
              <p className="text-sm text-gray-600">Required (refundable)</p>
            </div>
            <span className="font-medium">${confirmation.price.toFixed(2)}</span>
          </div>

          <hr className="my-6" />

          {/* incidentals coverage */}
          <div className="flex items-start gap-3">
            <coverage.Icon size={26} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              {/* switch */}
              <div
                role="button"
                onClick={toggleCover}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer
                  ${hasCoverage ? "bg-blue-50 border border-blue-300" : "bg-gray-50 border border-gray-200"}
                  transition-colors`}
              >
                <span className="font-semibold">{coverage.label}</span>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors
                    ${hasCoverage ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                      transition-transform ${hasCoverage ? "translate-x-5" : ""}`}
                  />
                </div>
              </div>

              {/* bullets */}
              <ul
                className={`mt-4 ml-1 text-sm space-y-1 ${
                  hasCoverage ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {coverage.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Lucide.Check
                      size={14}
                      className={`mt-0.5 ${
                        hasCoverage ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <span className="font-medium mt-3">${coverage.price}</span>
          </div>

          {/* total */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            <span className="font-bold">Total</span>
            <span className="font-bold">${totalUSD.toFixed(2)}</span>
          </div>

          {/* continue */}
          <Button
            className="w-full mt-8"
            onClick={() => {
              dispatch(markCompleted())
              setPhase("summary")
            }}
          >
            Continue
          </Button>

          {/* insider code input */}
          <p className="text-center text-sm text-gray-500 mt-6 mb-3">
            or input an Insider code to confirm the booking
          </p>
          <div className="flex gap-3">
            <input
              value={insiderCode}
              onChange={(e) => setInsiderCode(e.target.value.toUpperCase())}
              placeholder="CODE"
              maxLength={6}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-center tracking-widest
                         focus:outline-none focus:border-blue-500"
            />
            <Button
              variant="secondary"
              disabled={!insiderCode.trim() || validating}
              onClick={handleApplyCode}
            >
              {validating ? "Checking…" : "Apply"}
            </Button>
          </div>
          {codeErr && (
            <p className="mt-3 text-xs text-red-600 flex items-center gap-1">
              <Lucide.AlertTriangle size={14} /> {codeErr}
            </p>
          )}
        </div>
      </section>
    )
  }

  /* ---------- phase: summary ---------- */
  if (phase === "summary") {
    return (
      <section className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-3xl font-bold mb-6">You’re all set!</h1>

        <div className="w-full max-w-lg bg-gray-50 border border-gray-200 rounded-2xl shadow p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Fast Check-In</h2>
          {addons.map((it) => (
            <div
              key={it.id}
              className="flex justify-between py-2 border-b last:border-0"
            >
              <span>{it.label}</span>
              <span className="font-medium">
                ${Number(it.price).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-4 mt-4 border-t">
            <span className="font-bold">Total</span>
            <span className="font-bold">${totalUSD.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setPhase("select")}>
            ← Back
          </Button>
          <Button className="h-14 text-lg px-12" onClick={() => setPhase("pay")}>
            Continue to Checkout
          </Button>
        </div>
      </section>
    )
  }

  /* ---------- phase: pay ---------- */
  if (phase === "pay") {
    return (
      <section className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
        <button
          onClick={() => setPhase("summary")}
          className="flex items-center gap-2 mb-8 text-gray-700 hover:text-blue-700"
        >
          <Lucide.ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-bold mb-4">
          Total: ${totalUSD.toFixed(2)} USD
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Confirmation fee and selected coverage included
        </p>

        {appleOK && (
          <ApplePayOnly
            amount={totalUSD}
            bookingId={booking.id}
            currency="usd"
            onSuccess={() => setPhase("success")}
          />
        )}

        <div className="flex items-center gap-4 w-72 my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-xs text-gray-500">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <Button className="w-72" disabled={busy} onClick={payWithCard}>
          {busy ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lucide.CreditCard size={18} /> Pay with Card
            </div>
          )}
        </Button>

        {busy && (
          <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
            <Lucide.Check size={14} /> Redirecting…
          </p>
        )}
      </section>
    )
  }

  /* ---------- phase: success (local, ApplePay) ---------- */
  return (
    <section className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-12 text-center">
        <Lucide.Check size={48} className="text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thanks for completing your Fast Check-In.
          <br />
          A confirmation email is on the way ✉️
        </p>
        <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
      </div>
    </section>
  )
}
