// src/components/ApplePayOnly.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Botón Apple Pay (sin UI de Stripe Checkout).
 *
 * Props:
 *   amount     → número (total, ej. 99.99)
 *   bookingId  → id de la reserva pending/unpaid
 *   currency   → código ISO-4217, ej. "usd"
 *   onSuccess  → callback cuando el pago se completa con éxito
 */
export default function ApplePayOnly({
  amount,
  bookingId,
  currency = "usd",
  onSuccess,
}) {
  const [ready, setReady] = useState(false);

  /* Detecta capacidad Apple Pay */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.ApplePaySession &&
      window.ApplePaySession.canMakePayments()
    ) {
      setReady(true);
    }
  }, []);

  /* Flujo Apple Pay */
  const handlePay = async () => {
    if (!(window && window.ApplePaySession)) return;

    const total = { label: "Total", amount: amount.toFixed(2) };
    const request = {
      countryCode         : "US",
      currencyCode        : currency.toUpperCase(),
      total,
      supportedNetworks   : ["visa", "masterCard", "amex"],
      merchantCapabilities: ["supports3DS"],
    };

    const session = new window.ApplePaySession(6, request);

    /* 1 – Merchant validation */
    session.onvalidatemerchant = async (event) => {
      try {
        const { data } = await axios.post(
          `${API_URL}/apple/validate-merchant`,
          { validationURL: event.validationURL }
        );
        session.completeMerchantValidation(data);
      } catch (err) {
        console.error("Merchant validation failed:", err);
        session.abort();
      }
    };

    /* 2 – Autorización de pago */
    session.onpaymentauthorized = async (event) => {
      try {
        await axios.post(`${API_URL}/apple/pay`, {
          token    : event.payment.token.paymentData,
          bookingId,
          amount,
          currency,
        });
        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Apple Pay charge failed:", err);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      }
    };

    session.begin();
  };

  if (!ready) return null; // Oculta si el dispositivo no soporta Apple Pay

  return (
    <button
      className="apple-pay-button black w-full h-12 rounded-lg"
      onClick={handlePay}
    ></button>
  );
}
