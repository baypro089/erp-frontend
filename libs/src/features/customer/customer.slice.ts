import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import customerService from './customer.service';
import type {
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerListResponse,
} from '@libs/shared/types/customer.type';
import { CustomerTier } from '@libs/shared/enums/customer-tier.enum';

interface CustomerState {
  customers: CustomerResponse[];
  pagedCustomers: CustomerListResponse | null;
  currentCustomer: CustomerResponse | null;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: CustomerState = {
  customers: [],
  pagedCustomers: null,
  currentCustomer: null,
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (
    params: {
      fullName?: string;
      phoneNumber?: string;
      tier?: CustomerTier;
      isActive?: boolean;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await customerService.getCustomers(
        params.fullName,
        params.phoneNumber,
        params.tier,
        params.isActive,
        params.page,
        params.pageSize
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customer/fetchCustomerById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const fetchCustomerByPhone = createAsyncThunk(
  'customer/fetchCustomerByPhone',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerByPhone(phone);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer by phone');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (data: CreateCustomerDto, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ id, data }: { id: string; data: UpdateCustomerDto }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomers = createAsyncThunk(
  'customer/deleteCustomers',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await customerService.deleteCustomers(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customers');
    }
  }
);

// Slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomerListResponse>) => {
        state.loading = false;
        state.pagedCustomers = action.payload;
        // Convert CustomerTableResponse to CustomerResponse for compatibility
        state.customers = action.payload.items.map(item => ({
          ...item,
          address: '',
          tier: item.tier,
          totalSpent: item.totalSpent,
          rewardPoints: 0,
          note: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch customer by ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch customer by phone
    builder
      .addCase(fetchCustomerByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerByPhone.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerByPhone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.operationLoading = false;
        state.customers.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.operationLoading = false;
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?.id === action.payload.id) {
          state.currentCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete customers
    builder
      .addCase(deleteCustomers.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(deleteCustomers.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.operationLoading = false;
        state.customers = state.customers.filter((c) => !action.payload.includes(c.id));
      })
      .addCase(deleteCustomers.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCustomer } = customerSlice.actions;
export default customerSlice.reducer;
