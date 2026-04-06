import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import resignationRequestService from './resignation-request.service';
import type {
  ResignationRequestResponse,
  CreateResignationRequest,
  ResignationRequestListResponse,
} from '@libs/shared/types/resignation-request.type';
import { ResignationStatus } from '@libs/shared/enums/resignation-status.enum';

interface ResignationRequestState {
  resignationRequests: ResignationRequestResponse[];
  currentResignationRequest: ResignationRequestResponse | null;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ResignationRequestState = {
  resignationRequests: [],
  currentResignationRequest: null,
  totalCount: 0,
  totalPages: 0,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchResignationRequests = createAsyncThunk(
  'resignationRequest/fetchResignationRequests',
  async (
    params: {
      status?: string;
      employeeName?: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await resignationRequestService.getResignationRequests(
        params.status,
        params.employeeName,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch resignation requests'
      );
    }
  }
);

export const fetchResignationRequestById = createAsyncThunk(
  'resignationRequest/fetchResignationRequestById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resignationRequestService.getResignationRequestById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch resignation request'
      );
    }
  }
);

export const fetchMyResignationRequests = createAsyncThunk(
  'resignationRequest/fetchMyResignationRequests',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await resignationRequestService.getMyResignationRequests(employeeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch my resignation requests'
      );
    }
  }
);

export const createResignationRequest = createAsyncThunk(
  'resignationRequest/createResignationRequest',
  async (data: CreateResignationRequest, { rejectWithValue }) => {
    try {
      const response = await resignationRequestService.createResignationRequest(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create resignation request'
      );
    }
  }
);

export const approveResignationRequest = createAsyncThunk(
  'resignationRequest/approveResignationRequest',
  async (
    {
      id,
      approvedLastDay,
      hrNote,
    }: {
      id: string;
      approvedLastDay: Date;
      hrNote?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await resignationRequestService.approveResignationRequest(
        id,
        approvedLastDay,
        hrNote
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve resignation request'
      );
    }
  }
);

export const rejectResignationRequest = createAsyncThunk(
  'resignationRequest/rejectResignationRequest',
  async (
    {
      id,
      hrNote,
    }: {
      id: string;
      hrNote: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await resignationRequestService.rejectResignationRequest(
        id,
        hrNote
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject resignation request'
      );
    }
  }
);

const resignationRequestSlice = createSlice({
  name: 'resignationRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentResignationRequest: (state) => {
      state.currentResignationRequest = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch resignation requests
    builder
      .addCase(fetchResignationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResignationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.resignationRequests = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchResignationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch resignation request by ID
    builder
      .addCase(fetchResignationRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResignationRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResignationRequest = action.payload;
      })
      .addCase(fetchResignationRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch my resignation requests
    builder
      .addCase(fetchMyResignationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyResignationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.resignationRequests = action.payload;
      })
      .addCase(fetchMyResignationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create resignation request
    builder
      .addCase(createResignationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createResignationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.resignationRequests.unshift(action.payload);
        state.currentResignationRequest = action.payload;
      })
      .addCase(createResignationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Approve resignation request
    builder
      .addCase(approveResignationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(approveResignationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.resignationRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.resignationRequests[index] = action.payload;
        }
        if (state.currentResignationRequest?.id === action.payload.id) {
          state.currentResignationRequest = action.payload;
        }
      })
      .addCase(approveResignationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Reject resignation request
    builder
      .addCase(rejectResignationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(rejectResignationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.resignationRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.resignationRequests[index] = action.payload;
        }
        if (state.currentResignationRequest?.id === action.payload.id) {
          state.currentResignationRequest = action.payload;
        }
      })
      .addCase(rejectResignationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentResignationRequest } = resignationRequestSlice.actions;
export default resignationRequestSlice.reducer;
