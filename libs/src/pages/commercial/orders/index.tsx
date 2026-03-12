'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
  StatusChip,
  PermissionGuard,
} from '@libs/src/components/common';
import {
  fetchOrders,
  updateOrderStatus,
  clearError,
} from '@libs/src/features/order/order.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import UpdateOrderStatusDialog from '@libs/src/components/dialogs/UpdateOrderStatusDialog';
import type { OrderResponse, OrderTableReponse } from '@libs/shared/types/order.type';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function OrdersPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.ORDER.VIEW}
      fallbackPath="/commercial"
    >
      <OrdersPageContent />
    </PermissionGuard>
  );
}

function OrdersPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { pagedOrders, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.order
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data
  useEffect(() => {
    loadOrders();
    dispatch(fetchWarehouses());
  }, [page, rowsPerPage, filterStatus, dateFrom, dateTo]);

  const loadOrders = () => {
    dispatch(
      fetchOrders({
        code: searchQuery || undefined,
        status: filterStatus ? (filterStatus as OrderStatus) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  };

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

  // Actions
  const handleAdd = guardAction(PERMISSIONS.ORDER.CREATE, () => {
    router.push('/commercial/sales/create');
  });

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    loadOrders();
    setSnackbar({
      open: true,
      message: 'Đã làm mới dữ liệu',
      severity: 'success',
    });
  };

  const handleView = (row: OrderTableReponse) => {
    router.push(`/commercial/orders/${row.id}`);
  };



  const handleSearch = () => {
    setPage(0);
    loadOrders();
  };

  const handleOpenUpdateStatusImpl = async (row: OrderTableReponse) => {
    try {
      // Fetch full order details
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${row.id}`, {
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.data) {
        setSelectedOrder(result.data);
        setOpenUpdateStatus(true);
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải chi tiết đơn hàng',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải chi tiết đơn hàng',
        severity: 'error',
      });
    }
  };

  const handleOpenUpdateStatus = guardFn<OrderTableReponse>(PERMISSIONS.ORDER.UPDATE, handleOpenUpdateStatusImpl);

  const handleConfirmUpdateStatus = async (status: OrderStatus, warehouseIdToReturn?: string) => {
    if (!selectedOrder) return;

    try {
      await dispatch(
        updateOrderStatus({
          orderId: selectedOrder.id,
          status,
          warehouseIdToReturn,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success',
      });
      setOpenUpdateStatus(false);
      loadOrders();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  // Status badge
  const getStatusChip = (status: OrderStatus) => {
    const config: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'pending',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.SHIPPED]: 'shipped',
      [OrderStatus.DELIVERED]: 'completed',
      [OrderStatus.CANCELLED]: 'cancelled',
    };
    return <StatusChip status={config[status]} />;
  };

  // Table columns
  const columns: Column<OrderTableReponse>[] = [
    {
      id: 'code',
      label: 'Mã đơn',
      minWidth: 120,
      format: (value, row) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'customerName',
      label: 'Khách hàng',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">{row.customerName}</Typography>
      ),
    },
    {
      id: 'creatorName',
      label: 'Người tạo',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">{row.creatorName}</Typography>
      ),
    },
    {
      id: 'totalAmount',
      label: 'Tổng tiền',
      minWidth: 120,
      align: 'right',
      format: (value, row) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {row.totalAmount.toLocaleString('vi-VN')}₫
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value, row) => getStatusChip(row.status),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 150,
      format: (value, row) => (
        <Typography variant="body2">
          {new Date(row.createdAt).toLocaleString('vi-VN')}
        </Typography>
      ),
    },
  ];

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Đơn hàng"
        subtitle="Theo dõi và quản lý đơn hàng"
        breadcrumbs={[{ label: 'Đơn hàng', icon: <CartIcon fontSize="small" /> }]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Tạo đơn hàng',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${pagedOrders?.totalCount || 0} Đơn hàng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'search',
            label: 'Tìm kiếm',
            placeholder: 'Tìm theo mã đơn...',
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
              { value: OrderStatus.PENDING, label: 'Chờ xuất' },
              { value: OrderStatus.SHIPPED, label: 'Đã xuất' },
              { value: OrderStatus.CANCELLED, label: 'Đã hủy' },
            ],
            value: filterStatus,
          },
          {
            id: 'dateFrom',
            label: 'Từ ngày',
            type: 'date',
            value: dateFrom,
          },
          {
            id: 'dateTo',
            label: 'Đến ngày',
            type: 'date',
            value: dateTo,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'status') setFilterStatus(value);
          if (filterId === 'dateFrom') setDateFrom(value);
          if (filterId === 'dateTo') setDateTo(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={pagedOrders?.items || []}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={pagedOrders?.totalCount || 0}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        actions={[
          {
            icon: <ViewIcon />,
            label: 'Xem chi tiết',
            onClick: handleView,
          },
          {
            icon: <EditIcon />,
            label: 'Cập nhật trạng thái',
            onClick: handleOpenUpdateStatus,
            color: 'primary' as const,
          },
        ]}
        emptyMessage="Không có đơn hàng nào"
      />

      {/* Update Status Dialog */}
      <UpdateOrderStatusDialog
        open={openUpdateStatus}
        order={selectedOrder}
        warehouses={warehouses}
        onClose={() => setOpenUpdateStatus(false)}
        onConfirm={handleConfirmUpdateStatus}
        loading={operationLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {operationLoading && <LoadingOverlay open={true} message="Đang xử lý..." />}
      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
