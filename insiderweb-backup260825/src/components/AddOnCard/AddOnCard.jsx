// src/components/AddOnCard/AddOnCard.jsx
"use client"

import { useState } from "react"
import Button        from "../Ui/Button.jsx"

/* ───────────────────────── CTA por defecto ───────────────────────── */
const defaultCta = (addon, qty, opt) => {
  if (addon.type === "quantity") {
    const total = addon.price * qty
    // ej. “Add Breakfast – $45.60”  |  “Add for $100”
    const base  = addon.title?.toLowerCase().includes("breakfast")
                  ? "Add Breakfast"           // texto más natural
                  : addon.title?.toLowerCase().includes("valet")
                      ? "Add for"
                      : "Add"
    return `${base} – $${total.toFixed(2)}`
  }

  if (addon.type === "options")
    return opt ? `Select – $${opt.price.toFixed(2)}` : "Select option"

  return `Add – $${Number(addon.price).toFixed(2)}`  // choice
}

/* ───────────────────────── Componente ───────────────────────── */
export default function AddonCard({ addon, onAdd, onSkip }) {
  /* -------- estado local -------- */
  const [qty,   setQty]  = useState(addon.defaultQty ?? 1)           // quantity
  const [optId, setOpt]  = useState(addon.options?.[0]?.id ?? null)  // options

  const currentOpt = addon.type === "options"
    ? addon.options.find(o => o.id === optId)
    : null

  /* -------- textos CTA / Skip -------- */
  const ctaText  = addon.ctaLabel
    ? addon.type === "quantity"
        ? addon.ctaLabel(qty)
        : addon.type === "options"
            ? addon.ctaLabel(currentOpt || {})
            : addon.ctaLabel()
    : defaultCta(addon, qty, currentOpt)

  const skipText = addon.skipLabel ?? "Skip"

  /* -------- enviar selección -------- */
  const handleAdd = () => {
    if (addon.type === "quantity") {
      onAdd({ id: addon.slug, qty })
    } else if (addon.type === "options") {
      onAdd({
        id       : addon.slug,
        optionId : currentOpt.id,
        label    : currentOpt.label,
        price    : currentOpt.price,
      })
    } else {
      onAdd({ id: addon.slug })
    }
  }

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

      {/* encabezado */}
      <div className="flex items-center gap-4 mb-4">
        {addon.Icon && <addon.Icon className="w-8 h-8 text-blue-600" />}
        <div>
          <h3 className="text-xl font-semibold">{addon.title}</h3>
          {addon.subtitle && <p className="text-gray-500">{addon.subtitle}</p>}
        </div>
      </div>

      {/* OPTIONS (radio) */}
      {addon.type === "options" && (
        <div className="space-y-3 mb-4">
          {addon.options.map(o => (
            <div
              key={o.id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setOpt(o.id)}
            >
              <span
                className={
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 " +
                  (optId === o.id
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300")
                }
              >
                {optId === o.id && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <span>{o.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* QUANTITY  (selector 1-14) */}
      {addon.type === "quantity" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {addon.slug === "valetParking" ? "Nights" : "Days"}
          </label>

          <select
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map(n =>
              <option key={n} value={n}>{n}</option>
            )}
          </select>
        </div>
      )}

      {/* descripción + nota */}
      {addon.description && <p className="text-gray-700 mb-6">{addon.description}</p>}
      {addon.footnote    && <p className="text-xs text-gray-500 mb-4">{addon.footnote}</p>}

      {/* botones */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleAdd}>{ctaText}</Button>
        <Button variant="secondary" onClick={() => onSkip(addon.slug)}>
          {skipText}
        </Button>
      </div>
    </div>
  )
}
