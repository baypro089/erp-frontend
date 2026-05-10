import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from './user.service';
import type { UserResponse, UserFilterAndPaged, CreateUserDto, UpdateUserDto } from '@libs/shared/types/users.type';

interface UserState {
  users: UserResponse[];
  currentUser: UserResponse | null;
  editingUser: UserResponse | null;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  editingUser: null,
  totalCount: 0,
  totalPages: 0,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_params, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUsersWithOptional = createAsyncThunk(
  'user/fetchUsersWithOptional',
  async (
    params: {
      userId?: string;
      username?: string;
      email?: string;
      roleId?: string;
      employeeName?: string;
      createDateFrom?: string;
      createDateTo?: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.getUsersWithOptional(
        params.userId,
        params.username,
        params.email,
        params.roleId,
        params.employeeName,
        params.createDateFrom,
        params.createDateTo,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const fetchCurrentUserById = createAsyncThunk(
  'user/fetchCurrentUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: CreateUserDto, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserDto }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const banUser = createAsyncThunk(
  'user/banUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.banUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to ban user');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearEditingUser: (state) => {
      state.editingUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch users with optional filters
    builder
      .addCase(fetchUsersWithOptional.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersWithOptional.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items || [];
        state.totalCount = action.payload.totalCount || 0;
        state.totalPages = action.payload.totalPages || 0;
      })
      .addCase(fetchUsersWithOptional.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.users = [];
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.editingUser = action.payload; // Now properly unwrapped in service
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch current user by ID
    builder
      .addCase(fetchCurrentUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload; // Now properly unwrapped in service
      })
      .addCase(fetchCurrentUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Ban user
    builder
      .addCase(banUser.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(banUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentUser, clearEditingUser } = userSlice.actions;
export default userSlice.reducer;
