import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from './category.service';
import type {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  PagedAndFilteredCategory,
} from '@libs/shared/types/category.type';

interface CategoryState {
  categories: CategoryResponse[];
  pagedCategories: PagedAndFilteredCategory | null;
  currentCategory: CategoryResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: CategoryState = {
  categories: [],
  pagedCategories: null,
  currentCategory: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params: { name?: string; page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(params.name, params.page, params.pageSize);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (data: CreateCategoryDto, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, data }: { id: string; data: UpdateCategoryDto }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategories = createAsyncThunk(
  'category/deleteCategories',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await categoryService.deleteCategories(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete categories');
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.pagedCategories = action.payload;
        state.categories = action.payload.items;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete categories
    builder
      .addCase(deleteCategories.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteCategories.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.categories = state.categories.filter((cat) => !action.payload.includes(cat.id));
      })
      .addCase(deleteCategories.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
