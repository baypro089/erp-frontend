import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeeService from './employee.service';
import type {
    EmployeeResponse,
    EmployeeTableResponse,
    CreateEmployeeDto,
    UpdateEmployeeDto,
    PagedAndFilteredEmployee,
} from '@libs/shared/types/employees.type';

interface EmployeeState {
    employees: EmployeeTableResponse[];
    deletedEmployees: EmployeeTableResponse[];
    deletedTotalCount: number;
    deletedTotalPages: number;
    currentEmployee: EmployeeResponse | null;
    totalCount: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    operationLoading: boolean;
    operationError: string | null;
    deletedLoading: boolean;
}

const initialState: EmployeeState = {
    employees: [],
    deletedEmployees: [],
    deletedTotalCount: 0,
    deletedTotalPages: 0,
    currentEmployee: null,
    totalCount: 0,
    totalPages: 0,
    loading: false,
    error: null,
    operationLoading: false,
    operationError: null,
    deletedLoading: false,
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
    'employee/fetchEmployees',
    async (_params, { rejectWithValue }) => {
        try {
            const response = await employeeService.getEmployees();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
        }
    }
);

export const fetchEmployeesWithOptional = createAsyncThunk(
    'employee/fetchEmployeesWithOptional',
    async (
        params: {
            employeeCode?: string;
            fullName?: string;
            departmentId?: string;
            positionId?: string;
            startDateFrom?: string;
            startDateTo?: string;
            level?: string;
            status?: string;
            page?: number;
            pageSize?: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await employeeService.getEmployeesWithOptional(
                params.employeeCode,
                params.fullName,
                params.departmentId,
                params.positionId,
                params.startDateFrom,
                params.startDateTo,
                params.level,
                params.status,
                params.page,
                params.pageSize
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
        }
    }
);

export const fetchEmployeeById = createAsyncThunk(
    'employee/fetchEmployeeById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await employeeService.getEmployeeById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
        }
    }
);

export const createEmployee = createAsyncThunk(
    'employee/createEmployee',
    async (data: CreateEmployeeDto, { rejectWithValue }) => {
        try {
            const response = await employeeService.createEmployee(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'employee/updateEmployee',
    async ({ id, data }: { id: string; data: UpdateEmployeeDto }, { rejectWithValue }) => {
        try {
            const response = await employeeService.updateEmployee(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
        }
    }
);

export const deleteEmployees = createAsyncThunk(
    'employee/deleteEmployees',
    async (ids: string[], { rejectWithValue }) => {
        try {
            await employeeService.deleteEmployees(ids);
            return ids;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete employees');
        }
    }
);

export const fetchDeletedEmployees = createAsyncThunk(
    'employee/fetchDeletedEmployees',
    async (
        params: {
            employeeCode?: string;
            fullName?: string;
            departmentId?: string;
            positionId?: string;
            startDateFrom?: string;
            startDateTo?: string;
            level?: string;
            status?: string;
            page?: number;
            pageSize?: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await employeeService.getDeletedEmployees(
                params.employeeCode,
                params.fullName,
                params.departmentId,
                params.positionId,
                params.startDateFrom,
                params.startDateTo,
                params.level,
                params.status,
                params.page,
                params.pageSize
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch deleted employees');
        }
    }
);

// Slice
const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.operationError = null;
        },
        clearCurrentEmployee: (state) => {
            state.currentEmployee = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch employees
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch employees with optional filters
        builder
            .addCase(fetchEmployeesWithOptional.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeesWithOptional.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.items;
                state.totalCount = action.payload.totalCount;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchEmployeesWithOptional.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch employee by ID
        builder
            .addCase(fetchEmployeeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEmployee = action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create employee
        builder
            .addCase(createEmployee.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
            })
            .addCase(createEmployee.fulfilled, (state) => {
                state.operationLoading = false;
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload as string;
            });

        // Update employee
        builder
            .addCase(updateEmployee.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
            })
            .addCase(updateEmployee.fulfilled, (state) => {
                state.operationLoading = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload as string;
            });

        // Delete employees
        builder
            .addCase(deleteEmployees.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
            })
            .addCase(deleteEmployees.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.employees = state.employees.filter((e) => !action.payload.includes(e.id));
            })
            .addCase(deleteEmployees.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload as string;
            });

        // Fetch deleted employees
        builder
            .addCase(fetchDeletedEmployees.pending, (state) => {
                state.deletedLoading = true;
                state.error = null;
            })
            .addCase(fetchDeletedEmployees.fulfilled, (state, action) => {
                state.deletedLoading = false;
                state.deletedEmployees = action.payload.items;
                state.deletedTotalCount = action.payload.totalCount;
                state.deletedTotalPages = action.payload.totalPages;
            })
            .addCase(fetchDeletedEmployees.rejected, (state, action) => {
                state.deletedLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
