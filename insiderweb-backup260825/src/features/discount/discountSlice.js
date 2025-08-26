// ─────────────────────────────────────────────────────────────
// src/features/discount/discountSlice.js
// Manages: validate code, percentage, special price, associated hotel
// Stores validatedBy as { name, staff_id|null, user_id|null } for commissions
// ─────────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { validateDiscountCode } from "../../utils/Api"

/* ─────────────────────────────── */
/* THUNK: POST /discounts/validate */
/* ─────────────────────────────── */
export const validateCode = createAsyncThunk(
  "discount/validateCode",
  async (payload, { rejectWithValue }) => {
    try {
      // Must return { id?, percentage, validatedBy, hotel, specialDiscountPrice? }
      const data = await validateDiscountCode(payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message)
    }
  }
)

/* ─────────────────────────────── */
/* INITIAL STATE                   */
/* ─────────────────────────────── */
const initialState = {
  id: null,
  code: "",
  percentage: 0,
  specialDiscountPrice: null, // fixed per-night price if present
  active: false,

  status: "idle", // idle | loading | succeeded | failed
  error: null,

  validatedBy: null, // { name, staff_id|null, user_id|null }
  hotel: null,       // { id, name, image, location } | null
}

/* ─────────────────────────────── */
/* SLICE                           */
/* ─────────────────────────────── */
const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearCode: () => initialState,

    // Optional: set a code manually (e.g., deep link)
    setCodeManually: (state, action) => {
      state.code = (action.payload || "").toString().toUpperCase()
      state.active = false
      state.percentage = 0
      state.specialDiscountPrice = null
      state.validatedBy = null
      state.hotel = null
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCode.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(validateCode.fulfilled, (state, action) => {
        state.status = "succeeded"

        // Basic data
        state.id = action.payload.id ?? null
        state.code = (action.meta.arg.code || "").toString().toUpperCase()
        state.percentage = Number(action.payload.percentage ?? 0) || 0
        state.hotel = action.payload.hotel ?? null

        // Normalize validatedBy -> { name, staff_id|null, user_id|null }
        const vb = action.payload.validatedBy
        state.validatedBy = vb
          ? {
              name: vb.name ?? null,
              staff_id: vb.staff_id ?? null,
              user_id: vb.user_id ?? null,
            }
          : null

        // Special fixed price (do not coerce null to 0)
        const sp = action.payload.specialDiscountPrice
        if (sp === null || sp === undefined) {
          state.specialDiscountPrice = null
        } else {
          const n = Number(sp)
          state.specialDiscountPrice = Number.isFinite(n) && n > 0 ? n : null
        }

        state.active = true
      })
      .addCase(validateCode.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload || "Validation failed"
      })
  },
})

/* ─────────────────────────────── */
/* SELECTORS                      */
/* ─────────────────────────────── */
export const selectDiscount = (s) => s.discount
export const selectDiscountActive = (s) => !!s.discount.active
export const selectDiscountPercentage = (s) => Number(s.discount.percentage) || 0
export const selectHasSpecial = (s) =>
  Number.isFinite(Number(s.discount.specialDiscountPrice)) &&
  Number(s.discount.specialDiscountPrice) > 0

// Helpful for commission attribution
export const selectCommissionTarget = (s) => {
  const vb = s.discount.validatedBy
  if (!vb) return null
  if (vb.staff_id) return { type: "staff", id: vb.staff_id, name: vb.name }
  if (vb.user_id)  return { type: "user",  id: vb.user_id,  name: vb.name }
  return null
}

/* ─────────────────────────────── */
export const { clearCode, setCodeManually } = discountSlice.actions
export default discountSlice.reducer
