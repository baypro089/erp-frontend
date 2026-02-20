import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import importReceiptService from './import-receipt.service';
import type {
  ImportReceiptResponse,
  ImportReceiptTableResponse,
  ImportReceiptTableFilteredAndPaged,
  CreateImportReceiptDto,
} from '@libs/shared/types/import-receipt.type';
import { ReceiptStatus } from '@libs/shared/enums/receipt-status.enum';

interface ImportReceiptState {
  importReceipts: ImportReceiptTableResponse[];
  pagedImportReceipts: ImportReceiptTableFilteredAndPaged | null;
  currentImportReceipt: ImportReceiptResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: ImportReceiptState = {
  importReceipts: [],
  pagedImportReceipts: null,
  currentImportReceipt: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchImportReceipts = createAsyncThunk(
  'importReceipt/fetchImportReceipts',
  async (
    params: {
      code?: string;
      warehouseId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      totalPriceFrom?: number;
      totalPriceTo?: number;
      status?: ReceiptStatus;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await importReceiptService.getImportReceipts(
        params.code,
        params.warehouseId,
        params.dateFrom,
        params.dateTo,
        params.totalPriceFrom,
        params.totalPriceTo,
        params.status,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch import receipts');
    }
  }
);

export const fetchImportReceiptById = createAsyncThunk(
  'importReceipt/fetchImportReceiptById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await importReceiptService.getImportReceiptById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch import receipt');
    }
  }
);

export const createImportReceipt = createAsyncThunk(
  'importReceipt/createImportReceipt',
  async (data: CreateImportReceiptDto, { rejectWithValue }) => {
    try {
      const response = await importReceiptService.createImportReceipt(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create import receipt');
    }
  }
);

// Slice
const importReceiptSlice = createSlice({
  name: 'importReceipt',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentImportReceipt: (state) => {
      state.currentImportReceipt = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch import receipts
    builder
      .addCase(fetchImportReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportReceipts.fulfilled, (state, action: PayloadAction<ImportReceiptTableFilteredAndPaged>) => {
        state.loading = false;
        state.pagedImportReceipts = action.payload;
        state.importReceipts = action.payload.items;
      })
      .addCase(fetchImportReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch import receipt by ID
    builder
      .addCase(fetchImportReceiptById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportReceiptById.fulfilled, (state, action: PayloadAction<ImportReceiptResponse>) => {
        state.loading = false;
        state.currentImportReceipt = action.payload;
      })
      .addCase(fetchImportReceiptById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create import receipt
    builder
      .addCase(createImportReceipt.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createImportReceipt.fulfilled, (state, action: PayloadAction<ImportReceiptResponse>) => {
        state.operationLoading = false;
        state.currentImportReceipt = action.payload;
      })
      .addCase(createImportReceipt.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentImportReceipt,
} = importReceiptSlice.actions;

export default importReceiptSlice.reducer;
