import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import searchReducer from "../features/search/searchSlice"
import hotelReducer from "../features/hotel/hotelSlice"
import roomReducer from "../features/room/roomSlice"
import bookingReducer from "../features/booking/bookingSlice"
import discountReducer from "../features/discount/discountSlice"
import fastCheckInReducer from "../features/fastCheckInSlice/fastCheckInSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    hotel: hotelReducer,
    room: roomReducer,
    booking: bookingReducer,
    discount: discountReducer,
    fastCheckIn: fastCheckInReducer
  },
})
