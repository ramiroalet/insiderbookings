/* Thunk: setPassword
   Receives the magic-link token + new password.
   Returns { token, user } → ready to log the user in. */

import { createAsyncThunk } from "@reduxjs/toolkit"
import axios                from "axios"

const API_URL = import.meta.env.VITE_API_URL

export const setPassword = createAsyncThunk(
  "auth/setPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/set-password`, {
        token,
        password,
      })                // ⇢ { token: jwt, user }
      return data
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Set-password failed"
      return rejectWithValue(msg)
    }
  },
)
