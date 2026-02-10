'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import {
  DataTable,
  DeleteConfirmDialog,
  PageHeader,
  FilterBar,
  StatusChip,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import EmployeeFormDialog from '@libs/src/components/employees/EmployeeFormDialog';
import DeletedEmployeesDialog from '@libs/src/components/employees/DeletedEmployeesDialog';
import {
  fetchEmployeesWithOptional,
  createEmployee,
  deleteEmployees,
  clearError,
} from '@libs/src/features/employee/employee.slice';
import { fetchDepartments } from '@libs/src/features/department/department.slice';
import { fetchPositions } from '@libs/src/features/position/position.slice';
import type {
  EmployeeTableResponse,
  CreateEmployeeDto,
} from '@libs/shared/types/employees.type';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';

export default function EmployeesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { employees, currentEmployee, totalCount, totalPages, loading, error, operationLoading, operationError } =
    useSelector((state: RootState) => state.employee);
  const { departments } = useSelector((state: RootState) => state.department);
  const { positions } = useSelector((state: RootState) => state.position);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<EmployeeTableResponse[]>([]);

  // Filter states
  const [searchFullName, setSearchFullName] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data on mount
  useEffect(() => {
    dispatch(fetchDepartments({}));
    dispatch(fetchPositions({}));
  }, [dispatch]);

  // Reload employees when filters or pagination changes
  useEffect(() => {
    const departmentId = filterDepartment
      ? departments.find((d) => d.name === filterDepartment)?.id
      : undefined;
    const positionId = filterPosition
      ? positions.find((p) => p.name === filterPosition)?.id
      : undefined;

    dispatch(
      fetchEmployeesWithOptional({
        fullName: searchFullName || undefined,
        departmentId,
        positionId,
        status: filterStatus || undefined,
        level: filterLevel || undefined,
        page: page + 1, // API uses 1-based pagination
        pageSize: rowsPerPage,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchFullName, filterDepartment, filterPosition, filterStatus, filterLevel, page, rowsPerPage, refreshCounter]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'An error occurred',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Define table columns
  const columns: Column<EmployeeTableResponse>[] = [
    {
      id: 'employeeCode',
      label: 'Employee Code',
      minWidth: 140,
      format: (value) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'fullName',
      label: 'Full Name',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'departmentName',
      label: 'Department',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="primary" />
      ),
    },
    {
      id: 'positionName',
      label: 'Position',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="secondary" />
      ),
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => {
        const statusMap: Record<Status, 'active' | 'inactive' | 'pending' | 'rejected'> = {
          [Status.ACTIVE]: 'active',
          [Status.INACTIVE]: 'inactive',
          [Status.DRAFT]: 'pending',
          [Status.TERMINATED]: 'rejected',
        };
        return <StatusChip status={statusMap[value as Status]} showIcon />;
      },
    },
    {
      id: 'createdAt',
      label: 'Created At',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setOpenForm(true);
  };

  const handleViewDetail = (row: EmployeeTableResponse) => {
    router.push(`/hr/employees/${row.id}`);
  };

  const handleDelete = (row: EmployeeTableResponse) => {
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (data: CreateEmployeeDto) => {
    try {
      await dispatch(createEmployee(data)).unwrap();
      setSnackbar({
        open: true,
        message: 'Employee created successfully',
        severity: 'success',
      });
      setOpenForm(false);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteEmployees(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `${ids.length} employee(s) deleted successfully`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
    setSnackbar({
      open: true,
      message: 'Data refreshed',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchFullName('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterStatus('');
    setFilterLevel('');
    setPage(0);
  };

  const activeFiltersCount =
    (searchFullName ? 1 : 0) +
    (filterDepartment ? 1 : 0) +
    (filterPosition ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (filterLevel ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Employee Management"
        subtitle="Manage company employees and their information"
        breadcrumbs={[
          { label: 'Admin', href: '/' },
          { label: 'Employees', icon: <PeopleIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Refresh',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Deleted Employees',
            onClick: () => setOpenDeletedDialog(true),
            icon: <DeleteSweepIcon />,
            variant: 'outlined',
            color: 'warning',
          },
          {
            label: 'Delete Selected',
            onClick: handleBulkDelete,
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Add Employee',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${totalCount} Total` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'fullName',
            label: 'Employee Name',
            placeholder: 'Search by name...',
            value: searchFullName,
          },
          
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'fullName') setSearchFullName(value);
        }}
        filters={[
          {
            id: 'department',
            label: 'Department',
            type: 'select',
            options: departments.map((d) => ({ value: d.name, label: d.name })),
            value: filterDepartment,
          },
          {
            id: 'position',
            label: 'Position',
            type: 'select',
            options: positions.map((p) => ({ value: p.name, label: p.name })),
            value: filterPosition,
          },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: Status.ACTIVE, label: 'Active' },
              { value: Status.INACTIVE, label: 'Inactive' },
              { value: Status.DRAFT, label: 'Draft' },
              { value: Status.TERMINATED, label: 'Terminated' },
            ],
            value: filterStatus,
          },
          {
            id: 'level',
            label: 'Level',
            type: 'select',
            options: Object.values(Level).map((l) => ({ value: l, label: l })),
            value: filterLevel,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'department') setFilterDepartment(value);
          if (filterId === 'position') setFilterPosition(value);
          if (filterId === 'status') setFilterStatus(value);
          if (filterId === 'level') setFilterLevel(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onView={handleViewDetail}
        onDelete={handleDelete}
        rowKey="id"
        emptyMessage="No employees found"
      />

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        loading={operationLoading}
      />

      {/* Deleted Employees Dialog */}
      <DeletedEmployeesDialog
        open={openDeletedDialog}
        onClose={() => setOpenDeletedDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedRows.length} Employee(s)`}
        message={
          selectedRows.length === 1
            ? `Are you sure you want to delete employee "${selectedRows[0]?.fullName}"?`
            : `Are you sure you want to delete ${selectedRows.length} employees?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && employees.length === 0} message="Loading employees..." />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
