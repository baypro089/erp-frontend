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
  People as CustomerIcon,
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
import CustomerFormDialog from '@libs/src/components/customers/CustomerFormDialog';
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomers,
  clearError,
} from '@libs/src/features/customer/customer.slice';
import type {
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@libs/shared/types/customer.type';
import { CustomerTier } from '@libs/shared/enums/customer-tier.enum';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function CustomersPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.CUSTOMER.VIEW}
      fallbackPath="/commercial"
    >
      <CustomersPageContent />
    </PermissionGuard>
  );
}

function CustomersPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { customers, pagedCustomers, currentCustomer, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.customer
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<CustomerResponse[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('');
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
    dispatch(fetchCustomers({ page: 1, pageSize: 100 }));
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
  const handleStatusToggle = async (customer: CustomerResponse) => {
    try {
      await dispatch(
        updateCustomer({
          id: customer.id,
          data: { isActive: !customer.isActive },
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: `Đã ${!customer.isActive ? 'kích hoạt' : 'tắt'} khách hàng`,
        severity: 'success',
      });
      dispatch(fetchCustomers({ page: 1, pageSize: 100 }));
    } catch (err) {
      // Error handled by useEffect
    }
  };

  // Get tier label
  const getTierLabel = (tier: CustomerTier): string => {
    const tierLabels: Record<CustomerTier, string> = {
      [CustomerTier.STANDARD]: 'Thường',
      [CustomerTier.SILVER]: 'Bạc',
      [CustomerTier.GOLD]: 'Vàng',
      [CustomerTier.PLATINUM]: 'Bạch Kim',
    };
    return tierLabels[tier] || tier;
  };

  // Get tier color
  const getTierColor = (tier: CustomerTier): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    const tierColors: Record<CustomerTier, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      [CustomerTier.STANDARD]: 'default',
      [CustomerTier.SILVER]: 'info',
      [CustomerTier.GOLD]: 'warning',
      [CustomerTier.PLATINUM]: 'success',
    };
    return tierColors[tier] || 'default';
  };

  // Table columns
  const columns: Column<CustomerResponse>[] = [
    {
      id: 'fullName',
      label: 'Họ và tên',
      minWidth: 200,
      format: (value, row: CustomerResponse) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.fullName}
          </Typography>
          {row.email && (
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'phoneNumber',
      label: 'Số điện thoại',
      minWidth: 130,
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'tier',
      label: 'Hạng thành viên',
      minWidth: 130,
      align: 'center',
      format: (value: CustomerTier) => (
        <Chip
          label={getTierLabel(value)}
          color={getTierColor(value)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'totalSpent',
      label: 'Tổng chi tiêu',
      minWidth: 130,
      align: 'right',
      format: (value: number) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value)}
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
      format: (value, row: CustomerResponse) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Switch
            checked={row.isActive}
            onChange={() => guardFn<CustomerResponse>(PERMISSIONS.CUSTOMER.UPDATE, handleStatusToggle)(row)}
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
  const handleAdd = guardAction(PERMISSIONS.CUSTOMER.CREATE, () => {
    setSelectedCustomer(null);
    setOpenForm(true);
  });

  const handleEditImpl = async (row: CustomerResponse) => {
    try {
      // Fetch full customer data before editing
      const fullCustomer = await dispatch(fetchCustomerById(row.id)).unwrap();
      setSelectedCustomer(fullCustomer);
      setOpenForm(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleEdit = guardFn<CustomerResponse>(PERMISSIONS.CUSTOMER.UPDATE, handleEditImpl);

  const handleDelete = guardFn<CustomerResponse>(PERMISSIONS.CUSTOMER.DELETE, (row: CustomerResponse) => {
    setSelectedCustomer(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  });

  const handleFormSubmit = async (
    data: CreateCustomerDto | UpdateCustomerDto,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedCustomer) {
        // Update
        await dispatch(
          updateCustomer({ id: selectedCustomer.id, data: data as UpdateCustomerDto })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật khách hàng thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createCustomer(data as CreateCustomerDto)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo khách hàng thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchCustomers({ page: 1, pageSize: 100 }));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteCustomers(ids)).unwrap();
      setSnackbar({
        open: true,
        message: 'Xóa khách hàng thành công',
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchCustomers({ page: 1, pageSize: 100 }));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchCustomers({ page: 1, pageSize: 100 }));
    setSnackbar({
      open: true,
      message: 'Đã làm mới dữ liệu',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterTier('');
    setFilterStatus('');
  };

  // Filter data
  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      searchQuery === '' ||
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchTier =
      filterTier === '' || customer.tier === filterTier;

    const matchStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && customer.isActive) ||
      (filterStatus === 'inactive' && !customer.isActive);

    return matchSearch && matchTier && matchStatus;
  });

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (filterTier ? 1 : 0) + 
    (filterStatus ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Khách Hàng"
        subtitle="Quản lý thông tin khách hàng và lịch sử mua hàng"
        breadcrumbs={[
          { label: 'Commercial', href: '/commercial/dashboards' },
          { label: 'Khách hàng', icon: <CustomerIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Thêm KH',
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
            placeholder: 'Tìm theo tên, số điện thoại hoặc email...',
            value: searchQuery,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'search') setSearchQuery(value);
        }}
        filters={[
          {
            id: 'tier',
            label: 'Hạng thành viên',
            type: 'select',
            options: [
              { value: '', label: 'Tất cả' },
              { value: CustomerTier.STANDARD, label: getTierLabel(CustomerTier.STANDARD) },
              { value: CustomerTier.SILVER, label: getTierLabel(CustomerTier.SILVER) },
              { value: CustomerTier.GOLD, label: getTierLabel(CustomerTier.GOLD) },
              { value: CustomerTier.PLATINUM, label: getTierLabel(CustomerTier.PLATINUM) },
            ],
            value: filterTier,
          },
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
          if (filterId === 'tier') setFilterTier(value);
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Summary */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<CustomerIcon />}
          label={`Tổng: ${customers.length}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Hoạt động: ${customers.filter((c) => c.isActive).length}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`Ngừng: ${customers.filter((c) => !c.isActive).length}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`Bạch Kim: ${customers.filter((c) => c.tier === CustomerTier.PLATINUM).length}`}
          color="success"
          size="small"
        />
        <Chip
          label={`Vàng: ${customers.filter((c) => c.tier === CustomerTier.GOLD).length}`}
          color="warning"
          size="small"
        />
        <Chip
          label={`Bạc: ${customers.filter((c) => c.tier === CustomerTier.SILVER).length}`}
          color="info"
          size="small"
        />
        <Chip
          label={`Thường: ${customers.filter((c) => c.tier === CustomerTier.STANDARD).length}`}
          color="default"
          size="small"
        />
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredCustomers.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        rowKey="id"
        loading={loading}
        emptyMessage="Chưa có khách hàng nào"
      />

      {/* Form Dialog */}
      <CustomerFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedCustomer={selectedCustomer}
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
              ? `${selectedRows.length} khách hàng`
              : `khách hàng "${selectedCustomer?.fullName}"`}
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
      <LoadingOverlay open={loading && customers.length === 0} message="Đang tải dữ liệu..." />
      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
