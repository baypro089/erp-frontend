import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import returnRequestService from './return-request.service';
import type {
  ReturnRequestResponse,
  ReturnRequesTableListResponse,
  ReturnRequesTableResponse,
  CreateReturnRequestDto,
} from '@libs/shared/types/return-request.type';
import type { OrderResponse } from '@libs/shared/types/order.type';

interface ReturnRequestState {
  returnRequests: ReturnRequesTableResponse[];
  pagedReturnRequests: ReturnRequesTableListResponse | null;
  currentReturnRequest: ReturnRequestResponse | null;
  // Tra cứu đơn hàng để tạo phiếu trả
  searchResults: OrderResponse[];
  selectedOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ReturnRequestState = {
  returnRequests: [],
  pagedReturnRequests: null,
  currentReturnRequest: null,
  searchResults: [],
  selectedOrder: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchReturnRequests = createAsyncThunk(
  'returnRequest/fetchAll',
  async (params: { code?: string; page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      return await returnRequestService.getReturnRequests(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách thất bại');
    }
  }
);

export const fetchReturnRequestById = createAsyncThunk(
  'returnRequest/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await returnRequestService.getReturnRequestById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy chi tiết thất bại');
    }
  }
);

export const createReturnRequest = createAsyncThunk(
  'returnRequest/create',
  async (data: CreateReturnRequestDto, { rejectWithValue }) => {
    try {
      return await returnRequestService.createReturnRequest(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo phiếu trả hàng thất bại');
    }
  }
);

export const searchOrdersForReturn = createAsyncThunk(
  'returnRequest/searchOrders',
  async (query: string, { rejectWithValue }) => {
    try {
      return await returnRequestService.searchOrders(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tìm kiếm thất bại');
    }
  }
);

export const fetchOrderForReturn = createAsyncThunk(
  'returnRequest/fetchOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await returnRequestService.getOrderById(orderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy đơn hàng thất bại');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const returnRequestSlice = createSlice({
  name: 'returnRequest',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
      state.operationError = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    setSelectedOrder(state, action) {
      state.selectedOrder = action.payload;
    },
    clearCurrentReturnRequest(state) {
      state.currentReturnRequest = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchReturnRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pagedReturnRequests = action.payload;
        state.returnRequests = action.payload.items;
      })
      .addCase(fetchReturnRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchById
    builder
      .addCase(fetchReturnRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReturnRequest = action.payload;
      })
      .addCase(fetchReturnRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // create
    builder
      .addCase(createReturnRequest.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createReturnRequest.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentReturnRequest = action.payload;
      })
      .addCase(createReturnRequest.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // searchOrders
    builder
      .addCase(searchOrdersForReturn.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchOrdersForReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchOrdersForReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchOrderForReturn
    builder
      .addCase(fetchOrderForReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderForReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderForReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults, setSelectedOrder, clearCurrentReturnRequest } =
  returnRequestSlice.actions;

export default returnRequestSlice.reducer;
