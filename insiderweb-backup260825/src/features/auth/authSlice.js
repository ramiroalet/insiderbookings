/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios         from "axios"
import validator     from "validator"
import { autoAuth }  from "./autoAuthThunk"
import { setPassword } from "./setPasswordThunk"   // ← magic link / set password

const API_URL = import.meta.env.VITE_API_URL

/* ════════════════════════════════════════════════
   PERSISTENCIA LOCAL (rehidratación)
   ════════════════════════════════════════════════ */
const savedToken = localStorage.getItem("token");
const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
})();

/* ════════════════════════════════════════════════
   THUNKS
   ════════════════════════════════════════════════ */

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      if (!validator.isEmail(email))
        return rejectWithValue("El email no tiene un formato válido.")

      const { data } = await axios.post(`${API_URL}/auth/user/register`, {
        name, email, password,
      })

      const { token, user } = data
      localStorage.setItem("token", token)
      try { localStorage.setItem("user", JSON.stringify(user)) } catch {}

      return {
        token,
        user: {
          id         : user.id,
          name       : user.name,
          email      : user.email,
          phone      : user.phone,
          role       : user.role ?? 0,       // ← importante
          avatar_url : user.avatar_url ?? null,
          isActive   : user.isActive ?? user.is_active ?? true,
        },
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server error"
      return rejectWithValue(msg)
    }
  },
)

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/user/login`, {
        email, password,
      })
      const { token, user } = data
      localStorage.setItem("token", token)
      try { localStorage.setItem("user", JSON.stringify(user)) } catch {}

      return {
        token,
        user: {
          id         : user.id,
          name       : user.name,
          email      : user.email,
          phone      : user.phone,
          role       : user.role,           // ← importante
          avatar_url : user.avatar_url ?? null,
          isActive   : user.isActive ?? user.is_active ?? true,
        },
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid credentials"
      return rejectWithValue(msg)
    }
  },
)

/* Login con Google usando "code" del popup */
export const loginWithGoogleCode = createAsyncThunk(
  "auth/loginWithGoogleCode",
  async ({ code }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/google/exchange`, { code })
      const { token, user } = data
      localStorage.setItem("token", token)
      try { localStorage.setItem("user", JSON.stringify(user)) } catch {}

      return {
        token,
        user: {
          id         : user.id,
          name       : user.name,
          email      : user.email,
          phone      : user.phone,
          role       : user.role,           // ← importante
          avatar_url : user.avatar_url ?? null,
          isActive   : user.isActive ?? user.is_active ?? true,
        },
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Google sign-in failed"
      return rejectWithValue(msg)
    }
  }
)

/* Rehidratar/me desde token */
export const loadUserFromToken = createAsyncThunk(
  "auth/loadUserFromToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const { data } = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // data debe traer role; si no, por compatibilidad dejamos 0
      return {
        token,
        user: {
          id         : data.id,
          name       : data.name,
          email      : data.email,
          phone      : data.phone,
          role       : data.role ?? 0,       // ← importante
          avatar_url : data.avatar_url ?? null,
          isActive   : data.isActive ?? data.is_active ?? true,
        },
      }
    } catch (err) {
      const status = err?.response?.status
      // Sólo invalidar sesión si el backend dice 401/403
      if (status === 401 || status === 403) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Session expired"
      return rejectWithValue(msg)
    }
  },
)

/* Update profile */
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const res = await fetch(`${API_URL}/users/me`, {
        method : "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update profile")
      }
      const { user } = await res.json()
      try { localStorage.setItem("user", JSON.stringify(user)) } catch {}
      return user
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

/* Change password */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const res = await fetch(`${API_URL}/users/me/password`, {
        method : "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to change password")
      }
      return await res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

/* Delete account */
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const res = await fetch(`${API_URL}/users/me`, {
        method : "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete account")
      }
      return await res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

/* ════════════════════════════════════════════════
   INITIAL STATE (rehidratado)
   ════════════════════════════════════════════════ */

const initialState = {
  isLoggedIn : !!savedToken,
  token      : savedToken || null,
  user       : savedUser,
  error      : null,
  loading    : false,
  showAuthModal : false,
  redirectPath  : null,
  authMode      : "login",

  updateStatus         : "idle",
  updateError          : null,
  passwordChangeStatus : "idle",
  passwordChangeError  : null,
  deleteAccountStatus  : "idle",
  deleteAccountError   : null,
}

/* ════════════════════════════════════════════════
   SLICE
   ════════════════════════════════════════════════ */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isLoggedIn           = false
      state.token                = null
      state.user                 = null
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      state.error                = null
      state.updateError          = null
      state.passwordChangeError  = null
      state.deleteAccountError   = null
      state.updateStatus         = "idle"
      state.passwordChangeStatus = "idle"
      state.deleteAccountStatus  = "idle"
    },
    clearError(state) {
      state.error               = null
      state.updateError         = null
      state.passwordChangeError = null
      state.deleteAccountError  = null
    },
    showAuthModal(state, action) {
      state.showAuthModal = true
      state.redirectPath  = action.payload?.redirectPath || null
      state.authMode      = action.payload?.mode         || "login"
    },
    hideAuthModal(state) {
      state.showAuthModal = false
      state.redirectPath  = null
      state.error         = null
    },
    setAuthMode(state, action) {
      state.authMode = action.payload
      state.error    = null
    },
    forceLogin(state, action) {
      state.isLoggedIn = true
      state.token      = action.payload.token
      state.user       = action.payload.user
      localStorage.setItem("token", action.payload.token)
      try { localStorage.setItem("user", JSON.stringify(action.payload.user)) } catch {}
    },
    clearUpdateStatus(state) {
      state.updateStatus = "idle"
      state.updateError  = null
    },
    clearPasswordChangeStatus(state) {
      state.passwordChangeStatus = "idle"
      state.passwordChangeError  = null
    },
    clearDeleteAccountStatus(state) {
      state.deleteAccountStatus = "idle"
      state.deleteAccountError  = null
    },
  },

  extraReducers: (builder) => {
    /* Register */
    builder
      .addCase(registerUser.pending,   (s)=>{ s.loading=true;  s.error=null })
      .addCase(registerUser.fulfilled, (s,a)=>{
        s.loading=false
        s.isLoggedIn=true
        s.token      = a.payload.token
        s.user       = a.payload.user
        s.showAuthModal=false
        try { localStorage.setItem("user", JSON.stringify(a.payload.user)) } catch {}
      })
      .addCase(registerUser.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload })

    /* Login */
    builder
      .addCase(loginUser.pending,   (s)=>{ s.loading=true; s.error=null })
      .addCase(loginUser.fulfilled, (s,a)=>{
        s.loading=false
        s.isLoggedIn=true
        s.token      = a.payload.token
        s.user       = a.payload.user
        s.showAuthModal=false
        try { localStorage.setItem("user", JSON.stringify(a.payload.user)) } catch {}
      })
      .addCase(loginUser.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload })

    /* Google Login */
    builder
      .addCase(loginWithGoogleCode.pending,   (s)=>{ s.loading=true; s.error=null })
      .addCase(loginWithGoogleCode.fulfilled, (s,a)=>{
        s.loading=false
        s.isLoggedIn=true
        s.token      = a.payload.token
        s.user       = a.payload.user
        s.showAuthModal=false
        try { localStorage.setItem("user", JSON.stringify(a.payload.user)) } catch {}
      })
      .addCase(loginWithGoogleCode.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload })

    /* Load from token */
    builder
      .addCase(loadUserFromToken.pending,  (s)=>{ s.loading=true; s.error=null })
      .addCase(loadUserFromToken.fulfilled,(s,a)=>{
        s.loading=false
        s.isLoggedIn=true
        s.token = a.payload.token
        s.user  = a.payload.user
        try { localStorage.setItem("user", JSON.stringify(a.payload.user)) } catch {}
      })
      .addCase(loadUserFromToken.rejected, (s,a)=>{
        s.loading=false
        // NO forzamos logout aquí; solo mostramos error (si fue 401/403, ya se limpió en el thunk).
        s.error=a.payload
      })

    /* Update profile */
    builder
      .addCase(updateUserProfile.pending,  (s)=>{ s.updateStatus="loading"; s.updateError=null })
      .addCase(updateUserProfile.fulfilled,(s,a)=>{
        s.updateStatus="succeeded"
        // Si tu backend devuelve el user completo, lo guardamos:
        s.user = { ...s.user, ...a.payload }
        try { localStorage.setItem("user", JSON.stringify(s.user)) } catch {}
      })
      .addCase(updateUserProfile.rejected, (s,a)=>{ s.updateStatus="failed"; s.updateError=a.payload })

    /* Change password */
    builder
      .addCase(changePassword.pending, (s)=>{ s.passwordChangeStatus="loading"; s.passwordChangeError=null })
      .addCase(changePassword.fulfilled,(s)=>{ s.passwordChangeStatus="succeeded" })
      .addCase(changePassword.rejected, (s,a)=>{ s.passwordChangeStatus="failed"; s.passwordChangeError=a.payload })

    /* Delete account */
    builder
      .addCase(deleteAccount.pending,  (s)=>{ s.deleteAccountStatus="loading"; s.deleteAccountError=null })
      .addCase(deleteAccount.fulfilled,(s)=>{ s.deleteAccountStatus="succeeded" })
      .addCase(deleteAccount.rejected, (s,a)=>{ s.deleteAccountStatus="failed"; s.deleteAccountError=a.payload })

    /* autoAuth */
    builder
      .addCase(autoAuth.pending,   (s)=>{ s.loading=true })
      .addCase(autoAuth.fulfilled, (s,a)=>{
        s.loading=false
        authSlice.caseReducers.forceLogin(s,{ payload:a.payload })
      })
      .addCase(autoAuth.rejected,  (s,a)=>{
        s.loading=false
        console.error("autoAuth failed:", a.payload)
      })

    /* setPassword (magic-link) */
    builder
      .addCase(setPassword.pending,  (s)=>{ s.loading=true; s.error=null })
      .addCase(setPassword.fulfilled,(s,a)=>{
        s.loading=false
        authSlice.caseReducers.forceLogin(s,{ payload:a.payload })
      })
      .addCase(setPassword.rejected, (s,a)=>{ s.loading=false; s.error=a.payload })
  },
})

export const {
  logout,
  clearError,
  showAuthModal,
  hideAuthModal,
  setAuthMode,
  forceLogin,
  clearUpdateStatus,
  clearPasswordChangeStatus,
  clearDeleteAccountStatus,
} = authSlice.actions

export default authSlice.reducer
