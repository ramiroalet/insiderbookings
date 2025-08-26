"use client"
import { useState } from "react"
import { DollarSign, Calendar, Users, Loader2, CheckCircle } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

const PriceChecker = ({ hotels, onPricesLoaded }) => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchParams, setSearchParams] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    adults: 2,
    children: 0,
    currency: "EUR",
  })

  const checkAllPrices = async () => {
    setLoading(true)
    setProgress(0)

    const priceResults = {}
    const batchSize = 5 // Procesar 5 hoteles a la vez

    for (let i = 0; i < hotels.length; i += batchSize) {
      const batch = hotels.slice(i, i + batchSize)

      const batchPromises = batch.map(async (hotel) => {
        try {
          const occupancies = `${searchParams.adults}|${searchParams.children}`
          const queryParams = new URLSearchParams({
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            occupancies,
            currency: searchParams.currency,
            hotelCodes: hotel.hotelCode,
          })

          const response = await fetch(`${API_URL}/tgx/search?${queryParams}`)

          if (response.ok) {
            const results = await response.json()
            if (results.length > 0 && results[0].rooms?.length > 0) {
              const minPrice = Math.min(...results[0].rooms.map((room) => Number.parseFloat(room.price) || 0))
              return {
                hotelCode: hotel.hotelCode,
                price: minPrice,
                currency: results[0].currency || "EUR",
                available: true,
                roomCount: results[0].rooms.length,
                rooms: results[0].rooms,
              }
            }
          }

          return {
            hotelCode: hotel.hotelCode,
            available: false,
          }
        } catch (error) {
          console.error(`Error checking price for hotel ${hotel.hotelCode}:`, error)
          return {
            hotelCode: hotel.hotelCode,
            error: true,
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)

      batchResults.forEach((result) => {
        priceResults[result.hotelCode] = result
      })

      setProgress(Math.min(100, ((i + batchSize) / hotels.length) * 100))
    }

    setLoading(false)
    onPricesLoaded(priceResults)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Price Checker</h3>
            <p className="text-sm text-gray-600">Check live prices and availability for all hotels</p>
          </div>
        </div>
      </div>

      {/* Search Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Check-in
          </label>
          <input
            type="date"
            value={searchParams.checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, checkIn: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Check-out
          </label>
          <input
            type="date"
            value={searchParams.checkOut}
            min={searchParams.checkIn}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, checkOut: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Guests
          </label>
          <div className="flex space-x-2">
            <select
              value={searchParams.adults}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, adults: Number.parseInt(e.target.value) }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Adult{n !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select
              value={searchParams.children}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, children: Number.parseInt(e.target.value) }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} Child{n !== 1 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={searchParams.currency}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Will check prices for {hotels.length} hotels</div>

        <button
          onClick={checkAllPrices}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking... {Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Check All Prices</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Checking prices...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceChecker
