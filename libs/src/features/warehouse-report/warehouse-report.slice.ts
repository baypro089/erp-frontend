import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import warehouseReportService from './warehouse-report.service';
import type { IWarehouseReport, WarehouseReportFilterDto } from '@libs/shared/types/warehouse-report.type';

interface WarehouseReportState {
  report: IWarehouseReport | null;
  loading: boolean;
  error: string | null;
  exportLoading: boolean;
  exportError: string | null;
}

const initialState: WarehouseReportState = {
  report: null,
  loading: false,
  error: null,
  exportLoading: false,
  exportError: null,
};

// Async thunks
export const fetchProductStatistics = createAsyncThunk(
  'warehouseReport/fetchProductStatistics',
  async (filter: WarehouseReportFilterDto = {}, { rejectWithValue }) => {
    try {
      const response = await warehouseReportService.getProductStatistics(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse report');
    }
  }
);

export const exportReportToExcel = createAsyncThunk(
  'warehouseReport/exportToExcel',
  async (filter: WarehouseReportFilterDto = {}, { rejectWithValue }) => {
    try {
      const blob = await warehouseReportService.exportToExcel(filter);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `Bao_Cao_Xuat_Nhap_Ton_${filter.month || 'All'}_${filter.year || new Date().getFullYear()}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);

const warehouseReportSlice = createSlice({
  name: 'warehouseReport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.exportError = null;
    },
    clearReport: (state) => {
      state.report = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch product statistics
    builder
      .addCase(fetchProductStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStatistics.fulfilled, (state, action: PayloadAction<IWarehouseReport>) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchProductStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Export to Excel
    builder
      .addCase(exportReportToExcel.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportReportToExcel.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportReportToExcel.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload as string;
      });
  },
});

export const { clearError, clearReport } = warehouseReportSlice.actions;
export default warehouseReportSlice.reducer;
