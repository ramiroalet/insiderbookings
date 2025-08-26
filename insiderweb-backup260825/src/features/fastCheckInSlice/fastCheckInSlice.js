// src/features/fastCheckIn/fastCheckInSlice.js
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  bookingId : null,
  addons    : [],       // [{ id, qty, extraData }]
  completed : false,
}

const fastCheckInSlice = createSlice({
  name: "fastCheckIn",
  initialState,
  reducers: {
    startFlow(state, action) {
      state.bookingId = action.payload          // string | number
      state.addons    = []
      state.completed = false
    },
    addAddon(state, action) {
      // payload: { id, qty?: number, extraData?: any }
      const existing = state.addons.find(a => a.id === action.payload.id)
      if (existing) {
        existing.qty       = action.payload.qty       ?? 1
        existing.extraData = action.payload.extraData ?? null
      } else {
        state.addons.push({ ...action.payload })
      }
    },
    skipAddon(state, action) {
      // payload: add-on id (remove if present)
      state.addons = state.addons.filter(a => a.id !== action.payload)
    },
    markCompleted(state) {
      state.completed = true
    },
    reset(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  startFlow,
  addAddon,
  skipAddon,
  markCompleted,
  reset,
} = fastCheckInSlice.actions

export default fastCheckInSlice.reducer
