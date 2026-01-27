import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import positionService from './position.service';
import type {
  PositionResponse,
  CreatePositionDTO,
  UpdatePositionDTO,
} from '@libs/shared/types/positions.type';

interface PositionState {
  positions: PositionResponse[];
  currentPosition: PositionResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: PositionState = {
  positions: [],
  currentPosition: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchPositions = createAsyncThunk(
  'position/fetchPositions',
  async (params: { name?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await positionService.getPositions(params.name);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch positions');
    }
  }
);

export const fetchPositionById = createAsyncThunk(
  'position/fetchPositionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await positionService.getPositionById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch position');
    }
  }
);

export const createPosition = createAsyncThunk(
  'position/createPosition',
  async (data: CreatePositionDTO, { rejectWithValue }) => {
    try {
      const response = await positionService.createPosition(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create position');
    }
  }
);

export const updatePosition = createAsyncThunk(
  'position/updatePosition',
  async ({ id, data }: { id: string; data: UpdatePositionDTO }, { rejectWithValue }) => {
    try {
      const response = await positionService.updatePosition(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update position');
    }
  }
);

export const deletePositions = createAsyncThunk(
  'position/deletePositions',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await positionService.deletePositions(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete positions');
    }
  }
);

// Slice
const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentPosition: (state) => {
      state.currentPosition = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch positions
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch position by ID
    builder
      .addCase(fetchPositionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPosition = action.payload;
      })
      .addCase(fetchPositionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create position
    builder
      .addCase(createPosition.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.positions.push(action.payload);
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update position
    builder
      .addCase(updatePosition.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.positions.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete positions
    builder
      .addCase(deletePositions.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deletePositions.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.positions = state.positions.filter((p) => !action.payload.includes(p.id));
      })
      .addCase(deletePositions.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPosition } = positionSlice.actions;
export default positionSlice.reducer;
