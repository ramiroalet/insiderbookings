// src/components/Button.jsx
"use client"

/**
 * Reusable button with Tailwind styling.
 * Accepts all native <button> props plus an optional `variant`.
 */
export default function Button({
  children,
  variant = "primary", // "primary" | "secondary"
  className = "",
  disabled,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center h-12 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary:
      "text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200",
    secondary:
      "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
