import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchHotelsData } from "../../utils/Api"

export const fetchHotels = createAsyncThunk("hotel/fetchHotels", async (searchParams, { rejectWithValue }) => {
  try {
    // Simulate API call with delay
    const response = await fetchHotelsData(searchParams)
    return response
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  list: [],
  featured: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedHotel: null,
}

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {
    selectHotel: (state, action) => {
      state.selectedHotel = action.payload
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload.hotels
        state.featured = action.payload.featured || []
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
  },
})

export const { selectHotel, clearSelectedHotel } = hotelSlice.actions

export default hotelSlice.reducer
