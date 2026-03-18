'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
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
import PositionFormDialog from '@libs/src/components/positions/PositionFormDialog';
import {
  fetchPositions,
  createPosition,
  updatePosition,
  deletePositions,
  clearError,
} from '@libs/src/features/position/position.slice';
import type {
  PositionResponse,
  CreatePositionDTO,
  UpdatePositionDTO,
} from '@libs/shared/types/positions.type';
import { CacheService } from '@libs/src/services/cache.service';

export default function PositionsPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.POSITION.VIEW}
      fallbackPath="/admin"
    >
      <PositionsPageContent />
    </PermissionGuard>
  );
}

function PositionsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { positions, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.position
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<PositionResponse[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [filterMinSalary, setFilterMinSalary] = useState('');
  const [filterMaxSalary, setFilterMaxSalary] = useState('');

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
    dispatch(fetchPositions({}));
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
  const columns: Column<PositionResponse>[] = [
    {
      id: 'name',
      label: 'Tên chức vụ',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'baseSalary',
      label: 'Lương cơ bản',
      minWidth: 150,
      align: 'left',
      format: (value) => (
        <Chip
          label={`${Number(value).toLocaleString('vi-VN')} đ`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
        />
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
    setSelectedPosition(null);
    setOpenForm(true);
  };

  const handleEdit = (row: PositionResponse) => {
    setSelectedPosition(row);
    setOpenForm(true);
  };

  const handleDelete = (row: PositionResponse) => {
    setSelectedPosition(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (
    data: CreatePositionDTO | UpdatePositionDTO,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedPosition) {
        // Update
        await dispatch(updatePosition({ id: selectedPosition.id, data: data as UpdatePositionDTO })).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật chức vụ thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createPosition(data as CreatePositionDTO)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo chức vụ thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchPositions({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deletePositions(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `Đã xóa thành công ${ids.length} chức vụ`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchPositions({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchPositions({}));
    setSnackbar({
      open: true,
      message: 'Dữ liệu đã được làm mới',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchName('');
    setFilterMinSalary('');
    setFilterMaxSalary('');
  };

  // Filter data
  const filteredPositions = positions.filter((pos) => {
    const matchName =
      searchName === '' || pos.name.toLowerCase().includes(searchName.toLowerCase());
    
    const minSal = filterMinSalary ? Number(filterMinSalary) : 0;
    const maxSal = filterMaxSalary ? Number(filterMaxSalary) : Infinity;
    const matchSalary = pos.baseSalary >= minSal && pos.baseSalary <= maxSal;
    
    return matchName && matchSalary;
  });

  const activeFiltersCount = 
    (searchName ? 1 : 0) + 
    (filterMinSalary ? 1 : 0) + 
    (filterMaxSalary ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý chức vụ"
        subtitle="Quản lý chức danh và mức lương cơ bản"
        breadcrumbs={[
          { label: 'Chức vụ', icon: <WorkIcon fontSize="small" /> },
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
            onClick: guardAction(PERMISSIONS.POSITION.DELETE, handleBulkDelete),
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Thêm chức vụ',
            onClick: guardAction(PERMISSIONS.POSITION.CREATE, handleAdd),
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredPositions.length} Tổng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'name',
            label: 'Tên chức vụ',
            placeholder: 'Tìm theo tên chức vụ...',
            value: searchName,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'name') setSearchName(value);
        }}
        filters={[
          {
            id: 'minSalary',
            label: 'Lương tối thiểu',
            type: 'text',
            placeholder: 'Ví dụ: 5000000',
            value: filterMinSalary,
          },
          {
            id: 'maxSalary',
            label: 'Lương tối đa',
            type: 'text',
            placeholder: 'Ví dụ: 30000000',
            value: filterMaxSalary,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'minSalary') setFilterMinSalary(value);
          if (filterId === 'maxSalary') setFilterMaxSalary(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPositions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredPositions.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={guardFn(PERMISSIONS.POSITION.UPDATE, handleEdit)}
        onDelete={guardFn(PERMISSIONS.POSITION.DELETE, handleDelete)}
        rowKey="id"
        emptyMessage="Không tìm thấy chức vụ nào"
      />

      {/* Position Form Dialog */}
      <PositionFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedPosition={selectedPosition}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Xóa ${selectedRows.length} chức vụ`}
        message={
          selectedRows.length === 1
            ? `Bạn có chắc chắn muốn xóa chức vụ "${selectedRows[0]?.name}"?`
            : `Bạn có chắc chắn muốn xóa ${selectedRows.length} chức vụ?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && positions.length === 0} message="Đang tải danh sách chức vụ..." />

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
