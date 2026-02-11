import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import systemSettingService from './system-setting.service';
import type { SystemSettingResponse, SystemSettingUpdateDto } from '@libs/shared/types/system-setting.type';
import type { SalaryComponentResponse } from '@libs/shared/types/salary-component.type';

interface SystemSettingState {
  settings: SystemSettingResponse[];
  salaryComponents: SalaryComponentResponse[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: SystemSettingState = {
  settings: [],
  salaryComponents: [],
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'systemSetting/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingService.getAllSettings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSetting = createAsyncThunk(
  'systemSetting/updateSetting',
  async ({ key, data }: { key: string; data: SystemSettingUpdateDto }, { rejectWithValue }) => {
    try {
      const response = await systemSettingService.updateSetting(key, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update setting');
    }
  }
);

export const fetchSalaryComponents = createAsyncThunk(
  'systemSetting/fetchSalaryComponents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemSettingService.getAllSalaryComponents();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch salary components');
    }
  }
);

const systemSettingSlice = createSlice({
  name: 'systemSetting',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update setting
      .addCase(updateSetting.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Update the setting in the list
        const index = state.settings.findIndex(s => s.key === action.payload.key);
        if (index !== -1) {
          state.settings[index] = action.payload;
        }
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Fetch salary components
    builder
      .addCase(fetchSalaryComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaryComponents.fulfilled, (state, action) => {
        state.loading = false;
        state.salaryComponents = action.payload;
      })
      .addCase(fetchSalaryComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = systemSettingSlice.actions;
export default systemSettingSlice.reducer;
