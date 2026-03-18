'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  DataTable,
  DeleteConfirmDialog,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
  PermissionDeniedDialog,
  PermissionGuard,
} from '@libs/src/components/common';
import { usePermissionGuard } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import DepartmentFormDialog from '@libs/src/components/departments/DepartmentFormDialog';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartments,
  clearError,
} from '@libs/src/features/department/department.slice';
import type {
  DepartmentResponse,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
} from '@libs/shared/types/departments.type';
import { CacheService } from '@libs/src/services/cache.service';

export default function DepartmentsPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.DEPARTMENT.VIEW}
      fallbackPath="/admin"
    >
      <DepartmentsPageContent />
    </PermissionGuard>
  );
}

function DepartmentsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { departments, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.department
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<DepartmentResponse[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState('');

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
    dispatch(fetchDepartments({}));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Define table columns
  const columns: Column<DepartmentResponse>[] = [
    {
      id: 'name',
      label: 'Tên phòng ban',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'totalEmployees',
      label: 'Tổng nhân viên',
      minWidth: 150,
      align: 'center',
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 180,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      id: 'updatedAt',
      label: 'Cập nhật lúc',
      minWidth: 180,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedDepartment(null);
    setOpenForm(true);
  };

  const handleEdit = (row: DepartmentResponse) => {
    setSelectedDepartment(row);
    setOpenForm(true);
  };

  const handleDelete = (row: DepartmentResponse) => {
    setSelectedDepartment(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (
    data: CreateDepartmentDTO | UpdateDepartmentDTO,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedDepartment) {
        // Update
        await dispatch(updateDepartment({ id: selectedDepartment.id, data: data as UpdateDepartmentDTO })).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật phòng ban thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createDepartment(data as CreateDepartmentDTO)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo phòng ban thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchDepartments({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteDepartments(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `Đã xóa thành công ${ids.length} phòng ban`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchDepartments({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchDepartments({}));
    setSnackbar({
      open: true,
      message: 'Dữ liệu đã được làm mới',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchName('');
  };

  // Filter data
  const filteredDepartments = departments.filter((dept) => {
    const matchName =
      searchName === '' || dept.name.toLowerCase().includes(searchName.toLowerCase());
    return matchName;
  });

  const activeFiltersCount = searchName ? 1 : 0;

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý phòng ban"
        subtitle="Quản lý phòng ban và cơ cấu tổ chức công ty"
        breadcrumbs={[
          { label: 'Phòng ban', icon: <BusinessIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Xóa mục đã chọn',
            onClick: guardAction(PERMISSIONS.DEPARTMENT.DELETE, handleBulkDelete),
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Thêm phòng ban',
            onClick: guardAction(PERMISSIONS.DEPARTMENT.CREATE, handleAdd),
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredDepartments.length} Tổng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'name',
            label: 'Tên phòng ban',
            placeholder: 'Tìm theo tên phòng ban...',
            value: searchName,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'name') setSearchName(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredDepartments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredDepartments.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={guardFn(PERMISSIONS.DEPARTMENT.UPDATE, handleEdit)}
        onDelete={guardFn(PERMISSIONS.DEPARTMENT.DELETE, handleDelete)}
        rowKey="id"
        emptyMessage="Không tìm thấy phòng ban nào"
      />

      {/* Department Form Dialog */}
      <DepartmentFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedDepartment={selectedDepartment}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Xóa ${selectedRows.length} phòng ban`}
        message={
          selectedRows.length === 1
            ? `Bạn có chắc chắn muốn xóa phòng ban "${selectedRows[0]?.name}"?`
            : `Bạn có chắc chắn muốn xóa ${selectedRows.length} phòng ban?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && departments.length === 0} message="Đang tải danh sách phòng ban..." />

      <PermissionDeniedDialog {...permissionDialogProps} />

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
