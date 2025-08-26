// src/pages/PaymentFailure.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || searchParams.get("message");

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>⚠️ Pago rechazado</h1>
      <p>
        Lo sentimos, no pudimos procesar tu pago.
        {reason && (
          <>
            <br />
            <em>Motivo: {decodeURIComponent(reason)}</em>
          </>
        )}
      </p>

      <Link to="/checkout" style={styles.button}>Intentar otra vez</Link>
      <Link to="/" style={{ ...styles.button, background: "#64748b" }}>
        Volver al inicio
      </Link>
    </section>
  );
}

const styles = {
  container: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    textAlign: "center",
  },
  title: {
    marginBottom: ".8rem",
  },
  button: {
    display: "inline-block",
    padding: ".7rem 1.4rem",
    borderRadius: "6px",
    background: "#ef4444",
    color: "#fff",
    textDecoration: "none",
  },
};
