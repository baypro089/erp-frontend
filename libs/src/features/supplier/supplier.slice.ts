import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import supplierService from './supplier.service';
import type {
  SupplierResponse,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierListResponse,
} from '@libs/shared/types/supplier.type';

interface SupplierState {
  suppliers: SupplierResponse[];
  pagedSuppliers: SupplierListResponse | null;
  currentSupplier: SupplierResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  pagedSuppliers: null,
  currentSupplier: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'supplier/fetchSuppliers',
  async (
    params: {
      name?: string;
      contactPhone?: string;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await supplierService.getSuppliers(
        params.name,
        params.contactPhone,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'supplier/fetchSupplierById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await supplierService.getSupplierById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'supplier/createSupplier',
  async (data: CreateSupplierDTO, { rejectWithValue }) => {
    try {
      const response = await supplierService.createSupplier(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'supplier/updateSupplier',
  async ({ id, data }: { id: string; data: UpdateSupplierDTO }, { rejectWithValue }) => {
    try {
      const response = await supplierService.updateSupplier(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const deleteSuppliers = createAsyncThunk(
  'supplier/deleteSuppliers',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await supplierService.deleteSuppliers(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete suppliers');
    }
  }
);

// Slice
const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch suppliers
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<SupplierListResponse>) => {
        state.loading = false;
        state.pagedSuppliers = action.payload;
        state.suppliers = action.payload.items;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch supplier by ID
    builder
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<SupplierResponse>) => {
        state.loading = false;
        state.currentSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create supplier
    builder
      .addCase(createSupplier.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<SupplierResponse>) => {
        state.operationLoading = false;
        state.suppliers.unshift(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update supplier
    builder
      .addCase(updateSupplier.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<SupplierResponse>) => {
        state.operationLoading = false;
        const index = state.suppliers.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
        if (state.currentSupplier?.id === action.payload.id) {
          state.currentSupplier = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete suppliers
    builder
      .addCase(deleteSuppliers.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteSuppliers.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.operationLoading = false;
        state.suppliers = state.suppliers.filter((s) => !action.payload.includes(s.id));
      })
      .addCase(deleteSuppliers.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentSupplier } = supplierSlice.actions;
export default supplierSlice.reducer;
