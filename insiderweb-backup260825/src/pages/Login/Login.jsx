"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import AuthModal from "../../components/AuthModal/AuthModal"
import { showAuthModal } from "../../features/auth/authSlice"

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, showAuthModal: modalVisible } = useSelector((s) => s.auth)
  const [initialized, setInitialized] = useState(false)

  const from = location.state?.from || "/"

  useEffect(() => {
    if (token) {
      navigate(from)
      return
    }
    dispatch(showAuthModal({ mode: "login" }))
    setInitialized(true)
  }, [token, dispatch, navigate, from])

  useEffect(() => {
    if (initialized && !modalVisible) {
      navigate(from)
    }
  }, [initialized, modalVisible, navigate, from])

  return <AuthModal />
}

export default Login
