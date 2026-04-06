// features/auth/auth.slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@libs/src/features/auth/auth.service";

export const login = createAsyncThunk(
    "auth/login",
    async (
        data: { username: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            return await authService.login(data);
        } catch (err: any) {
            const status = err.response?.status;
            const apiMessage = err.response?.data?.message;

            if (status === 401) {
                return rejectWithValue(apiMessage && apiMessage !== 'Unauthorized' ? apiMessage : 'Invalid credentials');
            }

            return rejectWithValue(apiMessage || "Invalid credentials");
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/me",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.me();
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.me();
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
        }
    }
);


interface AuthState {
    user: any | null;
    isAuth: boolean;
    loading: boolean;
    error: string | null;
    authChecked?: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuth: false,
    loading: false,
    error: null,
    authChecked: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuth = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuth = false;
            })

            // CHECK AUTH
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuth = true;
                state.authChecked = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.isAuth = false;
                state.authChecked = true;
            })
            
            // FETCH CURRENT USER
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuth = true;
                state.authChecked = true;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authChecked = true;
            });
    },
});

export default authSlice.reducer;
