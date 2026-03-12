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
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Warehouse as WarehouseIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
  PermissionGuard,
} from '@libs/src/components/common';
import WarehouseFormDialog from '@libs/src/components/warehouses/WarehouseFormDialog';
import {
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouses,
  clearError,
} from '@libs/src/features/warehouse/warehouse.slice';
import type {
  WarehouseResponse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@libs/shared/types/warehouse.type';
import { WarehouseType } from '@libs/shared/enums/warehouse-type.enum';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function WarehousesPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.WAREHOUSE.VIEW}
      fallbackPath="/commercial"
    >
      <WarehousesPageContent />
    </PermissionGuard>
  );
}

function WarehousesPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { warehouses, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.warehouse
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<WarehouseResponse[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
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
    dispatch(fetchWarehouses());
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

  // Warehouse type badge color helper
  const getWarehouseTypeBadge = (type: WarehouseType) => {
    switch (type) {
      case WarehouseType.CENTRAL:
        return (
          <Chip
            label="Kho tổng"
            size="small"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              fontWeight: 600,
            }}
          />
        );
      case WarehouseType.STORE:
        return (
          <Chip
            label="Cửa hàng"
            size="small"
            sx={{
              backgroundColor: '#2e7d32',
              color: 'white',
              fontWeight: 600,
            }}
          />
        );
      case WarehouseType.DAMAGED:
        return (
          <Chip
            label="Kho hủy"
            size="small"
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              fontWeight: 600,
            }}
          />
        );
      default:
        return <Chip label={type} size="small" />;
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (warehouse: WarehouseResponse) => {
    try {
      await dispatch(
        updateWarehouse({
          id: warehouse.id,
          data: { isActive: !warehouse.isActive },
        })
      ).unwrap();
      
      setSnackbar({
        open: true,
        message: `Kho "${warehouse.name}" đã ${!warehouse.isActive ? 'kích hoạt' : 'ngừng hoạt động'}`,
        severity: 'success',
      });
      
      dispatch(fetchWarehouses());
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  // Define table columns
  const columns: Column<WarehouseResponse>[] = [
    {
      id: 'code',
      label: 'Mã',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Tên',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Loại',
      minWidth: 130,
      align: 'center',
      format: (value) => getWarehouseTypeBadge(value as WarehouseType),
    },
    {
      id: 'manager',
      label: 'Quản lý',
      minWidth: 180,
      format: (value, row: WarehouseResponse) => {
        if (!row.manager) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Chưa có
            </Typography>
          );
        }
        return (
          <Tooltip 
            title={`Mã NV: ${row.manager.employeeCode}${row.manager.phone ? ` - SĐT: ${row.manager.phone}` : ''}`} 
            arrow
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                }}
              >
                {row.manager.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={500}>
                {row.manager.fullName}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 150,
      align: 'center',
      format: (value, row: WarehouseResponse) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Switch
            checked={row.isActive}
            onChange={() => guardFn<WarehouseResponse>(PERMISSIONS.WAREHOUSE.UPDATE, handleStatusToggle)(row)}
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
  const handleAdd = guardAction(PERMISSIONS.WAREHOUSE.CREATE, () => {
    setSelectedWarehouse(null);
    setOpenForm(true);
  });

  const handleEdit = guardFn<WarehouseResponse>(PERMISSIONS.WAREHOUSE.UPDATE, (row: WarehouseResponse) => {
    setSelectedWarehouse(row);
    setOpenForm(true);
  });

  const handleDelete = guardFn<WarehouseResponse>(PERMISSIONS.WAREHOUSE.DELETE, (row: WarehouseResponse) => {
    setSelectedWarehouse(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  });

  const handleFormSubmit = async (
    data: CreateWarehouseDto | UpdateWarehouseDto,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedWarehouse) {
        // Update
        await dispatch(
          updateWarehouse({ id: selectedWarehouse.id, data: data as UpdateWarehouseDto })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật kho hàng thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createWarehouse(data as CreateWarehouseDto)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo kho hàng thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchWarehouses());
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteWarehouses(ids)).unwrap();
      setSnackbar({
        open: true,
        message: 'Kho hàng đã được chuyển sang trạng thái "Ngừng hoạt động"',
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchWarehouses());
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchWarehouses());
    setSnackbar({
      open: true,
      message: 'Đã làm mới dữ liệu',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterStatus('');
  };

  // Filter data
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchSearch =
      searchQuery === '' ||
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = filterType === '' || warehouse.type === filterType;
    
    const matchStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && warehouse.isActive) ||
      (filterStatus === 'inactive' && !warehouse.isActive);

    return matchSearch && matchType && matchStatus;
  });

  const activeFiltersCount =
    (searchQuery ? 1 : 0) + (filterType ? 1 : 0) + (filterStatus ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Kho hàng"
        subtitle="Quản lý danh sách kho hàng, cửa hàng và theo dõi tồn kho"
        breadcrumbs={[{ label: 'Kho hàng', icon: <WarehouseIcon fontSize="small" /> }]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Thêm mới',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredWarehouses.length} Kho` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'search',
            label: 'Tìm kiếm',
            placeholder: 'Tìm theo mã hoặc tên kho...',
            value: searchQuery,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'search') setSearchQuery(value);
        }}
        filters={[
          {
            id: 'type',
            label: 'Loại kho',
            type: 'select',
            options: [
              { value: '', label: 'Tất cả' },
              { value: WarehouseType.CENTRAL, label: 'Kho tổng' },
              { value: WarehouseType.STORE, label: 'Cửa hàng' },
              { value: WarehouseType.DAMAGED, label: 'Kho hủy' },
            ],
            value: filterType,
          },
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { value: '', label: 'Tất cả' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Ngừng hoạt động' },
            ],
            value: filterStatus,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'type') setFilterType(value);
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredWarehouses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredWarehouses.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={handleEdit}
        rowKey="id"
        emptyMessage="Chưa có kho hàng nào"
      />

      {/* Warehouse Form Dialog */}
      <WarehouseFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedWarehouse={selectedWarehouse}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog with Special Warning */}
      <Dialog
        open={openDelete}
        onClose={() => !operationLoading && setOpenDelete(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Xác nhận ngừng hoạt động kho</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              ⚠️ Lưu ý quan trọng
            </Typography>
            <Typography variant="body2">
              Bạn không thể xóa kho đã có lịch sử nhập xuất. Hệ thống sẽ chuyển trạng thái sang
              "Ngừng hoạt động". Tiếp tục?
            </Typography>
          </Alert>
          <Typography variant="body2">
            {selectedRows.length === 1 ? (
              <>
                Kho: <strong>{selectedRows[0]?.name}</strong> ({selectedRows[0]?.code})
              </>
            ) : (
              <>
                Số lượng: <strong>{selectedRows.length}</strong> kho
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDelete(false)} disabled={operationLoading} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="warning"
            disabled={operationLoading}
          >
            {operationLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      <LoadingOverlay
        open={loading && warehouses.length === 0}
        message="Đang tải danh sách kho..."
      />

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
      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
