"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { showAuthModal } from "../../features/auth/authSlice"

const ProtectedRoute = ({ children, isLoggedIn }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(showAuthModal(window.location.pathname))
      navigate("/")
    }
  }, [isLoggedIn, navigate, dispatch])

  return isLoggedIn ? children : null
}

export default ProtectedRoute
