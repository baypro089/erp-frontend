import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roleService } from './role.service';
import type { RoleResponse, CreateRoleDTO, UpdateRoleDTO } from '@libs/shared/types/roles.type';
import type { PermissionResponse } from '@libs/shared/types/permissions.type';

// Async thunks
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (params: { roleCode?: string; roleName?: string } = {}, { rejectWithValue }) => {
    try {
      return await roleService.getRoles(params.roleCode, params.roleName);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleByCode = createAsyncThunk(
  'role/fetchRoleByCode',
  async (code: string, { rejectWithValue }) => {
    try {
      return await roleService.getRoleByCode(code);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role');
    }
  }
);

export const createRole = createAsyncThunk(
  'role/createRole',
  async (data: CreateRoleDTO, { rejectWithValue }) => {
    try {
      return await roleService.createRole(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ code, data }: { code: string; data: UpdateRoleDTO }, { rejectWithValue }) => {
    try {
      return await roleService.updateRole(code, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

export const deleteRoles = createAsyncThunk(
  'role/deleteRoles',
  async (codes: string[], { rejectWithValue }) => {
    try {
      await roleService.deleteRoles(codes);
      return codes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete roles');
    }
  }
);

export const fetchAllPermissions = createAsyncThunk(
  'role/fetchAllPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await roleService.getAllPermissions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

// State interface
interface RoleState {
  roles: RoleResponse[];
  currentRole: RoleResponse | null;
  permissions: PermissionResponse[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: RoleState = {
  roles: [],
  currentRole: null,
  permissions: [],
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch role by code
      .addCase(fetchRoleByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(fetchRoleByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })

      // Update role
      .addCase(updateRole.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.roles.findIndex((r) => r.role_code === action.payload.role_code);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })

      // Delete roles
      .addCase(deleteRoles.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteRoles.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.roles = state.roles.filter((r) => !action.payload.includes(r.role_code));
      })
      .addCase(deleteRoles.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      })

      // Fetch all permissions
      .addCase(fetchAllPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchAllPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
