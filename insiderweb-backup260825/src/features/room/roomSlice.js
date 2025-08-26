import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchRoomsData } from "../../utils/Api"

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async ({ hotelId, searchParams }, { rejectWithValue }) => {
    try {
      // Simulate API call with delay
      const response = await fetchRoomsData(hotelId, searchParams)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  byHotel: {}, // { hotelId: [rooms] }
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedRoom: null,
}

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    selectRoom: (state, action) => {
      state.selectedRoom = action.payload
    },
    clearSelectedRoom: (state) => {
      state.selectedRoom = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = "succeeded"
        const { hotelId, rooms } = action.payload
        state.byHotel[hotelId] = rooms
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
  },
})

export const { selectRoom, clearSelectedRoom } = roomSlice.actions

export default roomSlice.reducer
