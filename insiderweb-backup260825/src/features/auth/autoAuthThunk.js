/* ────────────────────────────────────────────────
   Thunk: autoAuth
   Crea la cuenta si no existe y devuelve { token, user }
   ──────────────────────────────────────────────── */
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios                from "axios"

const API_URL = import.meta.env.VITE_API_URL

export const autoAuth = createAsyncThunk(
  "auth/autoAuth",
  async (
    { email, firstName, lastName, phone, bookingId },   // ← bookingId reemplaza outsideBookingId
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/auto-signup`, {
        email,
        firstName,
        lastName,
        phone,
        bookingId,                                        // ← nuevo nombre de campo
      })                      // ⇢ { token, user }
      return data
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Auto-signup failed"
      return rejectWithValue(msg)
    }
  },
)
