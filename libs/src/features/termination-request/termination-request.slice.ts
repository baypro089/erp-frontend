import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TerminationStatus } from '@libs/shared/enums/termination-status.enum';
import type {
  CreateTerminationRequestDto,
  RestoreTerminationRequestDto,
  TerminationApproveResponse,
  TerminationRequestListResponse,
  TerminationRequestResponse,
} from '@libs/shared/types/termination-request.type';
import terminationRequestService from './termination-request.service';

interface TerminationRequestState {
  terminationRequests: TerminationRequestResponse[];
  currentTerminationRequest: TerminationRequestResponse | null;
  latestApproveResult: TerminationApproveResponse | null;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: TerminationRequestState = {
  terminationRequests: [],
  currentTerminationRequest: null,
  latestApproveResult: null,
  totalCount: 0,
  totalPages: 0,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

const extractError = (error: any, fallback: string): string => {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  if (Array.isArray(error?.response?.data?.message)) {
    return error.response.data.message.join(', ');
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return fallback;
};

export const fetchTerminationRequests = createAsyncThunk(
  'terminationRequest/fetchTerminationRequests',
  async (
    params: {
      status?: string;
      employeeName?: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response: TerminationRequestListResponse =
        await terminationRequestService.getTerminationRequests(
          params.status,
          params.employeeName,
          params.page,
          params.pageSize,
        );
      return response;
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể tải danh sách yêu cầu sa thải'));
    }
  },
);

export const fetchTerminationRequestById = createAsyncThunk(
  'terminationRequest/fetchTerminationRequestById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await terminationRequestService.getTerminationRequestById(id);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể tải chi tiết yêu cầu sa thải'));
    }
  },
);

export const fetchTerminationRequestsByEmployee = createAsyncThunk(
  'terminationRequest/fetchTerminationRequestsByEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      return await terminationRequestService.getTerminationRequestsByEmployee(employeeId);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể tải lịch sử sa thải của nhân viên'));
    }
  },
);

export const createTerminationRequest = createAsyncThunk(
  'terminationRequest/createTerminationRequest',
  async (data: CreateTerminationRequestDto, { rejectWithValue }) => {
    try {
      return await terminationRequestService.createTerminationRequest(data);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể tạo yêu cầu sa thải'));
    }
  },
);

export const approveTerminationRequest = createAsyncThunk(
  'terminationRequest/approveTerminationRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      return await terminationRequestService.approveTerminationRequest(id);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể duyệt yêu cầu sa thải'));
    }
  },
);

export const rejectTerminationRequest = createAsyncThunk(
  'terminationRequest/rejectTerminationRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      return await terminationRequestService.rejectTerminationRequest(id);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể từ chối yêu cầu sa thải'));
    }
  },
);

export const updateTerminationReassignStatus = createAsyncThunk(
  'terminationRequest/updateTerminationReassignStatus',
  async (
    {
      id,
      isReassigned,
    }: {
      id: string;
      isReassigned: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      return await terminationRequestService.updateReassignStatus(id, isReassigned);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể cập nhật nghĩa vụ bàn giao'));
    }
  },
);

export const restoreTerminationRequest = createAsyncThunk(
  'terminationRequest/restoreTerminationRequest',
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: RestoreTerminationRequestDto;
    },
    { rejectWithValue },
  ) => {
    try {
      return await terminationRequestService.restoreTerminationRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(extractError(error, 'Không thể restore nhân viên'));
    }
  },
);

const upsertRequest = (
  list: TerminationRequestResponse[],
  item: TerminationRequestResponse,
): TerminationRequestResponse[] => {
  const index = list.findIndex((request) => request.id === item.id);
  if (index >= 0) {
    const next = [...list];
    next[index] = item;
    return next;
  }
  return [item, ...list];
};

const terminationRequestSlice = createSlice({
  name: 'terminationRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentTerminationRequest: (state) => {
      state.currentTerminationRequest = null;
    },
    clearLatestApproveResult: (state) => {
      state.latestApproveResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerminationRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerminationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.terminationRequests = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTerminationRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTerminationRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTerminationRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.latestApproveResult = action.payload;
        state.currentTerminationRequest = action.payload.terminationRequest;
        state.terminationRequests = upsertRequest(
          state.terminationRequests,
          action.payload.terminationRequest,
        );
      })
      .addCase(fetchTerminationRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createTerminationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createTerminationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentTerminationRequest = action.payload;
        state.terminationRequests = [action.payload, ...state.terminationRequests];
      })
      .addCase(createTerminationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    builder
      .addCase(approveTerminationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(approveTerminationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.latestApproveResult = action.payload;
        state.currentTerminationRequest = action.payload.terminationRequest;
        state.terminationRequests = upsertRequest(
          state.terminationRequests,
          action.payload.terminationRequest,
        );
      })
      .addCase(approveTerminationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    builder
      .addCase(rejectTerminationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(rejectTerminationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentTerminationRequest = action.payload;
        state.terminationRequests = upsertRequest(state.terminationRequests, action.payload);
      })
      .addCase(rejectTerminationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    builder
      .addCase(updateTerminationReassignStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateTerminationReassignStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentTerminationRequest = action.payload;
        state.terminationRequests = upsertRequest(state.terminationRequests, action.payload);
      })
      .addCase(updateTerminationReassignStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    builder
      .addCase(restoreTerminationRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(restoreTerminationRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentTerminationRequest = action.payload;
        state.terminationRequests = upsertRequest(state.terminationRequests, action.payload);
      })
      .addCase(restoreTerminationRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    builder.addCase(fetchTerminationRequestsByEmployee.fulfilled, (state, action) => {
      const pending = action.payload.some((request) => request.status === TerminationStatus.PENDING);
      if (pending && state.error === null) {
        state.error = null;
      }
    });
  },
});

export const { clearError, clearCurrentTerminationRequest, clearLatestApproveResult } =
  terminationRequestSlice.actions;

export default terminationRequestSlice.reducer;
