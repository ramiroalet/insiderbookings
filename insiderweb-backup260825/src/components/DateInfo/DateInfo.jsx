"use client"

const DateInfo = ({ checkIn, checkOut }) => {
  if (!checkIn || !checkOut) return null

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-blue-900">Stay Duration:</span>
          <span className="ml-2 text-blue-700">
            {nights} night{nights !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-blue-600">
          {checkInDate.toLocaleDateString()} → {checkOutDate.toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default DateInfo
