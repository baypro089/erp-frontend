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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as SupplierIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import SupplierFormDialog from '@libs/src/components/suppliers/SupplierFormDialog';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSuppliers,
  clearError,
} from '@libs/src/features/supplier/supplier.slice';
import type {
  SupplierResponse,
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from '@libs/shared/types/supplier.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SuppliersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, pagedSuppliers, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.supplier
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<SupplierResponse[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
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
    dispatch(fetchSuppliers({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Có lỗi xảy ra',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Toggle status
  const handleStatusToggle = async (supplier: SupplierResponse) => {
    try {
      await dispatch(
        updateSupplier({
          id: supplier.id,
          data: { isActive: !supplier.isActive },
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: `Đã ${!supplier.isActive ? 'kích hoạt' : 'tắt'} nhà cung cấp`,
        severity: 'success',
      });
      dispatch(fetchSuppliers({ page: 1, pageSize: 100 }));
    } catch (err) {
      // Error handled by useEffect
    }
  };

  // Table columns
  const columns: Column<SupplierResponse>[] = [
    {
      id: 'name',
      label: 'Tên nhà cung cấp',
      minWidth: 200,
      format: (value, row: SupplierResponse) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'contactPhone',
      label: 'Số điện thoại',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'address',
      label: 'Địa chỉ',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {value}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 120,
      align: 'center',
      format: (value) => {
        if (!value) return '--';
        return (
          <Typography variant="caption" color="text.secondary">
            {format(new Date(value), 'dd/MM/yyyy', { locale: vi })}
          </Typography>
        );
      },
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 150,
      align: 'center',
      format: (value, row: SupplierResponse) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Switch
            checked={row.isActive}
            onChange={() => handleStatusToggle(row)}
            color="success"
            size="small"
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: row.isActive ? 'success.main' : 'text.secondary',
            }}
          >
            {row.isActive ? 'Hoạt động' : 'Ngừng'}
          </Typography>
        </Box>
      ),
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedSupplier(null);
    setOpenForm(true);
  };

  const handleEdit = (row: SupplierResponse) => {
    setSelectedSupplier(row);
    setOpenForm(true);
  };

  const handleDelete = (row: SupplierResponse) => {
    setSelectedSupplier(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleFormSubmit = async (
    data: CreateSupplierDTO | UpdateSupplierDTO,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedSupplier) {
        // Update
        await dispatch(
          updateSupplier({ id: selectedSupplier.id, data: data as UpdateSupplierDTO })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật nhà cung cấp thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createSupplier(data as CreateSupplierDTO)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo nhà cung cấp thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchSuppliers({ page: 1, pageSize: 100 }));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteSuppliers(ids)).unwrap();
      setSnackbar({
        open: true,
        message: 'Xóa nhà cung cấp thành công',
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchSuppliers({ page: 1, pageSize: 100 }));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = () => {
    dispatch(fetchSuppliers({ page: 1, pageSize: 100 }));
    setSnackbar({
      open: true,
      message: 'Đã làm mới dữ liệu',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
  };

  // Filter data
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchSearch =
      searchQuery === '' ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPhone.includes(searchQuery);

    const matchStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && supplier.isActive) ||
      (filterStatus === 'inactive' && !supplier.isActive);

    return matchSearch && matchStatus;
  });

  const activeFiltersCount = (searchQuery ? 1 : 0) + (filterStatus ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Nhà Cung Cấp"
        subtitle="Quản lý thông tin nhà cung cấp và đối tác"
        breadcrumbs={[
          { label: 'Commercial', href: '/commercial' },
          { label: 'Nhà cung cấp', icon: <SupplierIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Thêm NCC',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
            color: 'primary',
          },
        ]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'search',
            label: 'Tìm kiếm',
            placeholder: 'Tìm theo tên hoặc số điện thoại...',
            value: searchQuery,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'search') setSearchQuery(value);
        }}
        filters={[
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { value: '', label: 'Tất cả' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Ngừng hoạt động' },
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

      {/* Summary */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<SupplierIcon />}
          label={`Tổng: ${suppliers.length}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Hoạt động: ${suppliers.filter((s) => s.isActive).length}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`Ngừng: ${suppliers.filter((s) => !s.isActive).length}`}
          color="default"
          variant="outlined"
        />
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredSuppliers.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        rowKey="id"
        loading={loading}
        emptyMessage="Chưa có nhà cung cấp nào"
      />

      {/* Form Dialog */}
      <SupplierFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedSupplier={selectedSupplier}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa{' '}
            {selectedRows.length > 1
              ? `${selectedRows.length} nhà cung cấp`
              : `nhà cung cấp "${selectedSupplier?.name}"`}
            ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Hành động này không thể hoàn tác!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} disabled={operationLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && suppliers.length === 0} message="Đang tải dữ liệu..." />
    </Box>
  );
}
