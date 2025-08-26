"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, User, Mail, Phone, Lock, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import {
  updateUserProfile,
  changePassword,
  deleteAccount,
  logout,
  clearError,
  clearUpdateStatus,
  clearPasswordChangeStatus,
  clearDeleteAccountStatus,
} from "../../features/auth/authSlice"

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    user,
    isLoggedIn,
    updateStatus,
    updateError,
    passwordChangeStatus,
    passwordChangeError,
    deleteAccountStatus,
    deleteAccountError,
  } = useSelector((state) => state.auth)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
    }
  }, [isLoggedIn, navigate])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearUpdateStatus())
      dispatch(clearPasswordChangeStatus())
      dispatch(clearDeleteAccountStatus())
    }
  }, [dispatch])

  // Handle successful account deletion
  useEffect(() => {
    if (deleteAccountStatus === "succeeded") {
      dispatch(logout())
      navigate("/")
    }
  }, [deleteAccountStatus, dispatch, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.phone && !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    dispatch(updateUserProfile(formData))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    dispatch(changePassword(passwordData))
  }

  // Clear password form on successful change
  useEffect(() => {
    if (passwordChangeStatus === "succeeded") {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [passwordChangeStatus])

  const handleDeleteAccount = () => {
    const password = prompt("Please enter your password to confirm account deletion:")
    if (password) {
      dispatch(deleteAccount(password))
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="py-4 sm:py-6 px-4 sm:px-6 max-w-3xl mx-auto">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate("/profile")} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      </header>

      {/* Profile Information Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        {updateStatus === "succeeded" && (
          <div className="mb-4 p-4 rounded-lg flex items-center bg-green-50 text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {updateError && (
          <div className="mb-4 p-4 rounded-lg flex items-center bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{updateError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={updateStatus === "loading"}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70"
            >
              {updateStatus === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {passwordChangeStatus === "succeeded" && (
          <div className="mb-4 p-4 rounded-lg flex items-center bg-green-50 text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Password changed successfully!</span>
          </div>
        )}

        {passwordChangeError && (
          <div className="mb-4 p-4 rounded-lg flex items-center bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{passwordChangeError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            {/* Current Password Field */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    passwordErrors.currentPassword ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Enter your current password"
                />
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    passwordErrors.newPassword ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Enter new password"
                />
              </div>
              {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    passwordErrors.confirmPassword ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={passwordChangeStatus === "loading"}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-70"
            >
              {passwordChangeStatus === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
        <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
        <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>

        {deleteAccountError && (
          <div className="mb-4 p-4 rounded-lg flex items-center bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{deleteAccountError}</span>
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          disabled={deleteAccountStatus === "loading"}
          className="bg-white border border-red-500 text-red-600 hover:bg-red-50 font-medium py-3 px-4 rounded-lg w-full disabled:opacity-70"
        >
          {deleteAccountStatus === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
              Deleting Account...
            </>
          ) : (
            "Delete Account"
          )}
        </button>
      </div>
    </div>
  )
}
