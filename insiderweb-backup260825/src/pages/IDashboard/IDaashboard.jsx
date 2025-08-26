"use client"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Loader2, Copy, CheckCircle2, TrendingUp, DollarSign, TicketPercent, AlertTriangle } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || ""

const currencyFormat = (value, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value || 0))

export default function IDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useSelector((s) => s.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [copied, setCopied] = useState("")

  // Sólo influencers (role === 2) ven este dashboard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/"); return
    }
    if (user?.role !== 2) {
      navigate("/"); return
    }
  }, [isLoggedIn, user, navigate])

  useEffect(() => {
    let canceled = false

    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Si manejás token en localStorage:
        const token = localStorage.getItem("token")
        const headers = token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" }

        const res = await fetch(`${API_URL}/users/me/influencer/stats`, {
          method: "GET",
          headers,
   
        })

        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (!canceled) setStats(data)
      } catch (e) {
        if (!canceled) setError(e.message || "Failed to load influencer stats")
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    if (isLoggedIn && user?.role === 2) fetchStats()
    return () => { canceled = true }
  }, [isLoggedIn, user])

  const primaryCode = useMemo(() => stats?.codes?.[0]?.code || null, [stats])
  const totalBookings = stats?.totals?.bookingsCount || 0

  const unpaidObj = stats?.totals?.unpaidEarnings || {}
  const unpaidEntries = Object.entries(unpaidObj) // [[currency, amount], ...]

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt)
      setCopied(txt)
      setTimeout(() => setCopied(""), 1200)
    } catch {}
  }

  if (!isLoggedIn || user?.role !== 2) return null

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Influencer Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name || "Influencer"} — track your code performance here.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your stats…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-semibold">Couldn’t load stats</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Your code</div>
                <TicketPercent className="h-5 w-5 text-violet-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-2xl font-semibold tracking-tight">
                  {primaryCode || "i789"}
                </div>
                {primaryCode && (
                  <button
                    onClick={() => copy(primaryCode)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    {copied === primaryCode ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        Copied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats?.codes?.length > 1 ? `${stats.codes.length} codes linked to your account` : "Linked to your account"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Bookings with your code</div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{totalBookings}</div>
              <div className="mt-2 text-xs text-gray-500">Confirmed/Completed bookings</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Net earnings (unpaid)</div>
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-2 space-y-1">
                {unpaidEntries.length === 0 ? (
                  <div className="text-2xl font-semibold tracking-tight">—</div>
                ) : (
                  unpaidEntries.map(([ccy, amt]) => (
                    <div key={ccy} className="text-2xl font-semibold tracking-tight">
                      {currencyFormat(amt, ccy)}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Based on captured/paid bookings with payout status pending
              </div>
            </div>
          </section>

          {/* Codes list */}
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Your discount codes</h2>
            {stats?.codes?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Code</th>
                      <th className="py-2">Percentage</th>
                      <th className="py-2">Special Price</th>
                      <th className="py-2">Times Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.codes.map((c) => (
                      <tr key={c.id} className="border-t">
                        <td className="py-2">
                          <span className="font-semibold">{c.code}</span>
                          <button
                            onClick={() => copy(c.code)}
                            className="ml-2 rounded-md border px-2 py-0.5 text-[11px] hover:bg-gray-50"
                          >
                            Copy
                          </button>
                        </td>
                        <td className="py-2">{c.percentage ? `${c.percentage}%` : "—"}</td>
                        <td className="py-2">{c.special_discount_price ?? "—"}</td>
                        <td className="py-2">{c.times_used ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No codes linked to this account yet.</div>
            )}
          </section>

          {/* Recent bookings */}
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Recent bookings with your code</h2>
            {stats?.recentBookings?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Booking #</th>
                      <th className="py-2">Hotel</th>
                      <th className="py-2">Dates</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="py-2 font-medium">{b.id}</td>
                        <td className="py-2">{b.hotelName || "—"}</td>
                        <td className="py-2">
                          {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "—"} →{" "}
                          {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-2">{currencyFormat(b.amount, b.currency)}</td>
                        <td className="py-2">{b.status}</td>
                        <td className="py-2">{b.payoutStatus || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No recent bookings.</div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
