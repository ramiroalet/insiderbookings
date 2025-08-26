/* ────────────────────────────────────────────────
   src/App.jsx — 100 % COMPLETO, SIN LÍNEAS OMITIDAS
   ──────────────────────────────────────────────── */
"use client"

import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { loadUserFromToken, forceLogin } from "./features/auth/authSlice"

/* ---------- layout & shared components ---------- */
import Header from "./components/Header/Header.jsx"
import AuthModal from "./components/AuthModal/AuthModal"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import RoleRoute from "./components/ProtectedRoute/RoleRoute.jsx"

/* ---------- public pages ---------- */
import Home from "./pages/Home/Home"
import Hotels from "./pages/Hotels/Hotels"
import Rooms from "./pages/Rooms/Rooms"
import Checkout from "./pages/Checkout/Checkout"
import Receipt from "./pages/Receipt/Receipt"
import DiscountCodes from "./pages/DiscountCodes/DiscountCodes"
import AddOns from "./pages/AddOns/AddOns"
import Login from "./pages/Login/Login"
import PaymentSuccess from "./pages/PaymentSucces/PaymentSuccess"
import PaymentFailure from "./pages/PaymentFailure/PaymentFailure"
import AddonPaymentSuccess from "./pages/AddonPaymentSuccess/AddonPaymentSuccess"
import AddonPaymentFailure from "./pages/AddonPaymentFailure/AddonPaymentFailure"
import SendReservationEmail from "./pages/AddonPostSell/SendEmailAddon"
import FastCheckIn from "./pages/FastChecking/FastCheckIn"

/* ---------- new outside-addons success page ---------- */
import OutsideAddonsSuccess from "./pages/OutsideAddonsSuccess/OutsideAddonsSuccess"

/* ---------- authenticated-only pages ---------- */
import Messages from "./pages/Messages/Messages"
import Profile from "./pages/Profile/Profile"
import Bookings from "./pages/Bookings/Bookings"
import Settings from "./pages/Settings/Settings"
import MyStay from "./pages/MyStay/MyStay"
import SetPassword from "./pages/SetPassword/SetPassword.jsx"
import Hotel2 from "./pages/hotels2.jsx"
import MaxinesLanding from "./pages/vaults/maxinesDorsetCatalina.jsx"
import PartnersHotels from "./pages/parters-hotels/PartnersHotels.jsx"
import IDashboard from "./pages/IDashboard/IDaashboard.jsx"
import BecomePartner from "./pages/BecomePartner/BecomePartner.jsx"
import ControlPanel from "./pages/Admin/ControlPanel"
import Forbidden from "./pages/Forbidden/Forbidden.jsx"

function App() {
  const dispatch = useDispatch()
  const { isLoggedIn, token } = useSelector((s) => s.auth)
  const location = useLocation()

  /* --- rehidratación + validación backend --- */
  useEffect(() => {
    if (!token) return
    // 1) Rehidratación instantánea para evitar parpadeo
    const snap = localStorage.getItem("user")
    if (snap) {
      try { dispatch(forceLogin({ token, user: JSON.parse(snap) })) } catch {}
    }
    // 2) Validación del token contra backend
    dispatch(loadUserFromToken())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token])

  /* --- desplázate al inicio al cambiar de ruta --------- */
  useEffect(() => window.scrollTo(0, 0), [location.pathname])

  /* ──────────────────────────────────────────────────── */
  return (
    <div className="app-container">
      {/* HEADER PERSISTENTE EN TODAS LAS PÁGINAS */}
      <Header />

      {/* CONTENIDO CAMBIANTE SEGÚN LA RUTA */}
      <div className="app-content">
        <Routes>
          {/* ---------- public routes ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels/:id/rooms" element={<Rooms />} />
          <Route path="/hotels2" element={<Hotels />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/receipt" element={<Receipt />} />
          <Route path="/discount" element={<DiscountCodes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFailure />} />
          <Route path="/payment/addon-success" element={<AddonPaymentSuccess />} />
          <Route path="/payment/addon-fail" element={<AddonPaymentFailure />} />
          <Route path="/payment/outside-addons-success" element={<OutsideAddonsSuccess />} />
          <Route path="/perks" element={<AddOns />} />
          <Route path="/contact-mail" element={<SendReservationEmail />} />
          <Route path="/fast-checkin" element={<FastCheckIn />} />
          <Route path="/my-stay" element={<MyStay />} />
          <Route path="/hotels" element={<Hotel2 />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/partners-hotels/maxinesdorsetcatalina" element={<MaxinesLanding />} />
          <Route path="/partners-hotels" element={<PartnersHotels />} />
          <Route path="/i-dashbord" element={<IDashboard />} />
          <Route path="/become-partner" element={<BecomePartner />} />
          <Route path="/403" element={<Forbidden />} />

          {/* ---------- protected routes (login requerido) ---------- */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* ---------- role-protected routes ---------- */}
          <Route
            path="/admin"
            element={
              <RoleRoute roles={[100]}>
                <ControlPanel />
              </RoleRoute>
            }
          />
        </Routes>
      </div>

      <AuthModal />
    </div>
  )
}

export default App
