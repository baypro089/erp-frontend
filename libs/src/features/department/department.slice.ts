import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import departmentService from './department.service';
import type {
  DepartmentResponse,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@libs/shared/types/departments.type';

interface DepartmentState {
  departments: DepartmentResponse[];
  currentDepartment: DepartmentResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  currentDepartment: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'department/fetchDepartments',
  async (params: { name?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await departmentService.getDepartments(params.name);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'department/fetchDepartmentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await departmentService.getDepartmentById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'department/createDepartment',
  async (data: CreateDepartmentDTO, { rejectWithValue }) => {
    try {
      const response = await departmentService.createDepartment(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create department');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'department/updateDepartment',
  async ({ id, data }: { id: string; data: UpdateDepartmentDTO }, { rejectWithValue }) => {
    try {
      const response = await departmentService.updateDepartment(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update department');
    }
  }
);

export const deleteDepartments = createAsyncThunk(
  'department/deleteDepartments',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await departmentService.deleteDepartments(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete departments');
    }
  }
);

// Slice
const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch department by ID
    builder
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create department
    builder
      .addCase(createDepartment.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update department
    builder
      .addCase(updateDepartment.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.departments.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete departments
    builder
      .addCase(deleteDepartments.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteDepartments.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.departments = state.departments.filter((d) => !action.payload.includes(d.id));
      })
      .addCase(deleteDepartments.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
