import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  JobHistoryResponse,
  CreateJobHistoryDto,
} from '@libs/shared/types/job-histories.type';
import { jobHistoryService } from './job-history.service';

interface JobHistoryState {
  jobHistories: JobHistoryResponse[];
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
}

const initialState: JobHistoryState = {
  jobHistories: [],
  loading: false,
  operationLoading: false,
  error: null,
};

// Async thunks
export const fetchJobHistoriesByEmployeeId = createAsyncThunk(
  'jobHistory/fetchByEmployeeId',
  async (employeeId: string) => {
    const response = await jobHistoryService.getJobHistoriesByEmployeeId(employeeId);
    return response;
  }
);

export const createJobHistory = createAsyncThunk(
  'jobHistory/create',
  async (data: CreateJobHistoryDto) => {
    const response = await jobHistoryService.createJobHistory(data);
    return response;
  }
);

// Slice
const jobHistorySlice = createSlice({
  name: 'jobHistory',
  initialState,
  reducers: {
    clearJobHistories: (state) => {
      state.jobHistories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch job histories by employee ID
      .addCase(fetchJobHistoriesByEmployeeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobHistoriesByEmployeeId.fulfilled, (state, action: PayloadAction<JobHistoryResponse[]>) => {
        state.loading = false;
        state.jobHistories = action.payload;
      })
      .addCase(fetchJobHistoriesByEmployeeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch job histories';
      })
      // Create job history
      .addCase(createJobHistory.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createJobHistory.fulfilled, (state, action: PayloadAction<JobHistoryResponse>) => {
        state.operationLoading = false;
        state.jobHistories = [action.payload, ...state.jobHistories];
      })
      .addCase(createJobHistory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.error.message || 'Failed to create job history';
      });
  },
});

export const { clearJobHistories } = jobHistorySlice.actions;
export default jobHistorySlice.reducer;
