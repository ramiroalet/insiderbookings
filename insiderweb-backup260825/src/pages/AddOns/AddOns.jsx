/* eslint-disable react/prop-types */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import * as Icons from "lucide-react"

const API_URL  = import.meta.env.VITE_API_URL
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(STRIPE_PK)

const diffDays = (from, to) =>
  Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86_400_000))

const AddOnIcon = ({ iconName, disabled = false }) => {
  const IconComp = Icons[iconName] || Icons.Gift
  return (
    <IconComp
      size={24}
      className={`mr-3 inline-block align-text-bottom ${
        disabled ? "text-gray-400" : "text-blue-600"
      }`}
    />
  )
}

export default function AddOns() {
  const { token } = useSelector((s) => s.auth)
  const navigate  = useNavigate()

  const [step, setStep]                 = useState("SELECT")
  const [viewExisting, setViewExisting] = useState(null)
  const [addons, setAddons]             = useState([])
  const [selected, setSelected]         = useState(null)
  const [qty, setQty]                   = useState(1)
  const [opt, setOpt]                   = useState(null)
  const [pieceCounts, setPieceCounts]   = useState({})
  const [code, setCode]                 = useState("")
  const [roomsList, setRoomsList]       = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)

  const [latestBk, setLatestBk] = useState(null)
  const [nights,   setNights]   = useState(1)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [summary, setSummary] = useState(null)

  const discountActive = useMemo(
    () => latestBk?.status === "discount",
    [latestBk],
  )

  const bookingAccepted = useMemo(
    () => latestBk && ["confirmed", "accepted"].includes(latestBk.status),
    [latestBk],
  )

  const isLaundry      = selected?.slug?.toLowerCase().includes("laundry")
  const isRoomUpgrade  = selected?.slug === "roomUpgrade"

  const currentRoom = useMemo(() => {
    if (!latestBk?.guestRoomType || !roomsList?.length) return null
    return roomsList.find((r) => r.name === latestBk.guestRoomType)
  }, [latestBk, roomsList])

  const currentPrice = Number.parseFloat(currentRoom?.price ?? 0)

  const existingMap = useMemo(() => {
    const m = {}
    latestBk?.addons?.forEach((a) => {
      m[a.addOnId] = a
    })
    return m
  }, [latestBk])

  const upgradeOptions = useMemo(() => {
    if (!roomsList?.length || !currentRoom) return []
    return roomsList
      .filter((r) => Number.parseFloat(r.price) > currentPrice)
      .map((r) => ({
        id         : r.id,
        label      : r.name,
        price      : Number.parseFloat(r.price),
        description: r.description,
        capacity   : r.capacity,
        beds       : r.beds,
      }))
      .sort((a, b) => a.price - b.price)
  }, [roomsList, currentRoom, currentPrice])

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
    ;(async () => {
      try {
        let latest = null
        try {
          const res = await axios.get(
            `${API_URL}/bookings/me?latest=true&ts=${Date.now()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
              },
              validateStatus: (s) => s < 500,
            },
          )
          latest = res.data && Object.keys(res.data).length ? res.data : null
        } catch {}

        let detail = null
        if (latest?.id) {
          const detailUrl =
            latest.source === "outside"
              ? `${API_URL}/bookings/${latest.id}`
              : `${API_URL}/bookings/${latest.id}`
          const { data } = await axios.get(detailUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          })
          detail = data
          setLatestBk(detail)
          setNights(diffDays(detail.checkIn, detail.checkOut))
        } else {
          setLatestBk(null)
        }

        if (detail?.hotel?.id) {
          try {
            setLoadingRooms(true)
            const { data: rooms } = await axios.get(
              `${API_URL}/hotels/${detail.hotel.id}/rooms/`,
              { headers: { Authorization: `Bearer ${token}` } },
            )
            setRoomsList(rooms)
          } catch (e) {
            console.error("Error loading rooms:", e)
          } finally {
            setLoadingRooms(false)
          }
        }

        let catalogue = []
        const hid = detail?.hotel?.id ?? null
        if (hid) {
          const { data } = await axios.get(
            `${API_URL}/addons/${hid}/hotel-addons?withOptions=true`,
          )
          catalogue = data.filter((a) => a.active !== false)
          if (detail?.status === "discount") {
            catalogue = catalogue.map((a) => ({
              ...a,
              price  : +(a.price * 0.85).toFixed(2),
              options: a.options?.map((o) => ({
                ...o,
                price: +(o.price * 0.85).toFixed(2),
              })) ?? [],
            }))
          }
        }
        setAddons(catalogue)
      } catch (err) {
        console.error(err)
        setError("Could not load data.")
      }
    })()
  }, [token, navigate])

  const reset = () => {
    setStep("SELECT")
    setViewExisting(null)
    setSelected(null)
    setQty(1)
    setOpt(null)
    setPieceCounts({})
    setCode("")
    setSummary(null)
  }

  const handleCodeUnlock = async () => {
    if (code.trim().length !== 4) return alert("Code must be 4 digits")
    try {
      setLoading(true)
      await axios.post(
        `${API_URL}/upsell-code/validate`,
        { code, addOnId: selected.id, bookingId: latestBk.id },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      navigate(`/outside-addons-success?bookingId=${latestBk.id}`)
    } catch (err) {
      alert(err.response?.data?.error || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const chooseAddOn = (addOn) => {
    if (!latestBk) {
      alert("You need an active booking to request add-ons.")
      return
    }
    const existing = existingMap[addOn.id]
    if (existing) {
      if (existing.status === "pending" || existing.status === "ready") {
        return viewAddOnDetails(existing)
      } else if (existing.status === "confirmed") {
        return payExisting(existing)
      } else if (existing.status === "cancelled") {
        return
      }
    }
    if (addOn.slug === "roomUpgrade") {
      if (!currentRoom) {
        alert("Could not find your current room information.")
        return
      }
      if (upgradeOptions.length === 0) {
        alert("No room upgrades available. You already have the best room!")
        return
      }
    }
    setSelected(addOn)
    setQty(addOn.defaultQty ?? 1)
    setOpt(null)
    setPieceCounts({})
    setStep("DETAIL")
  }

  const payExisting = async (addon) => {
    try {
      setLoading(true)
      await axios.put(
        `${API_URL}/addons/bookings/ready/${addon.bookingAddOnId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await refreshBooking()
      const amount = Math.round(addon.unitPrice * 100)
      const { data } = await axios.post(
        `${API_URL}/payments/outside-addons/create-session`,
        { bookingId: latestBk.id, amount, currency: "usd" },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const stripe = await stripePromise
      await stripe.redirectToCheckout({ sessionId: data.sessionId })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Stripe error")
    } finally {
      setLoading(false)
    }
  }

  const viewAddOnDetails = (addon) => {
    setViewExisting(addon)
    setStep("VIEW")
  }

  useEffect(() => {
    if (step === "DETAIL" && selected) {
      if (isLaundry) {
        const init = {}
        selected.options.forEach((o) => {
          init[o.id] = 0
        })
        setPieceCounts(init)
      } else if (isRoomUpgrade) {
        setOpt(upgradeOptions[0] || null)
      } else {
        setOpt(selected.options?.[0] || null)
      }
    }
  }, [step, selected, upgradeOptions, isLaundry, isRoomUpgrade])

  const calcTotal = () => {
    if (!selected) return 0
    if (isRoomUpgrade && opt) {
      const diff =
        (opt.price - currentPrice) *
        nights *
        (discountActive ? 0.85 : 1)
      return diff
    }
    if (isLaundry) {
      return Object.entries(pieceCounts).reduce((sum, [oid, c]) => {
        const o = selected.options.find((x) => x.id === +oid)
        return sum + (o?.price || 0) * c
      }, 0)
    }
    if (selected.type === "quantity") {
      return qty * selected.price
    }
    if (selected.type === "options") {
      return opt?.price || 0
    }
    return selected.price
  }

  const continueFromDetail = () => {
    setSummary({
      addOn      : selected,
      option     : opt,
      qty        : isRoomUpgrade ? 1 : qty,
      nights,
      pieceCounts,
      total      : calcTotal(),
      currentRoom: currentRoom,
    })
    setStep(bookingAccepted ? "SUMMARY" : "CODE")
  }

  const refreshBooking = async () => {
    if (!latestBk) return
    const detailUrl =
      latestBk.source === "outside"
        ? `${API_URL}/bookings/${latestBk.id}`
        : `${API_URL}/bookings/${latestBk.id}`
    const { data } = await axios.get(detailUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setLatestBk(data)
  }

  const validateCode = async () => {
    if (code.length !== 4) {
      alert("Code must be 4 digits")
      return
    }
    try {
      setLoading(true)
      await axios.post(
        `${API_URL}/upsell-code/validate`,
        { code, addOnId: selected.id, bookingId: latestBk.id },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      navigate(`/outside-addons-success?bookingId=${latestBk.id}`)
    } catch (err) {
      alert(err.response?.data?.error || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const payAddOn = async () => {
    try {
      setLoading(true)
      if (latestBk.source === "outside") {
        const amount = Math.round(summary.total * 100)
        const { data } = await axios.post(
          `${API_URL}/payments/outside-addons/create-session`,
          { bookingId: latestBk.id, amount, currency: "usd" },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const stripe = await stripePromise
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        const payload = {
          bookingId: latestBk.id,
          addOnId  : selected.id,
          optionId : isRoomUpgrade ? null : opt?.id,
          qty      : isRoomUpgrade ? 1 : qty,
          roomId   : isRoomUpgrade ? opt?.id : undefined,
        }
        const { data } = await axios.post(
          `${API_URL}/payments/upsell/create-session`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        const stripe = await stripePromise
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Stripe error")
    } finally {
      setLoading(false)
    }
  }

  const requestAddOn = async () => {
    try {
      setLoading(true)
      const payload = {
        bookingId: latestBk.id,
        id       : selected.hoteladdonId,
        addOnId  : selected.id,
        optionId : isRoomUpgrade ? null : opt?.id,
        qty      : isRoomUpgrade ? 1 : isLaundry ? null : qty,
        pieces   : isLaundry ? pieceCounts : undefined,
        roomId   : isRoomUpgrade ? opt?.id : undefined,
      }
      await axios.post(`${API_URL}/addons/request`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await refreshBooking()
      setStep("SENT")
    } catch (err) {
      alert(err.response?.data?.error || "Could not request")
    } finally {
      setLoading(false)
    }
  }

  const Price = ({ value, disabled = false }) => (
    <span className={`font-bold ${disabled ? "text-gray-400" : "text-blue-600"}`}>
      ${value.toFixed(2)}
    </span>
  )

  if (error) {
    return (
      <p className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </p>
    )
  }

  if (!addons.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icons.Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  const hotelName = latestBk?.hotel?.name ?? "—"
  const confNumber = latestBk?.bookingConfirmation ?? latestBk?.id ?? "—"
  const dateRange = latestBk ? `${latestBk.checkIn} → ${latestBk.checkOut}` : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {discountActive && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-100 p-3 text-center text-amber-800 font-semibold">
            Insider Discount 15% active — all prices include the discount
          </div>
        )}

        {latestBk && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Any add-on you pick here will be linked to your booking&nbsp;
            <strong>#{confNumber}</strong> at <strong>{hotelName}</strong> ({dateRange}).
            {currentRoom && (
              <div className="mt-2">
                <strong>Current Room:</strong> {currentRoom.name} - $
                {currentRoom.price}/night
              </div>
            )}
          </div>
        )}

        {!latestBk && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <Icons.Calendar className="h-6 w-6 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-800">
                No Active Booking
              </h3>
            </div>
            <p className="text-amber-700 mb-4">
              You need an active booking to request add-ons and extras. Browse our
              available services below and make a reservation to enhance your stay.
            </p>
            <button
              onClick={() => navigate("/bookings")}
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
            >
              <Icons.Plus className="h-4 w-4 mr-2" />
              Make a Booking
            </button>
          </div>
        )}

        <div className="mb-8 flex items-center">
          {step !== "SELECT" && (
            <button
              onClick={reset}
              className="rounded-full p-2 text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Icons.ArrowLeft size={20} />
            </button>
          )}
          <h1 className="flex-1 text-center text-3xl font-bold text-gray-900">
            Add-Ons & Extras
          </h1>
        </div>

{step === "VIEW" && viewExisting && (
          <div className="mx-auto max-w-lg space-y-4 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold">Add-On Details</h2>
            <p>
              <strong>Service:</strong> {viewExisting.addOnName}
            </p>
            {viewExisting.optionName && (
              <p>
                <strong>Option:</strong> {viewExisting.optionName}
              </p>
            )}
            {viewExisting.qty > 1 && (
              <p>
                <strong>Qty:</strong> {viewExisting.qty}
              </p>
            )}
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`capitalize ${
                  viewExisting.status === "pending"
                    ? "text-yellow-600"
                    : viewExisting.status === "confirmed"
                    ? "text-blue-600"
                    : viewExisting.status === "ready"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {viewExisting.status}
              </span>
            </p>
            <p>
              <strong>Total:</strong> ${viewExisting.unitPrice.toFixed(2)}
            </p>
            <button
              onClick={() => setStep("SELECT")}
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Back
            </button>
          </div>
        )}

        {step === "SELECT" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {addons.map((a) => {
              const existing = existingMap[a.id]
              const blocked = !latestBk
              const isRoomUpgradeAddon = a.slug === "roomUpgrade"
              const noUpgradesAvailable =
                isRoomUpgradeAddon &&
                latestBk &&
                (loadingRooms || !currentRoom || upgradeOptions.length === 0)

              let statusConfig = null
              if (existing) {
                if (existing.status === "pending") {
                  statusConfig = {
                    bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
                    border: "border-yellow-300",
                    text: "text-yellow-800",
                    label: "Pending Approval",
                    icon: Icons.Clock,
                  }
                } else if (existing.status === "confirmed") {
                  statusConfig = {
                    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                    border: "border-blue-300",
                    text: "text-blue-800",
                    label: "Click to Pay",
                    icon: Icons.CreditCard,
                  }
                } else if (existing.status === "ready") {
                  statusConfig = {
                    bg: "bg-gradient-to-r from-green-50 to-emerald-50",
                    border: "border-green-300",
                    text: "text-green-800",
                    label: "Completed",
                    icon: Icons.CheckCircle,
                  }
                } else if (existing.status === "cancelled") {
                  statusConfig = {
                    bg: "bg-gradient-to-r from-gray-50 to-slate-50",
                    border: "border-gray-300",
                    text: "text-gray-600",
                    label: "Cancelled",
                    icon: Icons.XCircle,
                  }
                }
              }

              const isDisabled =
                blocked || noUpgradesAvailable || existing?.status === "cancelled"

              const handleClick = () => {
                if (!isDisabled) chooseAddOn(a)
              }

              return (
                <div
                  key={a.id}
                  onClick={handleClick}
                  className={`
                    relative group flex flex-col justify-between p-6 rounded-2xl shadow-lg
                    border-2 transition-all duration-300 transform
                    ${
                      statusConfig
                        ? `${statusConfig.bg} ${statusConfig.border}`
                        : isDisabled
                        ? "bg-white border-gray-200"
                        : "bg-white border-transparent hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
                    }
                  `}
                >
                  {statusConfig && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 ${statusConfig.text}`}
                      >
                        <statusConfig.icon size={12} />
                        <span className="text-xs font-medium">{statusConfig.label}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start mb-4">
                    <div
                      className={`p-2 rounded-lg mr-4 ${
                        isDisabled && !statusConfig
                          ? "bg-gray-100"
                          : statusConfig
                          ? "bg-white/50"
                          : "bg-blue-50"
                      }`}
                    >
                      <AddOnIcon iconName={a.iconName} disabled={isDisabled && !statusConfig} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          isDisabled && !statusConfig
                            ? "text-gray-500"
                            : statusConfig
                            ? statusConfig.text
                            : "text-gray-900"
                        }`}
                      >
                        {a.title}
                      </h3>
                      {a.description && (
                        <p
                          className={`text-sm leading-relaxed ${
                            isDisabled && !statusConfig
                              ? "text-gray-400"
                              : statusConfig
                              ? "text-gray-600"
                              : "text-gray-600"
                          }`}
                        >
                          {a.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {!statusConfig && (
                    <>
                      {a.type === "options" && a.options.length > 0 && !isRoomUpgradeAddon && (
                        <p className={`text-xs mb-3 ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                          Starting from ${a.options[0].price.toFixed(2)}
                        </p>
                      )}
                      {isRoomUpgradeAddon && latestBk && currentRoom && upgradeOptions.length > 0 && (
                        <p className={`text-xs mb-3 ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                          From ${((upgradeOptions[0].price - currentPrice) * nights * (discountActive ? 0.85 : 1)).toFixed(2)} for {nights} night{nights > 1 ? "s" : ""}
                        </p>
                      )}
                    </>
                  )}

                  {existing && statusConfig && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">
                        <strong>Total:</strong> ${existing.unitPrice.toFixed(2)}
                      </p>
                      {existing.optionName && (
                        <p className="text-xs text-gray-600">
                          <strong>Option:</strong> {existing.optionName}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {!statusConfig && <Price value={a.price} disabled={isDisabled} />}
                    {statusConfig && (
                      <span className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                    )}
                    <div
                      className={`p-2 rounded-full ${
                        statusConfig
                          ? `${statusConfig.text.replace("text-", "bg-").replace("-800", "-600")} text-white`
                          : isDisabled
                          ? "bg-gray-300 text-gray-500"
                          : "bg-blue-600 text-white group-hover:bg-blue-700"
                      }`}
                    >
                      {statusConfig ? (
                        statusConfig.icon === Icons.CreditCard ? (
                          <Icons.CreditCard size={16} />
                        ) : (
                          <statusConfig.icon size={16} />
                        )
                      ) : isDisabled ? (
                        <Icons.Lock size={16} />
                      ) : (
                        <Icons.Plus size={16} />
                      )}
                    </div>
                  </div>

                  {(blocked || noUpgradesAvailable) && !statusConfig && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100/90 to-transparent rounded-b-2xl p-4 pt-8">
                      <div className="flex items-center justify-center">
                        <div className="bg-white/90 rounded-full px-3 py-1 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <Icons.Lock size={12} />
                            <span>
                              {blocked
                                ? "Booking Required"
                                : noUpgradesAvailable
                                ? "No Upgrades Available"
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {step === "DETAIL" && selected && (
          <div className="mx-auto max-w-lg">
            <div className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-xl">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-blue-50 mb-4">
                  <AddOnIcon iconName={selected.iconName} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h2>
                {selected.description && (
                  <p className="text-gray-600 leading-relaxed">{selected.description}</p>
                )}
              </div>

              {isRoomUpgrade && currentRoom && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Your Current Room</h3>
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>{currentRoom.name}</strong>
                    </p>
                    <p>{currentRoom.description}</p>
                    <p>
                      Capacity: {currentRoom.capacity} guests • Beds: {currentRoom.beds}
                    </p>
                    <p className="font-semibold">${currentRoom.price}/night</p>
                  </div>
                </div>
              )}

              {isRoomUpgrade && (
                <div className="space-y-3">
                  {upgradeOptions.map((o) => {
                    const extra = (o.price - currentPrice) * nights * (discountActive ? 0.85 : 1)
                    const active = opt?.id === o.id
                    return (
                      <button
                        key={o.id}
                        onClick={() => setOpt(o)}
                        className={`
                          w-full rounded-xl border-2 p-5 text-left transition-all duration-200
                          ${
                            active
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{o.label}</span>
                          <span className="font-bold text-blue-600">${extra.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{o.description}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          ${o.price}/night (${((o.price - currentPrice) * (discountActive ? 0.85 : 1)).toFixed(2)} extra per night ×{" "}
                          {nights} nights)
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}

              {!isRoomUpgrade && selected.type === "options" && (
                <div className="space-y-3">
                  {selected.options.map((o) => {
                    const active = opt?.id === o.id
                    return (
                      <button
                        key={o.id}
                        onClick={() => setOpt(o)}
                        className={`
                          w-full rounded-xl border-2 p-5 text-left transition-all duration-200
                          ${
                            active
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{o.label}</span>
                          <span className="font-bold text-blue-600">${o.price.toFixed(2)}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {selected.type === "quantity" && !isLaundry && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    {selected.slug === "breakfast" ? "How many days?" : "Number of nights"}
                  </label>
                  <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: nights }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    ${selected.price.toFixed(2)} per {selected.slug === "breakfast" ? "day" : "night"}
                  </p>
                </div>
              )}

              <button
                onClick={continueFromDetail}
                disabled={isRoomUpgrade && !opt}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {bookingAccepted ? "Continue" : "Next"}
              </button>
            </div>
          </div>
        )}

        {step === "CODE" && (
          <div className="mx-auto max-w-lg">
            <div className="flex flex-col gap-6 bg-white p-8 shadow-xl rounded-xl">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-yellow-50 mb-4">
                  <Icons.Key className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter the 4-digit staff code</h2>
                <p className="text-gray-600 text-sm">Please ask hotel staff for the verification code</p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={code}
                placeholder="1234"
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full rounded-lg border-2 border-gray-300 py-4 text-center text-3xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <button
                onClick={validateCode}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200"
              >
                {loading ? "Validating…" : "Validate & Continue"}
              </button>
            </div>
          </div>
        )}

        {step === "SUMMARY" && summary && (
          <div className="mx-auto max-w-lg">
            <div className="flex flex-col gap-6 rounded-xl bg-white p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 text-center">Review Perk</h2>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Service</span>
                  <span>{summary.addOn.title}</span>
                </div>

                {isLaundry && (
                  <div className="space-y-2">
                    {Object.entries(summary.pieceCounts).map(([oid, c]) => {
                      if (!c) return null
                      const o = summary.addOn.options.find((x) => x.id === +oid)
                      return (
                        <div key={oid} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {o.label} × {c}
                          </span>
                          <span>${(o.price * c).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!isLaundry && summary.option && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">{isRoomUpgrade ? "Upgrade to" : "Option"}</span>
                    <span>{summary.option.label}</span>
                  </div>
                )}

                {isRoomUpgrade && summary.currentRoom && summary.option && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Price difference/night:</span>
                      <span>
                        ${(summary.option.price - Number(summary.currentRoom.price)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span>{summary.nights}</span>
                    </div>
                  </div>
                )}

                {!isLaundry && !isRoomUpgrade && summary.addOn.type === "quantity" && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Quantity</span>
                    <span>{summary.qty}</span>
                  </div>
                )}

                <div className="border-t pt-4 font-bold text-lg text-gray-900 flex justify-between">
                  <span>Total</span>
                  <span className="text-blue-600">${summary.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={requestAddOn}
                  disabled={loading}
                  className="w-full rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-900 disabled:bg-gray-300 transition-colors duration-200 shadow-lg"
                >
                  {loading ? "Processing…" : `Reserve Perk – $${summary.total.toFixed(2)}`}
                </button>

                <button
                  onClick={requestAddOn}
                  disabled={loading}
                  className="w-full rounded-lg bg-yellow-500 py-3 font-semibold text-white hover:bg-yellow-600 disabled:bg-gray-300 transition-colors duration-200 shadow-lg"
                >
                  {loading ? "Sending…" : "Request at Front Desk"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "SENT" && (
          <div className="mx-auto max-w-lg">
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8">
              <div className="p-4 rounded-full bg-green-100">
                <Icons.Check size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-900">Request Sent Successfully!</h3>
              <p className="text-center text-green-800 leading-relaxed">
                The hotel has been notified of your request.
                <br />
                You'll receive an email confirmation when it's approved.
              </p>
              <button
                onClick={reset}
                className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Add Another Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
