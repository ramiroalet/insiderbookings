"use client"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Settings, Briefcase, Users, Home, LogOut } from "lucide-react"
import { logout, loadUserFromToken } from "../../features/auth/authSlice"

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoggedIn, loading } = useSelector((state) => state.auth)

  console.log(user, "user")

  useEffect(() => {
    // Refresh user data when component mounts
    if (isLoggedIn && !user && !loading) {
      dispatch(loadUserFromToken())
    }
  }, [dispatch, isLoggedIn, user, loading])

  // Get first letter of name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  if (!isLoggedIn) {
    navigate("/login")
    return null
  }

  return (
    <div className="py-4 sm:py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-white">{getInitial(user?.name)}</span>
        </div>
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>
        {user?.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/bookings")}
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">My Bookings</h3>
            <p className="text-sm text-gray-500">View your trip history</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Connections</h3>
            <p className="text-sm text-gray-500">Manage your connections</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Home className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Become a host</h3>
            <p className="text-sm text-gray-500">Start hosting and earn additional income</p>
          </div>
        </div>
      </div>

      <div
        className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow mb-6"
        onClick={() => navigate("/settings")}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Settings className="h-6 w-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Account settings</h3>
          <p className="text-sm text-gray-500">Manage your profile and preferences</p>
        </div>
        <div className="text-gray-400">&gt;</div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:bg-gray-50"
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <LogOut className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Log out</h3>
          <p className="text-sm text-gray-500">Sign out of your account</p>
        </div>
      </button>
    </div>
  )
}
