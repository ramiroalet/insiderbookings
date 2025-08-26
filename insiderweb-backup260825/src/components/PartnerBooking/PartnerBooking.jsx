"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Bed,
  Check,
  Loader2,
  DollarSign,
  Shield,
  Percent,
  AlertCircle,
} from "lucide-react";
// ⚠️ Ajustá el path según tu árbol real
import { setBookingRoom } from "../../features/booking/bookingSlice";

const API_URL = import.meta.env.VITE_API_URL;

/* ──────────────────────────────────────────────────────────────
   helpers
────────────────────────────────────────────────────────────── */
const todayISO = () => new Date().toISOString().split("T")[0];
const tomorrowISO = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split("T")[0];
};

export const applyDiscount = (base, discount) => {
  if (!discount?.active) return Number(base) || 0;
  const special = Number(discount.specialDiscountPrice);
  if (Number.isFinite(special)) return Math.max(0, special); // por noche
  const pct = Number(discount.percentage);
  if (Number.isFinite(pct) && pct > 0) return Math.max(0, +(base * (1 - pct / 100)).toFixed(2));
  return Number(base) || 0;
};

/* ──────────────────────────────────────────────────────────────
   PartnerBookingSection
   - Reutilizable para cualquier partner/hotel propio
   - Trae rooms desde /api/hotels/:hotelId/rooms
   - Arma booking del estado global y navega a /checkout
────────────────────────────────────────────────────────────── */
export default function PartnerBookingSection({
  hotelId,
  paymentType = "MERCHANT", // "MERCHANT" | "DIRECT" | "CARD_CHECK_IN"
  defaultCurrency = "USD",
  defaultAdults = 2,
  defaultChildren = 0,
  checkInDefault = todayISO(),
  checkOutDefault = tomorrowISO(),
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // discount global
  const discount = useSelector((s) => s.discount);

  // estado local
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState(null);

  const [params, setParams] = useState({
    checkIn: checkInDefault,
    checkOut: checkOutDefault,
    adults: defaultAdults,
    children: defaultChildren,
    currency: defaultCurrency.toUpperCase(),
  });

  const nights = useMemo(() => {
    const a = new Date(params.checkIn);
    const b = new Date(params.checkOut);
    const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) && diff > 0 ? diff : 1;
  }, [params.checkIn, params.checkOut]);

  /* ─────────────── fetch hotel (opcional para nombre/dirección) ─────────────── */
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoadingHotel(true);
        const res = await fetch(`${API_URL}/hotels/${hotelId}`);
        if (!res.ok) throw new Error(`Hotel ${hotelId} not found`);
        const data = await res.json();
        if (active) setHotel(data);
      } catch (e) {
        if (active) setError(e.message || "Error loading hotel");
      } finally {
        if (active) setLoadingHotel(false);
      }
    };
    if (hotelId) run();
    return () => {
      active = false;
    };
  }, [hotelId]);

  /* ─────────────── fetch rooms ─────────────── */
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setError(null);
      const guests = (params.adults || 1) + (params.children || 0);
      const res = await fetch(`${API_URL}/hotels/${hotelId}/rooms?guests=${guests}`);
      if (!res.ok) throw new Error(`Rooms fetch failed (${res.status})`);
      const data = await res.json();
      // opcional: ocultar rooms sin inventario disponible
      const available = Array.isArray(data) ? data.filter((r) => (r.available ?? 0) > 0) : [];
      setRooms(available);
    } catch (e) {
      setError(e.message || "Error loading rooms");
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  console.log(rooms, "set rooms")

  useEffect(() => {
    if (hotelId) fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, params.adults, params.children]);

  const handleDate = (k, v) => {
    setParams((p) => ({ ...p, [k]: v }));
  };

  const handleGuests = (k, v) => {
    setParams((p) => ({ ...p, [k]: Math.max(0, v) }));
  };

  const handleBook = (room) => {
    const baseNightly = Number(room?.price) || 0;
    const finalNightly = applyDiscount(baseNightly, discount);

    const bookingData = {
      room: {
        id: room.id,
        hotel_id: hotelId,
        name: room.name || `Room ${room.room_number}`,
        description: room.description || null,
        price: finalNightly, // por noche, con descuento aplicado
        capacity: room.capacity || params.adults || 2,
        currency: params.currency,
        rateKey: null, // no TGX
        tgx: false,
        refundable: room.refundable ?? true,
        paymentType, // MERCHANT por defecto (Stripe)
        priceBase: Number(room.price) || 0,
        priceUser: finalNightly,
        markup: null,
      },
      hotel: {
        id: hotel?.id || hotelId,
        name: hotel?.name || hotel?.hotelName || "Partner Hotel",
        address: hotel?.address || hotel?.location || "",
        rating: hotel?.rating || hotel?.category || null,
        image: hotel?.cover_image || null,
        hotelCode: null,
        tgx: false,
      },
      checkIn: `${params.checkIn}T15:00:00`,
      checkOut: `${params.checkOut}T11:00:00`,
      source: "PARTNER",
      tgxHotel: null,
    };

    dispatch(setBookingRoom(bookingData));
    navigate("/checkout");
  };

  /* ─────────────── UI helpers ─────────────── */
  const DiscountBanner = () => {
    const hasSpecial = Number.isFinite(Number(discount?.specialDiscountPrice));
    const validatorName =
      typeof discount?.validatedBy === "string"
        ? discount?.validatedBy
        : discount?.validatedBy?.name || null;
    const tag = hasSpecial
      ? `Special rate ${discount?.specialDiscountPrice} ${params.currency}/night`
      : `${Number(discount?.percentage || 0)}% OFF`;

    if (!discount?.active) return null;
    return (
      <div className="mx-auto mt-3 max-w-3xl animate-in fade-in slide-in-from-top-2">
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <Percent className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-green-800">
              {discount.code ? `Code ${discount.code}` : "Special discount"} — {tag}
            </div>
            <div className="text-xs text-green-700">
              Applied to all shown prices{validatorName ? ` • validated by ${validatorName}` : ""}
            </div>
          </div>
          <Shield className="h-4 w-4 text-green-600" />
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book your stay</h2>
            <p className="text-gray-600">Choose dates and room to continue to secure checkout.</p>
          </div>
        </div>

        {/* Search controls */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <div className="p-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={params.checkIn}
                min={todayISO()}
                onChange={(e) => handleDate("checkIn", e.target.value)}
                className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="p-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={params.checkOut}
                min={params.checkIn}
                onChange={(e) => handleDate("checkOut", e.target.value)}
                className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="p-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Adults</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGuests("adults", Math.max(1, params.adults - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{params.adults}</span>
                <button
                  type="button"
                  onClick={() => handleGuests("adults", Math.min(6, params.adults + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
            <div className="p-3 border-r border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">Children</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGuests("children", Math.max(0, params.children - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{params.children}</span>
                <button
                  type="button"
                  onClick={() => handleGuests("children", Math.min(4, params.children + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
            <div className="p-3 flex items-end justify-end">
              <button
                onClick={fetchRooms}
                disabled={loadingRooms}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingRooms ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calendar className="h-5 w-5" />}
                Check availability
              </button>
            </div>
          </div>
        </div>

        {/* Discount banner */}
        <DiscountBanner />

        {/* Room list */}
        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {loadingRooms ? (
            <div className="flex flex-col items-center p-10 text-gray-600">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
              <p>Loading rooms…</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Bed className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No rooms available for the current selection</p>
              <p className="text-sm">Try adjusting guests or contact us for more dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rooms.map((room) => {
                const baseNightly = Number(room.price) || 0;
                const finalNightly = applyDiscount(baseNightly, discount);
                const total = finalNightly * nights;
                return (
                  <div key={room.id} className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{room.name || `Room ${room.room_number}`}</h3>
                          {room.suite && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Suite</span>
                          )}
                          {room.available > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {room.available} available
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{room.description || "Comfortable and well-equipped."}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{room.capacity || 2} guests</span>
                          <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{room.beds || "1 bed"}</span>
                        </div>
                      </div>

                      <div className="text-right min-w-[200px]">
                        {discount?.active && Number(discount?.percentage) > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            {params.currency} {baseNightly.toFixed(2)}
                          </div>
                        )}
                        <div className={`text-2xl font-bold ${discount?.active ? "text-red-600" : "text-gray-900"}`}>
                          {params.currency} {finalNightly.toFixed(2)} <span className="text-sm font-normal text-gray-600">/ night</span>
                        </div>
                        {discount?.active && Number(discount?.percentage) > 0 && (
                          <div className="text-xs text-green-600 font-medium">{discount.percentage}% OFF</div>
                        )}
                        <div className="text-sm text-gray-500 mt-1">Total: {params.currency} {total.toFixed(2)}</div>

                        <button
                          onClick={() => handleBook(room)}
                          className="mt-4 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Book now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
