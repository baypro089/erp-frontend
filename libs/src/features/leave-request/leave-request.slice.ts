import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaveRequestService from './leave-request.service';
import type {
  LeaveRequestResponse,
  LeaveRequestCreateDto,
  PagedAndFilteredLeaveRequest,
} from '@libs/shared/types/leave-requests.type';
import { LeaveRequestStatus } from '@libs/shared/enums/leave-request-status.enum';

interface LeaveRequestState {
  leaveRequests: LeaveRequestResponse[];
  currentLeaveRequest: LeaveRequestResponse | null;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: LeaveRequestState = {
  leaveRequests: [],
  currentLeaveRequest: null,
  totalCount: 0,
  totalPages: 0,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchMyLeaveRequests = createAsyncThunk(
  'leaveRequest/fetchMyLeaveRequests',
  async (
    params: {
      status?: LeaveRequestStatus;
      startDateFrom?: Date;
      startDateTo?: Date;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await leaveRequestService.getMyLeaveRequests(
        params.status,
        params.startDateFrom,
        params.startDateTo,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch my leave requests'
      );
    }
  }
);

export const fetchLeaveRequests = createAsyncThunk(
  'leaveRequest/fetchLeaveRequests',
  async (
    params: {
      status?: LeaveRequestStatus;
      startDateFrom?: Date;
      startDateTo?: Date;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await leaveRequestService.getLeaveRequests(
        params.status,
        params.startDateFrom,
        params.startDateTo,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leave requests'
      );
    }
  }
);

export const createLeaveRequest = createAsyncThunk(
  'leaveRequest/createLeaveRequest',
  async (data: LeaveRequestCreateDto, { rejectWithValue }) => {
    try {
      const response = await leaveRequestService.createLeaveRequest(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create leave request'
      );
    }
  }
);

export const updateLeaveRequestStatus = createAsyncThunk(
  'leaveRequest/updateLeaveRequestStatus',
  async (
    {
      id,
      status,
      reason,
    }: {
      id: string;
      status: LeaveRequestStatus;
      reason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await leaveRequestService.updateLeaveRequestStatus(
        id,
        status,
        reason
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update leave request status'
      );
    }
  }
);

const leaveRequestSlice = createSlice({
  name: 'leaveRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch my leave requests
    builder
      .addCase(fetchMyLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveRequests = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMyLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch leave requests
    builder
      .addCase(fetchLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveRequests = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create leave request
    builder
      .addCase(createLeaveRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.leaveRequests.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update leave request status
    builder
      .addCase(updateLeaveRequestStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.leaveRequests.findIndex(
          (lr) => lr.id === action.payload.id
        );
        if (index !== -1) {
          state.leaveRequests[index] = action.payload;
        }
      })
      .addCase(updateLeaveRequestStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError } = leaveRequestSlice.actions;
export default leaveRequestSlice.reducer;
