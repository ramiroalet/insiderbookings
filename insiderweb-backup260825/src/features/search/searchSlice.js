import { createSlice } from "@reduxjs/toolkit"

// Get today's date and tomorrow's date for default values
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

// Format dates as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split("T")[0]
}

const initialState = {
  checkIn: formatDate(today),
  checkOut: formatDate(tomorrow),
  guests: 2,
  children: 0,
  rooms: 1,
  location: "",
}

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      return { ...state, ...action.payload }
    },
    setDates: (state, action) => {
      const { checkIn, checkOut } = action.payload
      state.checkIn = checkIn
      state.checkOut = checkOut
    },
    setGuests: (state, action) => {
      state.guests = action.payload
    },
    setChildren: (state, action) => {
      state.children = action.payload
    },
    setRooms: (state, action) => {
      state.rooms = action.payload
    },
    setLocation: (state, action) => {
      state.location = action.payload
    },
    resetSearch: () => initialState,
  },
})

export const { setSearchParams, setDates, setGuests, setChildren, setRooms, setLocation, resetSearch } =
  searchSlice.actions

export default searchSlice.reducer
