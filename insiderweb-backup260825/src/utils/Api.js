/**
 * utils/apiService.js
 * -----------------------------------------------------------
 * Cliente Axios centralizado para Insider Booking.
 *
 *  Endpoints implementados en el backend:
 *    GET    /api/hotels                  → lista de hoteles
 *    GET    /api/hotels/:id/rooms        → habitaciones de un hotel
 *    POST   /api/discounts/validate      → validar código de 4 dígitos
 *    POST   /api/bookings                → crear reserva (pago confirmado)
 *
 *  Todas las rutas aquí se construyen sobre VITE_API_URL
 *  definido en las variables de entorno de Vite:
 *      VITE_API_URL="http://localhost:3000/api"
 */

import axios from "axios"

/* ────────────────────────────────────────────────────────────
 * 1. Axios instance
 * ──────────────────────────────────────────────────────────── */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 8000,
})

/* Si gestionas JWT, descomenta para adjuntar el token:
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token")
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
*/

/* ────────────────────────────────────────────────────────────
 * 2.  Hoteles
 * ────────────────────────────────────────────────────────────
 *    searchParams opcional:
 *      { location?: "Miami", category?: "Beachfront", rating?: 4 }
 */
export const fetchHotelsData = async (searchParams = {}) => {
  const { data } = await api.get("/hotels", { params: searchParams })

  // Top 3 por rating para la sección “Destacados”
  const featured = [...data].sort((a, b) => b.rating - a.rating).slice(0, 3)

  return { hotels: data, featured }
}

/* ────────────────────────────────────────────────────────────
 * 3.  Habitaciones por hotel
 * ────────────────────────────────────────────────────────────
 *    searchParams opcional:
 *      { guests?: 2 }
 */
export const fetchRoomsData = async (hotelId, searchParams = {}) => {
  const { data } = await api.get(`/hotels/${hotelId}/rooms`, {
    params: searchParams,
  })

  console.log(data, "data")
  return { hotelId, rooms: data }
}

/* ────────────────────────────────────────────────────────────
 * 4.  Validar código de descuento (4 dígitos)
 * ──────────────────────────────────────────────────────────── */
export const validateDiscountCode = async (code) => {
  const { data } = await api.post("/discounts/validate", { code })

  return { valid: true, ...data }
}

/* ────────────────────────────────────────────────────────────
 * 5.  Crear reserva (el backend ya marca paymentStatus: "paid")
 * ────────────────────────────────────────────────────────────
 *  bookingPayload esperado:
 *    {
 *      user_id, hotel_id, room_id,
 *      checkIn: "YYYY-MM-DD", checkOut: "YYYY-MM-DD",
 *      adults, children, rooms,
 *      guestName, guestEmail, guestPhone,
 *      discountCode: "1234"      // opcional
 *    }
 */
export const createBookingData = async (bookingPayload) => {
  const { data } = await api.post("/bookings", bookingPayload)
  return data   // Objeto Booking completo devuelto por la BD
}

export const confirmPaymentData = async ({ bookingId, ...payload }) => {
  const { data } = await api.post("/payments/confirm", {
    bookingId,
    ...payload,
  })
  return data
}

/* ────────────────────────────────────────────────────────────
 * 6.  Add-ons helpers
 * ──────────────────────────────────────────────────────────── */
export const getLatestBooking = async (token) => {
  const { data } = await api.get("/bookings/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    params: { latest: true, ts: Date.now() },
  })
  return data && Object.keys(data).length ? data : null
}

export const getBookingById = async (bookingId, token) => {
  const { data } = await api.get(`/bookings/${bookingId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export const getTGXBooking = async (bookingID, token) => {
  const { data } = await api.post(
    "/tgx/booking-read",
    { bookingID },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  return data?.bookings?.[0]
}

export const getHotelRooms = async (hotelId, token) => {
  const { data } = await api.get(`/hotels/${hotelId}/rooms/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export const getHotelAddons = async (hotelId) => {
  const { data } = await api.get(`/addons/${hotelId}/hotel-addons`, {
    params: { withOptions: true },
  })
  return data
}

export const validateUpsellCode = async (payload, token) => {
  const { data } = await api.post("/upsell-code/validate", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export const markAddonReady = async (bookingAddOnId, token) => {
  const { data } = await api.put(
    `/addons/bookings/ready/${bookingAddOnId}`,
    {},
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  return data
}

export const createOutsideAddonsSession = async (payload, token) => {
  const { data } = await api.post(
    "/payments/outside-addons/create-session",
    payload,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  return data
}

export const createUpsellSession = async (payload, token) => {
  const { data } = await api.post("/payments/upsell/create-session", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

export const requestAddon = async (payload, token) => {
  const { data } = await api.post("/addons/request", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

/* ────────────────────────────────────────────────────────────
 * 7.  Booking helpers
 * ──────────────────────────────────────────────────────────── */
export const cancelBooking = async (bookingId, token) => {
  const { data } = await api.put(
    `/bookings/${bookingId}/cancel`,
    {},
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  return data
}

export const cancelTGXBooking = async (bookingID, token) => {
  const { data } = await api.post(
    "/tgx/cancel",
    { bookingID },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  return data
}

 
