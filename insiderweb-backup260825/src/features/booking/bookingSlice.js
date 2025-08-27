import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL

/* ────────────────────────── */
/* ASYNC THUNKS               */
/* ────────────────────────── */

// TravelgateX Quote
// Accepts the room's rateKey and forwards it to the backend.
export const quoteTravelgateRoom = createAsyncThunk(
  "booking/quoteTravelgateRoom",
  async ({ rateKey }, { rejectWithValue }) => {
    try {
      console.log("🔍 Calling TravelgateX Quote API with rateKey:", rateKey)

      const response = await fetch(`${API_URL}/tgx/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rateKey }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get quote")
      }

      const data = await response.json()
      console.log("✅ Quote response:", data)
      return {
        quote: data,
        quoteRateKey: data?.rateKey || null,
      }
    } catch (err) {
      console.error("❌ Quote error:", err)
      return rejectWithValue(err.message)
    }
  },
)

// Stripe Payment Processing
export const processStripePayment = createAsyncThunk(
  "booking/processStripePayment",
  async (paymentInput, { rejectWithValue }) => {
    try {
      console.log("💳 Processing Stripe payment:", paymentInput)

      const response = await fetch(`${API_URL}/payments/stripe/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentInput),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Payment failed")
      }

      const data = await response.json()
      console.log("✅ Payment response:", data)
      return data
    } catch (err) {
      console.error("❌ Payment error:", err)
      return rejectWithValue(err.message)
    }
  },
)

// TravelgateX Book (only after successful payment)
export const bookTravelgateRoom = createAsyncThunk(
  "booking/bookTravelgateRoom",
  async (bookingInput, { rejectWithValue }) => {
    try {
      console.log("🎯 Calling TravelgateX Book API with input:", bookingInput)

      const response = await fetch(`${API_URL}/tgx/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingInput),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create booking")
      }

      const data = await response.json()
      console.log("✅ Booking response:", data)
      return data
    } catch (err) {
      console.error("❌ Booking error:", err)
      return rejectWithValue(err.message)
    }
  },
)

// Legacy booking creation (keep for compatibility)
export const createBooking = createAsyncThunk("booking/createBooking", async (bookingData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create booking")
    }
    return await response.json()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const confirmPayment = createAsyncThunk("booking/confirmPayment", async (paymentData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/payments/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to confirm payment")
    }
    return await response.json()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

/* unified list (inside + outside) */
export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async ({ status, limit, offset } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const params = new URLSearchParams()
      if (status) params.append("status", status)
      if (limit) params.append("limit", limit)
      if (offset) params.append("offset", offset)
      /* unified endpoint */
      const response = await fetch(`${API_URL}/bookings/me?${params}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch bookings")
      return await response.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel booking")
      }
      return await response.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchBookingById = createAsyncThunk("booking/fetchBookingById", async (bookingId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`)
    if (!response.ok) throw new Error("Failed to fetch booking details")
    return await response.json()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

/* ────────────────────────── */
/* INITIAL STATE              */
/* ────────────────────────── */
const initialState = {
  /* data for active checkout flow */
  id: null,
  user_id: null,

  // Identificación del hotel (LOCAL o TGX)
  hotelId: null,                 // para hoteles locales (DB)
  roomId: null,                  // para habitaciones locales (DB)
  tgxHotel: null,                // { hotelCode } cuando es TGX
  source: null,                  // "TGX" | "LOCAL"

  discountCodeId: null,
  checkIn: "",
  checkOut: "",
  adults: 1,
  children: 0,
  rooms: 1,
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  total: 0,

  // Estado de pago final del booking
  bookingPaymentStatus: "unpaid", // "unpaid" | "paid"

  addOns: [],

  /* UI helpers */
  selectedRoom: null,
  selectedHotel: null,
  totalNights: 0,
  totalPrice: 0,
  customPrice: null,
  discountCode: "",
  discountPercentage: 0,
  paymentMethod: null,
  currency: "EUR",

  /* TravelgateX specific states */
  searchRateKey: null,          // rateKey devuelto por la SEARCH
  quoteRateKey: null,           // rateKey devuelto por la QUOTE
  quoteStatus: "idle", // idle, loading, succeeded, failed
  quoteError: null,
  quoteData: null,

  /* Stripe payment PROCESS states */
  paymentProcessStatus: "idle", // idle, loading, succeeded, failed
  paymentError: null,
  paymentData: null,

  /* TravelgateX booking states */
  bookStatus: "idle", // idle, loading, succeeded, failed
  bookError: null,
  bookingData: null,

  /* async states */
  createStatus: "idle",
  createError: null,
  confirmStatus: "idle",
  confirmError: null,
  userBookings: [],
  userBookingsStatus: "idle",
  userBookingsError: null,
  currentBookingDetails: null,
  bookingDetailsStatus: "idle",
  bookingDetailsError: null,
  cancelStatus: "idle",
  cancelError: null,
}

/* ────────────────────────── */
/* HELPERS                    */
/* ────────────────────────── */
const calculateNights = (ci, co) => (!ci || !co ? 0 : Math.ceil((new Date(co) - new Date(ci)) / 86_400_000))

const calculateTotalPrice = (pricePerNight, nights, rooms = 1, disc = 0) => {
  if (!pricePerNight || !nights) return 0
  const base = pricePerNight * nights * rooms
  return disc ? base * (1 - disc / 100) : base
}

/* ────────────────────────── */
/* SLICE                      */
/* ────────────────────────── */
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setHotelId(state, { payload }) {
      state.hotelId = payload
      state.source = "LOCAL"
      state.tgxHotel = null
    },
    setRoomId(state, { payload }) {
      state.roomId = payload
    },
    setCheckIn(state, { payload }) {
      state.checkIn = payload
      if (state.checkOut && (state.selectedRoom || state.customPrice != null)) {
        const n = calculateNights(payload, state.checkOut)
        state.totalNights = n
        const price = state.customPrice ?? state.selectedRoom.price
        state.totalPrice = calculateTotalPrice(price, n, state.rooms, state.discountPercentage)
      }
    },
    setCheckOut(state, { payload }) {
      state.checkOut = payload
      if (state.checkIn && (state.selectedRoom || state.customPrice != null)) {
        const n = calculateNights(state.checkIn, payload)
        state.totalNights = n
        const price = state.customPrice ?? state.selectedRoom.price
        state.totalPrice = calculateTotalPrice(price, n, state.rooms, state.discountPercentage)
      }
    },
    setAdults(state, { payload }) {
      state.adults = payload
    },
    setChildren(state, { payload }) {
      state.children = payload
    },
    setRoomsCount(state, { payload }) {
      state.rooms = payload
      if ((state.selectedRoom || state.customPrice != null) && state.totalNights) {
        const price = state.customPrice ?? state.selectedRoom.price
        state.totalPrice = calculateTotalPrice(price, state.totalNights, payload, state.discountPercentage)
      }
    },

    // 🆕 Acción mejorada para setear room/hotel desde TGX o LOCAL
    setBookingRoom(state, { payload }) {
      const { room, hotel, checkIn, checkOut, source = "TGX", tgxHotel = null } = payload || {}

      // Fuente
      state.source = source

      // Room seleccionada (conservamos todo lo que venga)
      state.selectedRoom = room ? { ...room } : null
      state.roomId = room?.id ?? null
      // rateKey de la SEARCH
      state.searchRateKey = room?.rateKey || room?.optionRefId || null
      // resetear info de quote previa
      state.quoteRateKey = null

      // Normalizar hotel mostrado en checkout
      const normalizedHotel = hotel
        ? {
            ...hotel,
            name: hotel.name || hotel.hotelName,
            address:
              hotel.address ||
              hotel.location?.address ||
              [hotel.location?.city, hotel.location?.country].filter(Boolean).join(", "),
            rating: hotel.rating || hotel.categoryCode || "4",
            image: hotel.image || null,
          }
        : null

      state.selectedHotel = normalizedHotel

      // Identificación TGX vs LOCAL
      if (source === "TGX") {
        state.tgxHotel = tgxHotel || (hotel?.hotelCode ? { hotelCode: hotel.hotelCode } : null)
        state.hotelId = null
      } else {
        state.tgxHotel = null
        state.hotelId = hotel?.id ?? null
      }

      // Fechas
      state.checkIn = checkIn
      state.checkOut = checkOut

      // Moneda y totales
      state.currency = (room?.currency || state.currency || "EUR").toUpperCase()
      const n = calculateNights(checkIn, checkOut)
      state.totalNights = n
      const pricePerNight = Number(state.customPrice ?? room?.price ?? 0)
      state.totalPrice = calculateTotalPrice(pricePerNight, n, state.rooms, state.discountPercentage)

      // Reset de estados de flujo
      state.customPrice = null
      state.quoteStatus = "idle"
      state.quoteError = null
      state.quoteData = null
      state.paymentProcessStatus = "idle"
      state.paymentError = null
      state.paymentData = null
      state.bookStatus = "idle"
      state.bookError = null
      state.bookingData = null

      console.log("🎯 Booking room set in Redux:", {
        room: room?.name,
        hotel: normalizedHotel?.name,
        checkIn,
        checkOut,
        nights: n,
        totalPrice: state.totalPrice,
        rateKey: room?.rateKey,
        source,
        tgxHotel: state.tgxHotel,
      })
    },

    setGuestInfo(state, { payload }) {
      state.guestName = payload.fullName
      state.guestEmail = payload.email
      state.guestPhone = payload.phone
    },
    setPaymentMethod(state, { payload }) {
      state.paymentMethod = payload
    },
    applyDiscount(state, { payload }) {
      const { code, percentage, id } = payload
      state.discountCode = code
      state.discountPercentage = percentage
      state.discountCodeId = id
      state.customPrice = null
      if ((state.selectedRoom || state.customPrice != null) && state.totalNights) {
        const price = state.customPrice ?? state.selectedRoom.price
        state.totalPrice = calculateTotalPrice(price, state.totalNights, state.rooms, percentage)
      }
    },
    removeDiscount(state) {
      state.discountCode = ""
      state.discountPercentage = 0
      state.discountCodeId = null
      if ((state.selectedRoom || state.customPrice != null) && state.totalNights) {
        const price = state.customPrice ?? state.selectedRoom.price
        state.totalPrice = calculateTotalPrice(price, state.totalNights, state.rooms, 0)
      }
    },
    /* Special Offer (fixed nightly rate) */
    setCustomPrice(state, { payload }) {
      const price = +payload
      state.customPrice = price
      state.discountCode = ""
      state.discountPercentage = 0
      state.discountCodeId = null
      const n = calculateNights(state.checkIn, state.checkOut)
      state.totalNights = n
      state.totalPrice = n ? price * n * state.rooms : 0
      state.selectedRoom = null
    },
    clearBookingErrors(state) {
      state.createError = null
      state.confirmError = null
      state.userBookingsError = null
      state.bookingDetailsError = null
      state.cancelError = null
      state.quoteError = null
      state.paymentError = null
      state.bookError = null
    },
    resetBooking(state) {
      Object.assign(state, {
        ...initialState,
        userBookings: state.userBookings,
        userBookingsStatus: state.userBookingsStatus,
        userBookingsError: state.userBookingsError,
      })
    },
    resetCreateStatus(state) {
      state.createStatus = "idle"
      state.createError = null
    },
    resetConfirmStatus(state) {
      state.confirmStatus = "idle"
      state.confirmError = null
    },
    resetBookingFlow(state) {
      state.quoteStatus = "idle"
      state.quoteError = null
      state.quoteData = null
      state.paymentProcessStatus = "idle"
      state.paymentError = null
      state.paymentData = null
      state.bookStatus = "idle"
      state.bookError = null
      state.bookingData = null
    },
  },

  /* ───────────────── extraReducers ───────────────── */
  extraReducers: (builder) => {
    /* TravelgateX Quote */
    builder
      .addCase(quoteTravelgateRoom.pending, (s) => {
        s.quoteStatus = "loading"
        s.quoteError = null
      })
      .addCase(quoteTravelgateRoom.fulfilled, (s, a) => {
        s.quoteStatus = "succeeded"
        s.quoteData = a.payload.quote
        s.quoteRateKey = a.payload.quoteRateKey
        console.log("✅ Quote data saved to Redux:", a.payload.quote)
      })
      .addCase(quoteTravelgateRoom.rejected, (s, a) => {
        s.quoteStatus = "failed"
        s.quoteError = a.payload
      })

    /* Stripe Payment (process) */
    builder
      .addCase(processStripePayment.pending, (s) => {
        s.paymentProcessStatus = "loading"
        s.paymentError = null
      })
      .addCase(processStripePayment.fulfilled, (s, a) => {
        s.paymentProcessStatus = "succeeded"
        s.paymentData = a.payload
        console.log("✅ Payment data saved to Redux:", a.payload)
      })
      .addCase(processStripePayment.rejected, (s, a) => {
        s.paymentProcessStatus = "failed"
        s.paymentError = a.payload
      })

    /* TravelgateX Book */
    builder
      .addCase(bookTravelgateRoom.pending, (s) => {
        s.bookStatus = "loading"
        s.bookError = null
      })
      .addCase(bookTravelgateRoom.fulfilled, (s, a) => {
        s.bookStatus = "succeeded"
        s.bookingData = a.payload
        s.bookingPaymentStatus = "paid" // booking pagado
        console.log("✅ Booking data saved to Redux:", a.payload)
      })
      .addCase(bookTravelgateRoom.rejected, (s, a) => {
        s.bookStatus = "failed"
        s.bookError = a.payload
      })

    /* createBooking (legacy/local) */
    builder
      .addCase(createBooking.pending, (s) => {
        s.createStatus = "loading"
        s.createError = null
      })
      .addCase(createBooking.fulfilled, (s, a) => {
        s.createStatus = "succeeded"
        s.id = a.payload.id
        s.total = a.payload.total
        s.status = a.payload.status
        s.bookingPaymentStatus = a.payload.paymentStatus === "paid" ? "paid" : "unpaid"
      })
      .addCase(createBooking.rejected, (s, a) => {
        s.createStatus = "failed"
        s.createError = a.payload
      })

    /* confirmPayment (legacy/local) */
    builder
      .addCase(confirmPayment.pending, (s) => {
        s.confirmStatus = "processing"
        s.confirmError = null
      })
      .addCase(confirmPayment.fulfilled, (s) => {
        s.confirmStatus = "succeeded"
        s.bookingPaymentStatus = "paid"
        s.status = "confirmed"
      })
      .addCase(confirmPayment.rejected, (s, a) => {
        s.confirmStatus = "failed"
        s.confirmError = a.payload
      })

    /* unified list */
    builder
      .addCase(fetchUserBookings.pending, (s) => {
        s.userBookingsStatus = "loading"
        s.userBookingsError = null
      })
      .addCase(fetchUserBookings.fulfilled, (s, a) => {
        s.userBookingsStatus = "succeeded"
        s.userBookings = a.payload
      })
      .addCase(fetchUserBookings.rejected, (s, a) => {
        s.userBookingsStatus = "failed"
        s.userBookingsError = a.payload
      })

    /* cancelBooking */
    builder
      .addCase(cancelBooking.pending, (s) => {
        s.cancelStatus = "loading"
        s.cancelError = null
      })
      .addCase(cancelBooking.fulfilled, (s, a) => {
        s.cancelStatus = "succeeded"
        const idx = s.userBookings.findIndex((b) => b.id === a.payload.booking.id)
        if (idx !== -1) {
          s.userBookings[idx].status = a.payload.booking.status
          s.userBookings[idx].paymentStatus = a.payload.booking.paymentStatus
        }
      })
      .addCase(cancelBooking.rejected, (s, a) => {
        s.cancelStatus = "failed"
        s.cancelError = a.payload
      })

    /* fetchBookingById */
    builder
      .addCase(fetchBookingById.pending, (s) => {
        s.bookingDetailsStatus = "loading"
        s.bookingDetailsError = null
      })
      .addCase(fetchBookingById.fulfilled, (s, a) => {
        s.bookingDetailsStatus = "succeeded"
        s.currentBookingDetails = a.payload
      })
      .addCase(fetchBookingById.rejected, (s, a) => {
        s.bookingDetailsStatus = "failed"
        s.bookingDetailsError = a.payload
      })
  },
})

/* ────────────────────────── */
/* EXPORTS                    */
/* ────────────────────────── */
export const {
  setHotelId,
  setRoomId,
  setCheckIn,
  setCheckOut,
  setAdults,
  setChildren,
  setRoomsCount,
  setBookingRoom,
  setGuestInfo,
  setPaymentMethod,
  applyDiscount,
  removeDiscount,
  setCustomPrice,
  clearBookingErrors,
  resetBooking,
  resetCreateStatus,
  resetConfirmStatus,
  resetBookingFlow,
} = bookingSlice.actions

export default bookingSlice.reducer
