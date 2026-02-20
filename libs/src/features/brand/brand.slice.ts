import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import brandService from './brand.service';
import type {
  BrandResponse,
  CreateBrandDto,
  UpdateBrandDto,
  PagedAndFilteredBrand,
} from '@libs/shared/types/brand.type';

interface BrandState {
  brands: BrandResponse[];
  pagedBrands: PagedAndFilteredBrand | null;
  currentBrand: BrandResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: BrandState = {
  brands: [],
  pagedBrands: null,
  currentBrand: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchBrands = createAsyncThunk(
  'brand/fetchBrands',
  async (params: { name?: string; page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrands(params.name, params.page, params.pageSize);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

export const fetchBrandById = createAsyncThunk(
  'brand/fetchBrandById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrandById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brand');
    }
  }
);

export const createBrand = createAsyncThunk(
  'brand/createBrand',
  async (data: CreateBrandDto, { rejectWithValue }) => {
    try {
      const response = await brandService.createBrand(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create brand');
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brand/updateBrand',
  async ({ id, data }: { id: string; data: UpdateBrandDto }, { rejectWithValue }) => {
    try {
      const response = await brandService.updateBrand(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update brand');
    }
  }
);

export const deleteBrands = createAsyncThunk(
  'brand/deleteBrands',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await brandService.deleteBrands(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete brands');
    }
  }
);

// Slice
const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.pagedBrands = action.payload;
        state.brands = action.payload.items;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch brand by ID
    builder
      .addCase(fetchBrandById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBrand = action.payload;
      })
      .addCase(fetchBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create brand
    builder
      .addCase(createBrand.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.brands.push(action.payload);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update brand
    builder
      .addCase(updateBrand.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.brands.findIndex((brand) => brand.id === action.payload.id);
        if (index !== -1) {
          state.brands[index] = action.payload;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete brands
    builder
      .addCase(deleteBrands.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteBrands.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.brands = state.brands.filter((brand) => !action.payload.includes(brand.id));
      })
      .addCase(deleteBrands.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentBrand } = brandSlice.actions;
export default brandSlice.reducer;
