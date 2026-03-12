import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import salesReportService from './sales-report.service';
import type { ICommercialReport, SalesReportFilterDto } from '@libs/shared/types/commercial-report.type';
import { ReportPeriod } from '@libs/shared/enums/report-period.enum';

interface SalesReportState {
  report: ICommercialReport | null;
  loading: boolean;
  error: string | null;
  exportLoading: boolean;
  exportError: string | null;
}

const initialState: SalesReportState = {
  report: null,
  loading: false,
  error: null,
  exportLoading: false,
  exportError: null,
};

// Async thunks
export const fetchProfitReport = createAsyncThunk(
  'salesReport/fetchProfitReport',
  async (filter: SalesReportFilterDto = {}, { rejectWithValue }) => {
    try {
      const response = await salesReportService.getProfitReport(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Lấy báo cáo doanh số thất bại'
      );
    }
  }
);

export const exportSalesReportToExcel = createAsyncThunk(
  'salesReport/exportToExcel',
  async (filter: SalesReportFilterDto = {}, { rejectWithValue }) => {
    try {
      const blob = await salesReportService.exportToExcel(filter);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const periodLabel =
        filter.periodType === ReportPeriod.MONTH
          ? `Thang${filter.month || ''}`
          : filter.periodType === ReportPeriod.QUARTER
          ? `Quy${filter.quarter || ''}`
          : 'Nam';

      const filename = `Bao_Cao_Doanh_So_Loi_Nhuan_${periodLabel}_${filter.year || new Date().getFullYear()}.xlsx`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Xuất báo cáo Excel thất bại'
      );
    }
  }
);

const salesReportSlice = createSlice({
  name: 'salesReport',
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
    // Fetch profit report
    builder
      .addCase(fetchProfitReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitReport.fulfilled, (state, action: PayloadAction<ICommercialReport>) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchProfitReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Export to Excel
    builder
      .addCase(exportSalesReportToExcel.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportSalesReportToExcel.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportSalesReportToExcel.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload as string;
      });
  },
});

export const { clearError, clearReport } = salesReportSlice.actions;
export default salesReportSlice.reducer;
