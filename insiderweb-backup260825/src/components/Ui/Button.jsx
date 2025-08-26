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
        "text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-200",
      secondary:
        "text-gray-700 bg-white border border-gray-300 hover:bg-red-50 focus:ring-4 focus:ring-red-200",
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
