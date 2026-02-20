import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import productSerialService from './product-serial.service';
import type {
  ProductSerialResponse,
  ProductSerialListResponse,
} from '@libs/shared/types/product-serial.type';

interface ProductSerialState {
  serials: ProductSerialResponse[];
  currentSerial: ProductSerialResponse | null;
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  searchLoading: boolean;
  searchError: string | null;
}

const initialState: ProductSerialState = {
  serials: [],
  currentSerial: null,
  totalCount: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  searchLoading: false,
  searchError: null,
};

// Async thunks
export const fetchSerialsByProduct = createAsyncThunk(
  'productSerial/fetchSerialsByProduct',
  async (
    params: {
      productId: string;
      warehouseId: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await productSerialService.getSerialsByProduct(
        params.productId,
        params.warehouseId,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch serials');
    }
  }
);

export const searchSerialByNumber = createAsyncThunk(
  'productSerial/searchSerialByNumber',
  async (serialNumber: string, { rejectWithValue }) => {
    try {
      const response = await productSerialService.getSerialByNumber(serialNumber);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Serial not found');
    }
  }
);

const productSerialSlice = createSlice({
  name: 'productSerial',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    clearCurrentSerial: (state) => {
      state.currentSerial = null;
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch serials by product
    builder
      .addCase(fetchSerialsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSerialsByProduct.fulfilled, (state, action: PayloadAction<ProductSerialListResponse>) => {
        state.loading = false;
        state.serials = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchSerialsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search serial by number
    builder
      .addCase(searchSerialByNumber.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.currentSerial = null;
      })
      .addCase(searchSerialByNumber.fulfilled, (state, action: PayloadAction<ProductSerialResponse>) => {
        state.searchLoading = false;
        state.currentSerial = action.payload;
      })
      .addCase(searchSerialByNumber.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
        state.currentSerial = null;
      });
  },
});

export const { clearError, clearCurrentSerial } = productSerialSlice.actions;
export default productSerialSlice.reducer;
