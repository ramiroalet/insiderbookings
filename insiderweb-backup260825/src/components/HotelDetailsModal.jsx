"use client"
import { useState } from "react"
import { X, Star, MapPin, Wifi, Car, Utensils, Dumbbell, Waves, Camera } from "lucide-react"

const HotelDetailsModal = ({ hotel, isOpen, onClose, onBook }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedRoom, setSelectedRoom] = useState(null)

  if (!isOpen || !hotel) return null

  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    restaurant: Utensils,
    gym: Dumbbell,
    pool: Waves,
    spa: Waves,
  }

  const getAmenityIcon = (amenity) => {
    const IconComponent = amenityIcons[amenity.toLowerCase()] || Camera
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hotel.hotelName}</h2>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {Array.from({ length: Number(hotel.categoryCode || 4) }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {hotel.location?.city}, {hotel.location?.country}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Tabs */}
          <div className="w-1/4 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: "overview", label: "Overview" },
                { id: "rooms", label: "Rooms" },
                { id: "amenities", label: "Amenities" },
                { id: "location", label: "Location" },
                { id: "policies", label: "Policies" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Hotel Images */}
                <div className="grid grid-cols-2 gap-4">
                  {hotel.medias?.slice(0, 4).map((media, idx) => (
                    <div
                      key={idx}
                      className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="h-8 w-8 text-white opacity-60" />
                    </div>
                  )) || (
                    <div className="col-span-2 aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <Camera className="h-12 w-12 text-white opacity-60" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this hotel</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {hotel.descriptions?.[0]?.texts?.[0]?.text ||
                      "Experience luxury and comfort at this exceptional hotel. Located in a prime location with world-class amenities and service."}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{hotel.categoryCode || "4"}</div>
                    <div className="text-sm text-gray-600">Star Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{hotel.rooms?.length || "12"}</div>
                    <div className="text-sm text-gray-600">Room Types</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{hotel.amenities?.length || "15"}</div>
                    <div className="text-sm text-gray-600">Amenities</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
                {hotel.rooms?.map((room, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRoom === idx ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRoom(idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{room.description || `Room Type ${idx + 1}`}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {room.occupancy || "2 guests"} • {room.beds || "1 bed"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {room.price || "€120"} {room.currency || "EUR"}
                        </div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>
                  </div>
                )) || <div className="text-center py-8 text-gray-500">Room details will be available after search</div>}
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Hotel Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {hotel.amenities?.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity)}
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  )) ||
                    ["WiFi", "Parking", "Restaurant", "Gym", "Pool", "Spa"].map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <span className="font-medium">
                      {hotel.location?.address || `${hotel.location?.city}, ${hotel.location?.country}`}
                    </span>
                  </div>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Map will be displayed here</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "policies" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Hotel Policies</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Check-in / Check-out</h4>
                    <p className="text-sm text-gray-600">Check-in: 3:00 PM | Check-out: 11:00 AM</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-gray-600">Free cancellation up to 24 hours before check-in</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pet Policy</h4>
                    <p className="text-sm text-gray-600">Pets are welcome with additional fees</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">From €{hotel.price || "120"} EUR</div>
              <div className="text-sm text-gray-500">per night, taxes included</div>
            </div>
            <button
              onClick={() => onBook(hotel)}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotelDetailsModal
