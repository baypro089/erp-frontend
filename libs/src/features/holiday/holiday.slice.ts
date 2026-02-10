import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import holidayService from './holiday.service';
import type { HolidayResponse, CreateHolidayDto } from '@libs/shared/types/holiday.type';

interface HolidayState {
  holidays: HolidayResponse[];
  selectedYear: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: HolidayState = {
  holidays: [],
  selectedYear: new Date().getFullYear(),
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchHolidays = createAsyncThunk(
  'holiday/fetchHolidays',
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await holidayService.getHolidays(year);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch holidays');
    }
  }
);

export const createHoliday = createAsyncThunk(
  'holiday/createHoliday',
  async (data: CreateHolidayDto, { rejectWithValue }) => {
    try {
      const response = await holidayService.createHoliday(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create holiday');
    }
  }
);

export const deleteHoliday = createAsyncThunk(
  'holiday/deleteHoliday',
  async (id: number, { rejectWithValue }) => {
    try {
      await holidayService.deleteHoliday(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete holiday');
    }
  }
);

export const seedHolidays = createAsyncThunk(
  'holiday/seedHolidays',
  async (year: number, { rejectWithValue }) => {
    try {
      await holidayService.seedHolidays(year);
      return year;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to seed holidays');
    }
  }
);

// Slice
const holidaySlice = createSlice({
  name: 'holiday',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch holidays
    builder
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create holiday
    builder
      .addCase(createHoliday.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.holidays.push(action.payload);
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete holiday
    builder
      .addCase(deleteHoliday.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.holidays = state.holidays.filter(h => h.id !== action.payload);
      })
      .addCase(deleteHoliday.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Seed holidays
    builder
      .addCase(seedHolidays.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(seedHolidays.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.selectedYear = action.payload;
      })
      .addCase(seedHolidays.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, setSelectedYear } = holidaySlice.actions;
export default holidaySlice.reducer;
