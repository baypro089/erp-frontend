import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hrReportService from './hr-report.service';
import type {
  IManagerReport,
  ManagerReportFilterDto,
} from '@libs/shared/types/manager-report.type';

interface HrReportState {
  report: IManagerReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: HrReportState = {
  report: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchManagerReport = createAsyncThunk(
  'hrReport/fetchManagerReport',
  async (filter: ManagerReportFilterDto | undefined, { rejectWithValue }) => {
    try {
      const response = await hrReportService.getManagerReport(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải dữ liệu báo cáo');
    }
  }
);

// Slice
const hrReportSlice = createSlice({
  name: 'hrReport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReport: (state) => {
      state.report = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch manager report
    builder
      .addCase(fetchManagerReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchManagerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearReport } = hrReportSlice.actions;
export default hrReportSlice.reducer;
