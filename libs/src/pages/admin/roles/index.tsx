'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Chip,
  Typography,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
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
import RoleFormDialog from '@libs/src/components/roles/RoleFormDialog';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRoles,
  fetchAllPermissions,
  clearError,
} from '@libs/src/features/role/role.slice';
import type { RoleResponse, CreateRoleDTO, UpdateRoleDTO } from '@libs/shared/types/roles.type';
import { PORTAL_PERMISSION_VALUES } from '@libs/shared/constants/portal-permissions.constant';

export default function RolesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, permissions, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.role
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<RoleResponse[]>([]);

  // Filter states
  const [searchRoleCode, setSearchRoleCode] = useState('');
  const [searchRoleName, setSearchRoleName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data on mount
  useEffect(() => {
    dispatch(fetchRoles({}));
    dispatch(fetchAllPermissions());
  }, [dispatch]);

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
  const columns: Column<RoleResponse>[] = [
    { 
      id: 'role_code', 
      label: 'Role Code', 
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    { id: 'role_name', label: 'Role Name', minWidth: 200 },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <StatusChip status={value ? 'active' : 'inactive'} showIcon />
      ),
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedRole(null);
    setOpenForm(true);
  };

  const handleEdit = (row: RoleResponse) => {
    setSelectedRole(row);
    setOpenForm(true);
  };

  const handleDelete = (row: RoleResponse) => {
    setSelectedRole(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (data: CreateRoleDTO | UpdateRoleDTO, isEdit: boolean) => {
    try {
      if (isEdit && selectedRole) {
        // Update
        await dispatch(updateRole({ code: selectedRole.role_code, data: data as UpdateRoleDTO })).unwrap();
        setSnackbar({
          open: true,
          message: 'Role updated successfully',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createRole(data as CreateRoleDTO)).unwrap();
        setSnackbar({
          open: true,
          message: 'Role created successfully',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchRoles({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const codes = selectedRows.map((r) => r.role_code);
      await dispatch(deleteRoles(codes)).unwrap();
      setSnackbar({
        open: true,
        message: `${codes.length} role(s) deleted successfully`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchRoles({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = () => {
    dispatch(fetchRoles({}));
    dispatch(fetchAllPermissions());
    setSnackbar({
      open: true,
      message: 'Data refreshed',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchRoleCode('');
    setSearchRoleName('');
    setFilterStatus('');
  };

  // Filter data
  const filteredRoles = roles.filter((role) => {
    const matchRoleCode =
      searchRoleCode === '' ||
      role.role_code.toLowerCase().includes(searchRoleCode.toLowerCase());
    const matchRoleName =
      searchRoleName === '' ||
      role.role_name.toLowerCase().includes(searchRoleName.toLowerCase());
    const matchStatus =
      filterStatus === '' || role.is_active.toString() === filterStatus;
    return matchRoleCode && matchRoleName && matchStatus;
  });

  const activeFiltersCount = 
    (searchRoleCode ? 1 : 0) + 
    (searchRoleName ? 1 : 0) + 
    (filterStatus ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Role Management"
        subtitle="Manage system roles and permissions"
        breadcrumbs={[
          { label: 'Roles', icon: <SecurityIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Refresh',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
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
            label: 'Add Role',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredRoles.length} Total` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'roleCode',
            label: 'Role Code',
            placeholder: 'Search by role code...',
            value: searchRoleCode,
          },
          {
            id: 'roleName',
            label: 'Role Name',
            placeholder: 'Search by role name...',
            value: searchRoleName,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'roleCode') setSearchRoleCode(value);
          if (fieldId === 'roleName') setSearchRoleName(value);
        }}
        filters={[
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ],
            value: filterStatus,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />


      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredRoles.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="role_code"
        emptyMessage="No roles found"
      />

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedRole={selectedRole}
        permissions={permissions}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedRows.length} Role(s)`}
        message={
          selectedRows.length === 1
            ? `Are you sure you want to delete role "${selectedRows[0]?.role_name}"?`
            : `Are you sure you want to delete ${selectedRows.length} roles?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && roles.length === 0} message="Loading roles..." />

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
