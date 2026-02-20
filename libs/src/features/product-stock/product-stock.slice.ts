import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import productStockService from './product-stock.service';
import type { 
  ProductStockResponse, 
  ProductStockFilteredAndPaged,
  StockAdjustmentDTO
} from '@libs/shared/types/product-stock.type';
import type { 
  StockHistoryResponse, 
  StockHistoryFilteredAndPaged 
} from '@libs/shared/types/stock-history.type';

interface ProductStockState {
  stocks: ProductStockResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Stock history
  histories: StockHistoryResponse[];
  historiesTotal: number;
  historiesPage: number;
  
  loading: boolean;
  error: string | null;
  
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ProductStockState = {
  stocks: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  
  histories: [],
  historiesTotal: 0,
  historiesPage: 1,
  
  loading: false,
  error: null,
  
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchStocksByWarehouse = createAsyncThunk(
  'productStock/fetchByWarehouse',
  async (params: {
    warehouseId: string;
    search?: string;
    lowStock?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await productStockService.getStocksByWarehouse(params);
    return response;
  }
);

export const fetchStockHistory = createAsyncThunk(
  'productStock/fetchHistory',
  async (params: {
    warehouseId: string;
    productId: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await productStockService.getStockHistory(
      params.warehouseId,
      params.productId,
      params.page,
      params.pageSize
    );
    return response;
  }
);

export const adjustStock = createAsyncThunk(
  'productStock/adjust',
  async (dto: StockAdjustmentDTO) => {
    const response = await productStockService.adjustStock(dto);
    return response;
  }
);

const productStockSlice = createSlice({
  name: 'productStock',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearHistories: (state) => {
      state.histories = [];
      state.historiesTotal = 0;
      state.historiesPage = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch stocks by warehouse
    builder
      .addCase(fetchStocksByWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocksByWarehouse.fulfilled, (state, action: PayloadAction<ProductStockFilteredAndPaged>) => {
        state.loading = false;
        state.stocks = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
        state.hasNextPage = action.payload.hasNextPage;
        state.hasPreviousPage = action.payload.hasPreviousPage;
      })
      .addCase(fetchStocksByWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tải dữ liệu';
      });

    // Fetch stock history
    builder
      .addCase(fetchStockHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action: PayloadAction<StockHistoryFilteredAndPaged>) => {
        state.loading = false;
        state.histories = action.payload.items;
        state.historiesTotal = action.payload.totalCount;
        state.historiesPage = action.payload.page;
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Có lỗi xảy ra khi tải lịch sử';
      });

    // Adjust stock
    builder
      .addCase(adjustStock.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(adjustStock.fulfilled, (state, action: PayloadAction<ProductStockResponse>) => {
        state.operationLoading = false;
        // Update stock in list if exists
        const index = state.stocks.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.error.message || 'Có lỗi xảy ra khi điều chỉnh kho';
      });
  },
});

export const { clearError, clearHistories } = productStockSlice.actions;
export default productStockSlice.reducer;
