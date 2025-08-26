/* ────────────────────────────────────────────────
   src/pages/SetPassword/SetPassword.jsx – FULL FILE
   ──────────────────────────────────────────────── */
/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect }          from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch }                  from "react-redux"
import axios                            from "axios"
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react"

import { setPassword } from "../../features/auth/setPasswordThunk"
import { forceLogin }  from "../../features/auth/authSlice"

const API_URL = import.meta.env.VITE_API_URL

export default function SetPassword() {
  /* ── routing ─────────────────────────────────────── */
  const [search]  = useSearchParams()
  const navigate  = useNavigate()
  const token     = search.get("token")              // JWT from magic-link

  /* ── redux ───────────────────────────────────────── */
  const dispatch  = useDispatch()

  /* ── local state ─────────────────────────────────── */
  const [loading, setLoading]   = useState(true)
  const [valid,   setValid]     = useState(false)
  const [name,    setName]      = useState("")

  const [pwd,  setPwd]          = useState("")
  const [pwd2, setPwd2]         = useState("")
  const [show, setShow]         = useState(false)

  const [error,      setError]      = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  /* ── verify token once ───────────────────────────── */
  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError("Missing token")
      return
    }
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/validate-token/${token}`)
        // expected: { valid:true, name }
        if (data.valid) {
          setValid(true)
          setName(data.name ?? "")
        } else {
          setError("Invalid or expired link")
        }
      } catch {
        setError("Invalid or expired link")
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  /* ── submit handler ─────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (pwd.length < 8)  return setError("Password must be at least 8 characters")
    if (pwd !== pwd2)    return setError("Passwords do not match")

    try {
      setSubmitting(true)

      /** 1️⃣  Call the thunk – it should return {token,user} **/
      const payload = await dispatch(
        setPassword({ token, password: pwd })
      ).unwrap()

      /** 2️⃣  If we received a session token, log the user in.
              Otherwise just redirect silently.                     **/
      if (payload?.token) {
        dispatch(forceLogin(payload))
      }

      setSuccess(true)
      setTimeout(() => navigate("/"), 800)           // quick redirect
    } catch (err) {
      setError(err.message || "Server error")
    } finally {
      setSubmitting(false)
    }
  }

  /* ── early states ───────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">
          {error || "Invalid link"}
        </p>
      </div>
    )
  }

  /* ── main UI ────────────────────────────────────── */
  const firstName = (name || "").split(" ")[0] || "there"

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {success ? (
          <div className="text-center">
            <CheckCircle2 size={56} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Password set!</h1>
            <p className="text-gray-700">Redirecting…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Welcome, {firstName}!</h1>
            <p className="text-gray-600 mb-6">
              Choose a password to finish setting up your Insider&nbsp;Bookings account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* password */}
              <div className="relative">
                <label className="text-sm font-bold text-gray-600 block mb-1">
                  Password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  minLength={8}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 bottom-2.5 text-gray-500 hover:text-gray-700"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* repeat */}
              <div className="relative">
                <label className="text-sm font-bold text-gray-600 block mb-1">
                  Repeat Password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  minLength={8}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* error */}
              {error && (
                <p className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle size={16} /> {error}
                </p>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl shadow
                           hover:bg-blue-700 disabled:opacity-60 mt-2"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </span>
                ) : (
                  "Save password & sign in"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
