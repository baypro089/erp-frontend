import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseService from './warehouse.service';
import type {
  WarehouseResponse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@libs/shared/types/warehouse.type';

interface WarehouseState {
  warehouses: WarehouseResponse[];
  currentWarehouse: WarehouseResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  currentWarehouse: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getWarehouses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'warehouse/fetchWarehouseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getWarehouseById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (data: CreateWarehouseDto, { rejectWithValue }) => {
    try {
      const response = await warehouseService.createWarehouse(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, data }: { id: string; data: UpdateWarehouseDto }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.updateWarehouse(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const deleteWarehouses = createAsyncThunk(
  'warehouse/deleteWarehouses',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await warehouseService.deleteWarehouses(ids);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouses');
    }
  }
);

// Slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch warehouses
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch warehouse by ID
    builder
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWarehouse = action.payload;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create warehouse
    builder
      .addCase(createWarehouse.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.warehouses.push(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update warehouse
    builder
      .addCase(updateWarehouse.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.warehouses.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete warehouses
    builder
      .addCase(deleteWarehouses.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteWarehouses.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Update warehouses with modified data (status changed)
        action.payload.forEach((updatedWarehouse) => {
          const index = state.warehouses.findIndex((w) => w.id === updatedWarehouse.id);
          if (index !== -1) {
            state.warehouses[index] = updatedWarehouse;
          }
        });
      })
      .addCase(deleteWarehouses.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentWarehouse } = warehouseSlice.actions;
export default warehouseSlice.reducer;
