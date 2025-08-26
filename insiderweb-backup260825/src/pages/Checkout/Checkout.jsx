/* src/pages/Checkout/Checkout.jsx */
"use client"
import { useState, useEffect, useMemo, Fragment } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import {
  Calendar,
  Users,
  MapPin,
  Star,
  CreditCard,
  Lock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Hotel,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  DollarSign,
  Shield,
  Info,
} from "lucide-react"
import {
  setGuestInfo,
  resetCreateStatus,
  clearBookingErrors,
  quoteTravelgateRoom,
} from "../../features/booking/bookingSlice"

// Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const API_URL = import.meta.env.VITE_API_URL

/* ──────────────────────────────────────────────────────────────────────────────
   PaymentType helpers
────────────────────────────────────────────────────────────────────────────── */
const PT_META = {
  MERCHANT: {
    badge: "Pay now",
    color: "bg-indigo-50 text-indigo-800 border border-indigo-200",
    note: "Secure online payment with Stripe.",
  },
  DIRECT: {
    badge: "Pay at hotel",
    color: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    note: "You won't be charged now. Card required to guarantee the booking.",
  },
  CARD_CHECK_IN: {
    badge: "Card at check-in",
    color: "bg-teal-50 text-teal-800 border border-teal-200",
    note: "The hotel will charge at check-in. Card is required as guarantee.",
  },
  CARD_BOOKING: {
    badge: "Pay with card (supplier)",
    color: "bg-amber-50 text-amber-900 border border-amber-200",
    note: "Confirmed now by sending your card to the supplier.",
  },
}
const usesStripe = (pt) => (pt || "").toUpperCase() === "MERCHANT"
const requiresCardToSupplier = (pt) =>
  ["DIRECT", "CARD_CHECK_IN", "CARD_BOOKING"].includes((pt || "").toUpperCase())

/* ──────────────────────────────────────────────────────────────────────────────
   PaymentForm (Stripe) — MERCHANT
   (Parametrizable por endpoints para TGX o PARTNER)
────────────────────────────────────────────────────────────────────────────── */
const PaymentForm = ({
  onPaymentSuccess,
  onPaymentError,
  amount,
  currency,
  optionRefId,
  guestInfo,
  bookingData,
  isProcessing,
  discount,            // ⬅️ discount snapshot
  setIsProcessing,
  createPIEndpoint,    // ⬅️ nuevo
  confirmEndpoint,     // ⬅️ nuevo
}) => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    try {
      // 1) Create PaymentIntent (TGX o PARTNER según endpoint)
      const createRes = await fetch(createPIEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          optionRefId,           // TGX lo usa; PARTNER lo ignora
          guestInfo,
          bookingData,
          discount: discount || bookingData?.discount || null,
        }),
      })

      if (!createRes.ok) {
        const errText = await createRes.text()
        console.error("❌ PI create failed:", createRes.status, errText)
        throw new Error(`Payment intent failed: ${createRes.status} ${createRes.statusText}`)
      }

      const createJson = await createRes.json()
      const clientSecret = createJson?.clientSecret

      if (!clientSecret || typeof clientSecret !== "string") {
        console.error("❌ Missing clientSecret from backend:", createJson)
        throw new Error("Payment could not be initialized. Try again.")
      }

      // 2) Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: guestInfo.fullName,
            email: guestInfo.email,
          },
        },
      })

      if (error) {
        console.error("❌ Payment failed:", error)
        onPaymentError(error.message)
        return
      }

      if (paymentIntent?.status !== "succeeded" && paymentIntent?.status !== "requires_capture") {
        console.error("⚠️ Payment not completed:", paymentIntent?.status)
        onPaymentError(`Payment status: ${paymentIntent?.status || "unknown"}`)
        return
      }

      // 3) Confirm server-side booking/finalization
      const bookRes = await fetch(confirmEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          discount: discount || bookingData?.discount || null,
        }),
      })

      const bookJson = await bookRes.json()
      if (!bookRes.ok || !bookJson?.success) {
        console.error("❌ Booking finalize failed:", bookJson)
        onPaymentError(bookJson?.error || "Booking finalize failed")
        return
      }

      onPaymentSuccess(bookJson)
    } catch (err) {
      console.error("💥 Payment process error:", err)
      onPaymentError(err.message || "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#9e2146" },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Pay {currency} {Number(amount).toFixed(2)}
          </>
        )}
      </button>
    </form>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   GuaranteeForm (DIRECT / CARD_CHECK_IN / CARD_BOOKING)
────────────────────────────────────────────────────────────────────────────── */
const GuaranteeForm = ({
  onSuccess,
  onError,
  optionRefId,
  guestInfo,
  bookingData,
  discount,
  isProcessing,
  setIsProcessing,
  paymentType,
  getFinalNightlyPrice,
  totalNights,
  getCurrency,
}) => {
  const [form, setForm] = useState({
    type: "VI",
    holderName:
      guestInfo?.fullName?.split(" ")?.slice(0, -1)?.join(" ") ||
      guestInfo?.fullName ||
      "",
    holderSurname: guestInfo?.fullName?.split(" ")?.slice(-1)?.join(" ") || "",
    number: "",
    cvc: "",
    month: "",
    year: "",
  })

  const handle = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!optionRefId) return onError("Missing optionRefId")

    if (!form.number || !form.cvc || !form.month || !form.year) {
      return onError("Please complete card details.")
    }

    const nightly = Number(getFinalNightlyPrice()) || 0
    const totalAmount = Math.max(0, nightly * Number(totalNights || 1))
    const curr = (getCurrency() || "EUR").toUpperCase()

    setIsProcessing(true)
    try {
      const payload = {
        optionRefId,
        guestInfo,
        bookingData: {
          ...bookingData,
          price: { amount: totalAmount, currency: curr },
          discount: discount || bookingData?.discount || null,
        },
        discount: discount || null,
        paymentType,
        paymentCard: {
          type: form.type,
          holder: {
            name: form.holderName || guestInfo?.fullName || "Guest",
            surname: form.holderSurname || "",
          },
          number: form.number,
          CVC: form.cvc,
          expire: { month: Number(form.month), year: Number(form.year) },
        },
        amount: totalAmount,
        currency: curr,
      }

      const res = await fetch(`${API_URL}/tgx-payment/book-with-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json?.success) {
        console.error("❌ book-with-card failed:", json)
        return onError(json?.error || "Booking failed")
      }

      onSuccess(json)
    } catch (err) {
      console.error("💥 book-with-card error:", err)
      onError(err.message || "Booking failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const isCardBooking = (paymentType || "").toUpperCase() === "CARD_BOOKING"

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Card Type</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => handle("type", e.target.value)}
            >
              <option value="VI">Visa (VI)</option>
              <option value="MC">Mastercard (MC)</option>
              <option value="AX">Amex (AX)</option>
              <option value="DC">Diners (DC)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Number</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="4111 1111 1111 1111"
              value={form.number}
              onChange={(e) => handle("number", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">CVC</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="123"
              value={form.cvc}
              onChange={(e) => handle("cvc", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Exp. Month</label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="MM"
                value={form.month}
                onChange={(e) => handle("month", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Exp. Year</label>
              <input
                type="number"
                min={new Date().getFullYear()}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="YYYY"
                value={form.year}
                onChange={(e) => handle("year", e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Holder Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.holderName}
              onChange={(e) => handle("holderName", e.target.value)}
              placeholder="Name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Holder Surname</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.holderSurname}
              onChange={(e) => handle("holderSurname", e.target.value)}
              placeholder="Surname"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-600">
        <Shield className="h-4 w-4 mt-0.5" />
        <span>
          {isCardBooking
            ? "We will confirm the reservation by sending your card to the supplier for immediate charge."
            : "Your card is sent securely to the supplier as a guarantee. Any charge, if applicable, is made by the hotel."}
        </span>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing…
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Confirm reservation
          </>
        )}
      </button>
    </form>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Checkout Page
────────────────────────────────────────────────────────────────────────────── */
const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    selectedRoom,
    selectedHotel,
    source,
    tgxHotel,
    customPrice,
    checkIn,
    checkOut,
    totalNights,
    adults,
    children,
    rooms,
    guestName,
    guestEmail,
    guestPhone,
    quoteStatus,
    quoteError,
    quoteData,
    currency,
  } = useSelector((s) => s.booking)

  // ⬇️ Discount from global state
  const discount = useSelector((s) => s.discount) // { active, percentage, specialDiscountPrice, code, validatedBy? }

  // Local state
  const [guestForm, setGuestForm] = useState({
    fullName: guestName || "",
    email: guestEmail || "",
    phone: guestPhone || "",
    specialRequests: "",
  })
  // Si venimos de PARTNER, el primer paso después del form será payment
  const [currentStep, setCurrentStep] = useState("guest-info")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)

  // Debug
  useEffect(() => {
    console.log("🔍 Checkout State:", {
      selectedRoom,
      selectedHotel,
      source,
      tgxHotel,
      checkIn,
      checkOut,
      totalNights,
      quoteStatus,
      hasRateKey: selectedRoom?.rateKey,
      optionRefId: quoteData?.optionRefId,
      paymentType: selectedRoom?.paymentType,
      discount,
    })
  }, [selectedRoom, selectedHotel, source, tgxHotel, checkIn, checkOut, totalNights, quoteStatus, quoteData, discount])

  // Redirect if no selection
  useEffect(() => {
    if (!selectedRoom && customPrice == null && !selectedHotel) {
      console.log("❌ No booking data found, redirecting to hotels")
      navigate("/")
    }
  }, [selectedRoom, customPrice, selectedHotel, navigate])

  // Cleanup errors on mount/unmount
  useEffect(() => {
    dispatch(clearBookingErrors())
    return () => {
      dispatch(resetCreateStatus())
    }
  }, [dispatch])

  // Helpers

  // Si PARTNER no trae paymentType, asumimos MERCHANT (Stripe)
  const paymentType = (
    selectedRoom?.paymentType ||
    (source === "PARTNER" ? "MERCHANT" : "")
  ).toUpperCase()

  const paymentMeta =
    PT_META[paymentType] || { badge: "Payment", color: "bg-gray-100 text-gray-700 border", note: "" }

  const handleGuestFormChange = (field, value) => {
    setGuestForm((prev) => ({ ...prev, [field]: value }))
  }
  const isGuestFormValid = () =>
    guestForm.fullName.trim() && guestForm.email.trim() && guestForm.phone.trim()

  /* ─────────────── Prices: base vs discounted ─────────────── */
  const getCurrency = () =>
    (quoteData?.price?.currency || selectedRoom?.currency || currency || "EUR").toUpperCase()

  const getBaseNightlyPrice = () => {
    const q = Number(quoteData?.price?.amount)
    if (Number.isFinite(q) && q > 0) return q
    const base = Number(selectedRoom?.price || customPrice || 0)
    return Number.isFinite(base) ? base : 0
  }

  const hasDiscount =
    !!discount?.active &&
    ((Number.isFinite(discount?.percentage) && discount.percentage > 0) ||
      (discount?.specialDiscountPrice !== null && Number.isFinite(+discount.specialDiscountPrice)))

  const getFinalNightlyPrice = () => {
    const base = getBaseNightlyPrice()
    if (!hasDiscount) return base

    if (discount.specialDiscountPrice !== null && Number.isFinite(+discount.specialDiscountPrice)) {
      return Math.max(0, +discount.specialDiscountPrice)
    }

    const pct = Number(discount.percentage) || 0
    const reduced = base * (1 - pct / 100)
    return Math.max(0, Number.isFinite(reduced) ? +reduced.toFixed(2) : base)
  }

  const getFinalTotalAmount = () =>
    Math.max(0, Number(getFinalNightlyPrice() * Number(totalNights || 1)))

  /* ─────────────── Step handlers ─────────────── */
  const handleProceedToQuote = async () => {
    if (!isGuestFormValid()) {
      alert("Please fill in all guest information fields")
      return
    }

    dispatch(setGuestInfo(guestForm))

    // PARTNER: saltar quote → ir directo a payment
    if (source === "PARTNER") {
      setCurrentStep("payment")
      return
    }

    // TGX: hacer quote normal
    if (!selectedRoom?.rateKey) {
      alert("No rate key available for this room. Please select a room again.")
      return
    }

    setCurrentStep("quote")
    try {
      console.log("🔍 Starting Quote with rateKey:", selectedRoom.rateKey)
      await dispatch(quoteTravelgateRoom({ rateKey: selectedRoom.rateKey }))
    } catch (error) {
      console.error("❌ Quote failed:", error)
    }
  }

  const handleProceedToPayment = () => {
    // En TGX, requiere optionRefId desde quote
    if (source === "TGX" && !quoteData?.optionRefId) {
      alert("Quote data not available. Please try again.")
      return
    }
    setCurrentStep("payment")
  }

  const handlePaymentSuccess = (result) => {
    console.log("✅ Booking successful:", result)
    setBookingResult(result)
    setCurrentStep("confirmation")
  }
  const handlePaymentError = (error) => {
    console.error("❌ Payment error:", error)
    setPaymentError(error)
  }

  // Formatting
  const formatDate = (dateString) => {
    if (!dateString) return "Not selected"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  /* ─────────────── Print / PDF certificate ─────────────── */
  const handlePrintCertificate = () => {
    const bookingId   = bookingResult?.bookingData?.bookingID || bookingResult?.bookingId || "—"
    const guestName   = guestForm.fullName || "-"
    const guestEmail  = guestForm.email || "-"
    const guestPhone  = guestForm.phone || "-"
    const numGuests   = Number(adults || 0) + Number(children || 0)
    const numRooms    = Number(rooms || 1)
    const checkInTxt  = formatDate(checkIn)
    const checkOutTxt = formatDate(checkOut)
    const nightsTxt   = `${totalNights} night${totalNights !== 1 ? "s" : ""}`
    const currencyTxt = getCurrency()
    const nightly     = getFinalNightlyPrice()
    const total       = getFinalTotalAmount()

    const hotelName   = selectedHotel?.name || selectedHotel?.hotelName || "Hotel"
    const hotelAddr   =
      selectedHotel?.address ||
      selectedHotel?.location?.address ||
      [selectedHotel?.location?.city, selectedHotel?.location?.country].filter(Boolean).join(", ") ||
      "-"
    const hotelPhone  = selectedHotel?.phone || "-"

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Booking Certificate - ${bookingId}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#111;}
    .page{width:800px; margin:24px auto; padding:28px 32px; background:#fff; border:1px solid #e5e7eb;}
    .brand{display:flex; align-items:center; gap:10px; margin-bottom:8px;}
    .brand .logo{width:28px; height:28px; border-radius:6px; background:#111; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700;}
    .title{color:#f97316; font-size:26px; font-weight:800; letter-spacing:.5px; margin:10px 0 18px;}
    .hr{height:2px; background:#f97316; margin:6px 0 18px;}
    .grid{display:grid; grid-template-columns: 1fr 1fr; gap:10px 24px; font-size:14px;}
    .label{color:#6b7280}
    .box{border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-top:18px;}
    .section-title{font-weight:700; margin-bottom:8px;}
    .totals{display:grid; grid-template-columns:1fr auto; gap:6px; font-size:14px}
    .totals .sum{font-weight:700; font-size:16px}
    .footer{margin-top:24px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#6b7280}
    .sig{margin-top:16px; text-align:right}
    @media print {
      body{background:#fff}
      .no-print{display:none !important}
      .page{border:none; margin:0; width:auto}
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">
      <div class="logo">i</div>
      <div style="font-weight:800;">Insider</div>
    </div>
    <div class="title">BOOKING CONFIRMATION</div>
    <div class="hr"></div>

    <div class="grid">
      <div><div class="label">Booking ID</div><div>${bookingId}</div></div>
      <div><div class="label">Number of Rooms</div><div>${numRooms}</div></div>

      <div><div class="label">Guest Name</div><div>${guestName}</div></div>
      <div><div class="label">Number of Guests</div><div>${numGuests}</div></div>

      <div><div class="label">Check-in Date</div><div>${checkInTxt}</div></div>
      <div><div class="label">Check-out Date</div><div>${checkOutTxt}</div></div>

      <div><div class="label">Property</div><div>${hotelName}</div></div>
      <div><div class="label">Nights</div><div>${nightsTxt}</div></div>

      <div style="grid-column:1/-1"><div class="label">Address</div><div>${hotelAddr}</div></div>
      <div><div class="label">Property Contact</div><div>${hotelPhone}</div></div>
      <div><div class="label">Guest Email</div><div>${guestEmail}</div></div>
      <div><div class="label">Guest Phone</div><div>${guestPhone}</div></div>
    </div>

    <div class="box">
      <div class="section-title">RATES AND PAYMENT</div>
      <div class="totals">
        <div>${currencyTxt} ${nightly.toFixed(2)} × ${totalNights} night${totalNights !== 1 ? "s" : ""}</div>
        <div>${currencyTxt} ${(nightly*totalNights).toFixed(2)}</div>

        <div class="sum">Total Cost</div>
        <div class="sum">${currencyTxt} ${total.toFixed(2)}</div>

        <div>Payment Method</div>
        <div>${usesStripe(paymentType) ? "Credit Card (Stripe)" : "Card on file / Supplier"}</div>
      </div>
    </div>

    <div class="box">
      <div class="section-title">Cancellation Policy</div>
      <div style="font-size:12px; color:#6b7280;">
        ${source === "TGX"
          ? (quoteData?.cancelPolicy?.refundable
              ? "Refundable booking — Cancel according to hotel policy."
              : "Non-refundable booking — No cancellation allowed.")
          : "Please contact the property for cancellation terms."}
      </div>
    </div>

    <div class="sig">
      <div style="height:36px;"></div>
      <div style="border-top:1px solid #e5e7eb; padding-top:6px; font-size:12px;">Authorized Signature</div>
    </div>

    <div class="footer">
      <div>Please present this booking confirmation at check-in.</div>
      <div>Generated on ${new Date().toLocaleString()}</div>
    </div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>
    `

    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000")
    if (!w) {
      alert("Please allow pop-ups to print your certificate.")
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  /* ─────────────── Step indicator ─────────────── */
  const renderStepIndicator = () => {
    const steps =
      source === "PARTNER"
        ? [
            { id: "guest-info", label: "Guest Info", icon: User },
            { id: "payment", label: "Payment", icon: CreditCard },
            { id: "confirmation", label: "Confirmation", icon: CheckCircle },
          ]
        : [
            { id: "guest-info", label: "Guest Info", icon: User },
            { id: "quote", label: "Quote", icon: DollarSign },
            { id: "payment", label: "Payment", icon: CreditCard },
            { id: "confirmation", label: "Confirmation", icon: CheckCircle },
          ]

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const currentIndex = steps.findIndex((s) => s.id === currentStep)
          const isCompleted = currentIndex > index
          const isError = step.id === "quote" && quoteStatus === "failed"

          return (
            <Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isError
                      ? "border-red-500 bg-red-50 text-red-600"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isActive
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  {isError ? (
                    <XCircle className="h-5 w-5" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium whitespace-nowrap ${
                    isActive ? "text-red-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-8 w-0.5 mx-auto sm:h-0.5 sm:w-8 sm:mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  // Booking data snapshot (para auditoría BE/commission)
  const paymentBookingData = useMemo(
    () => ({
      checkIn,
      checkOut,
      hotelId:
        source === "TGX"
          ? (tgxHotel?.hotelCode || selectedHotel?.hotelCode)
          : selectedHotel?.id,
      localHotelId: source === "PARTNER" ? selectedHotel?.id : undefined,
      roomId: selectedRoom?.id,
      source,
      paymentType,
      discount: {
        active: !!discount?.active,
        code: discount?.code || null,
        percentage: Number(discount?.percentage) || 0,
        specialDiscountPrice:
          discount?.specialDiscountPrice !== null
            ? Number(discount?.specialDiscountPrice)
            : null,
        validatedBy: discount?.validatedBy ?? null, // { name, staff_id?, user_id? }
      },
    }),
    [
      checkIn,
      checkOut,
      source,
      tgxHotel?.hotelCode,
      selectedHotel?.hotelCode,
      selectedHotel?.id,
      selectedRoom?.id,
      paymentType,
      discount,
    ]
  )

  // Endpoints según source
  const createPIEndpoint =
    source === "PARTNER"
      ? `${API_URL}/payments/create-payment-intent`
      : `${API_URL}/tgx-payment/create-payment-intent`

  const confirmEndpoint =
    source === "PARTNER"
      ? `${API_URL}/payments/confirm-and-book`
      : `${API_URL}/tgx-payment/confirm-and-book`

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Complete your booking</h1>
              <div className="w-16" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          {renderStepIndicator()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trip Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your trip</h2>
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Dates</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(checkIn)} - {formatDate(checkOut)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalNights} night{totalNights !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {/* Guests */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Guests</div>
                        <div className="text-sm text-gray-600">
                          {adults} adult{adults !== 1 ? "s" : ""}
                          {children > 0 && (
                            <>
                              {", "}
                              {children} child{children !== 1 ? "ren" : ""}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {rooms} room{rooms !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {/* Room */}
                  {selectedRoom && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <Hotel className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{selectedRoom.name}</div>
                          <div className="text-sm text-gray-600">{selectedRoom.description}</div>
                          {selectedRoom.rateKey && source === "TGX" && (
                            <div className="text-xs text-gray-500 mt-1">
                              Rate Key: {String(selectedRoom.rateKey).substring(0, 20)}...
                            </div>
                          )}
                          {/* Payment badge */}
                          {paymentType && (
                            <div
                              className={`inline-flex items-center gap-2 text-xs font-medium mt-2 px-2 py-1 rounded-full ${paymentMeta.color}`}
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>{paymentMeta.badge}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price (base vs discounted) */}
                      <div className="text-right text-sm text-gray-700">
                        {hasDiscount && (
                          <div className="line-through text-gray-400">
                            {getCurrency()} {getBaseNightlyPrice().toFixed(2)}
                          </div>
                        )}
                        <div className={hasDiscount ? "text-red-600 font-semibold" : ""}>
                          {getCurrency()} {getFinalNightlyPrice().toFixed(2)}/night
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Steps */}
              {currentStep === "guest-info" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Guest information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestForm.fullName}
                        onChange={(e) => handleGuestFormChange("fullName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestForm.email}
                        onChange={(e) => handleGuestFormChange("email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={guestForm.phone}
                        onChange={(e) => handleGuestFormChange("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                      <textarea
                        value={guestForm.specialRequests}
                        onChange={(e) => handleGuestFormChange("specialRequests", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Any special requests or preferences..."
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleProceedToQuote}
                      disabled={!isGuestFormValid()}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {source === "PARTNER" ? "Continue to Payment" : "Continue to Quote"}
                    </button>
                  </div>
                </div>
              )}

              {/* Quote Step (solo TGX) */}
              {source !== "PARTNER" && currentStep === "quote" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Quote Verification</h2>
                  </div>
                  {quoteStatus === "loading" && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                      <span className="ml-2 text-gray-600">Getting latest pricing...</span>
                    </div>
                  )}
                  {quoteStatus === "failed" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Quote Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{quoteError}</p>
                      <button
                        onClick={handleProceedToQuote}
                        className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      >
                        Retry Quote
                      </button>
                    </div>
                  )}
                  {quoteStatus === "succeeded" && quoteData && (
                    <div className="space-y-6">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-700 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Quote Confirmed</span>
                        </div>
                        <div className="text-sm text-green-600">
                          Latest pricing and availability confirmed for your selected room.
                        </div>
                      </div>

                      {/* Payment method info */}
                      {paymentType && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${paymentMeta.color}`}>
                          <Info className="h-4 w-4 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-semibold">{paymentMeta.badge}</div>
                            <div className="opacity-90">{paymentMeta.note}</div>
                          </div>
                        </div>
                      )}

                      {/* Updated Price Information */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Updated Pricing</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Nightly Rate ({getCurrency()})</span>
                            <span className="font-medium">
                              {hasDiscount && (
                                <span className="line-through text-gray-400 mr-2">
                                  {getBaseNightlyPrice().toFixed(2)}
                                </span>
                              )}
                              <span className={hasDiscount ? "text-red-600 font-semibold" : ""}>
                                {getFinalNightlyPrice().toFixed(2)}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Nights</span>
                            <span>{totalNights}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total Amount</span>
                            <span>
                              {getCurrency()} {getFinalTotalAmount().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleProceedToPayment}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Step */}
              {currentStep === "payment" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                    <Lock className="h-4 w-4 text-green-500" />
                  </div>

                  {/* Payment badge */}
                  {paymentType && (
                    <div
                      className={`mb-4 px-3 py-2 rounded-lg inline-flex items-center gap-2 ${paymentMeta.color}`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">{paymentMeta.badge}</span>
                    </div>
                  )}
                  {paymentMeta.note && <p className="text-xs text-gray-600 mb-4">{paymentMeta.note}</p>}

                  {/* Terms */}
                  <div className="mb-6">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-red-600 hover:text-red-700 underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  {/* Payment Error */}
                  {paymentError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Payment Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                    </div>
                  )}

                  {/* Forms */}
                  {agreeToTerms ? (
                    usesStripe(paymentType) ? (
                      <PaymentForm
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        amount={getFinalTotalAmount()}
                        currency={getCurrency()}
                        optionRefId={quoteData?.optionRefId} // TGX lo usa; PARTNER lo ignora
                        guestInfo={guestForm}
                        bookingData={{
                          ...paymentBookingData,
                          // asegurar ids locales para PARTNER
                          localHotelId: selectedHotel?.id,
                          hotelId: selectedHotel?.id,
                        }}
                        discount={paymentBookingData.discount}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                        createPIEndpoint={createPIEndpoint}
                        confirmEndpoint={confirmEndpoint}
                      />
                    ) : requiresCardToSupplier(paymentType) ? (
                      <GuaranteeForm
                        onSuccess={handlePaymentSuccess}
                        onError={setPaymentError}
                        optionRefId={quoteData?.optionRefId}
                        guestInfo={guestForm}
                        bookingData={paymentBookingData}
                        discount={paymentBookingData.discount}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                        paymentType={paymentType}
                        getFinalNightlyPrice={getFinalNightlyPrice}
                        totalNights={totalNights}
                        getCurrency={getCurrency}
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600">
                          Unsupported payment method. Please go back and select another option.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-gray-600">Please agree to the terms and conditions to proceed.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation Step */}
              {currentStep === "confirmation" && bookingResult && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                      {usesStripe(paymentType)
                        ? "Your reservation has been successfully created and paid."
                        : "Your reservation has been successfully created."}
                    </p>

                    {/* ⬇️ Botón para imprimir/descargar certificado */}
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-4">
                      <button
                        onClick={handlePrintCertificate}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Print / Download Certificate (PDF)
                      </button>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="text-left space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Booking ID:</span>
                          <span className="font-mono text-sm">
                            {bookingResult.bookingData?.bookingID ||
                              bookingResult.bookingId ||
                              "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span className="capitalize">
                            {bookingResult.bookingData?.status || "OK"}
                          </span>
                        </div>
                        {usesStripe(paymentType) && (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium">Total Paid:</span>
                              <span>
                                {bookingResult.currency?.toUpperCase?.() || getCurrency()}{" "}
                                {bookingResult.paymentAmount ??
                                  getFinalTotalAmount().toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Payment ID:</span>
                              <span className="font-mono text-xs">
                                {bookingResult.paymentIntentId}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => navigate("/")}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Back to Hotels
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/booking-details/${
                              bookingResult.bookingData?.bookingID ||
                              bookingResult.bookingId
                            }`
                          )
                        }
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        View Booking Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {/* Hotel Info */}
                  <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {(selectedHotel?.name || selectedHotel?.hotelName || "H").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {selectedHotel?.name || selectedHotel?.hotelName || "Hotel Name"}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {selectedHotel?.rating || selectedHotel?.categoryCode || "4"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {selectedHotel?.address ||
                            selectedHotel?.location?.address ||
                            [selectedHotel?.location?.city, selectedHotel?.location?.country]
                              .filter(Boolean)
                              .join(", ") ||
                            "Hotel Address"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Price breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getCurrency()}{" "}
                          {hasDiscount ? (
                            <>
                              <span className="line-through mr-2 text-gray-400">
                                {getBaseNightlyPrice().toFixed(2)}
                              </span>
                              <span className="text-red-600 font-semibold">
                                {getFinalNightlyPrice().toFixed(2)}
                              </span>
                            </>
                          ) : (
                            getBaseNightlyPrice().toFixed(2)
                          )}{" "}
                          x {totalNights} night{totalNights !== 1 ? "s" : ""}
                        </span>
                        <span className="text-gray-900">
                          {getCurrency()} {getFinalTotalAmount().toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">
                          {getCurrency()} {getFinalTotalAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Booking Info */}
                  <div className="mt-6 space-y-4">
                    {usesStripe(paymentType) ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Payment processed securely through Stripe.</p>
                      </div>
                    ) : requiresCardToSupplier(paymentType) ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-emerald-700">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">Card protection</span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          Your details are sent encrypted to the supplier. Any charge is made by the hotel according to its policy.
                        </p>
                      </div>
                    ) : null}

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <Hotel className="h-4 w-4" />
                        <span className="text-sm font-medium">Hotel Booking</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {source === "TGX" ? "Reservation confirmed through TravelgateX" : "Reservation confirmed for partner hotel"}
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  {source === "TGX" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Cancellation Policy</span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        {quoteData?.cancelPolicy?.refundable
                          ? "Refundable booking - Cancel according to hotel policy"
                          : "Non-refundable booking - No cancellation allowed"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right column end */}
          </div>
        </div>
      </div>
    </Elements>
  )
}

export default Checkout
