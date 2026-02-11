import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import payslipService from './payslip.service';
import type {
  PayslipResponse,
  PagedAndFilteredPayslip,
  PayrollGenerationResult,
  PaySlipTableResponse,
} from '@libs/shared/types/payslips.type';

interface PayslipState {
  payslips: PaySlipTableResponse[];
  currentPayslip: PayslipResponse | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
  generationResult: PayrollGenerationResult | null;
}

const initialState: PayslipState = {
  payslips: [],
  currentPayslip: null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
  generationResult: null,
};

// Async thunks
export const generatePayroll = createAsyncThunk(
  'payslip/generatePayroll',
  async ({ month, year }: { month: number; year: number }, { rejectWithValue }) => {
    try {
      const response = await payslipService.generatePayroll(month, year);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate payroll');
    }
  }
);

export const fetchPayslips = createAsyncThunk(
  'payslip/fetchPayslips',
  async (
    params: {
      month?: number;
      year?: number;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await payslipService.getPayslips(
        params.month,
        params.year,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payslips');
    }
  }
);

export const fetchMyPayslips = createAsyncThunk(
  'payslip/fetchMyPayslips',
  async (
    params: {
      employeeId: string;
      month?: number;
      year?: number;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await payslipService.getMyPayslips(
        params.employeeId,
        params.month,
        params.year,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my payslips');
    }
  }
);

export const markPayslipAsPaid = createAsyncThunk(
  'payslip/markPayslipAsPaid',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await payslipService.markPayslipAsPaid(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark payslip as paid');
    }
  }
);

export const getPayslipById = createAsyncThunk(
  'payslip/getPayslipById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await payslipService.getPayslipById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get payslip by id');
    }
  }
);

// Slice
const payslipSlice = createSlice({
  name: 'payslip',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentPayslip: (state) => {
      state.currentPayslip = null;
    },
    clearGenerationResult: (state) => {
      state.generationResult = null;
    },
  },
  extraReducers: (builder) => {
    // Generate payroll
    builder
      .addCase(generatePayroll.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.generationResult = null;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.generationResult = action.payload;
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Fetch payslips
    builder
      .addCase(fetchPayslips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        state.loading = false;
        state.payslips = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchPayslips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch my payslips
    builder
      .addCase(fetchMyPayslips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayslips.fulfilled, (state, action) => {
        state.loading = false;
        state.payslips = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchMyPayslips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Mark payslip as paid
    builder
      .addCase(markPayslipAsPaid.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(markPayslipAsPaid.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Update payslip in the list
        const index = state.payslips.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payslips[index] = action.payload;
        }
        // Update current payslip if it matches
        if (state.currentPayslip?.id === action.payload.id) {
          state.currentPayslip = action.payload;
        }
      })
      .addCase(markPayslipAsPaid.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Get payslip by id
    builder
      .addCase(getPayslipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayslipById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayslip = action.payload;
      })
      .addCase(getPayslipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPayslip, clearGenerationResult } = payslipSlice.actions;
export default payslipSlice.reducer;
