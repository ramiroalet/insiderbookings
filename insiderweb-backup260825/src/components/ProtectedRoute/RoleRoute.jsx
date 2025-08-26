"use client"

import { useSelector } from "react-redux"
import { useLocation, Navigate } from "react-router-dom"

/**
 * RoleRoute
 * - Requiere sesión + rol dentro de una lista permitida.
 * - Si no hay sesión: abre modal login (a través de tu flujo actual) y redirige a "/".
 * - Si hay sesión pero el rol NO está permitido: va a /403 (o cambiá por 404 si preferís).
 *
 * Uso:
 * <RoleRoute roles={[100]}><AdminPanel/></RoleRoute>
 * <RoleRoute roles={[2,3]}><AlgunPanel/></RoleRoute>
 */
export default function RoleRoute({ roles = [], children }) {
  const { isLoggedIn, user } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!isLoggedIn) {
    // sin sesión → a Home (tu ProtectedRoute ya abre el modal)
    return <Navigate to="/" replace state={{ from: location }} />
  }

  const role = Number(user?.role)
  const ok = roles.length === 0 || roles.includes(role)

  if (!ok) {
    return <Navigate to="/403" replace />
  }

  return children
}
