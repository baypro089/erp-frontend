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
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
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
  fetchImportReceipts,
  clearError,
} from '@libs/src/features/import-receipt/import-receipt.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import type { ImportReceiptTableResponse } from '@libs/shared/types/import-receipt.type';
import { ReceiptStatus } from '@libs/shared/enums/receipt-status.enum';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function ImportsListPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.IMPORT_RECEIPT.VIEW}
      fallbackPath="/commercial"
    >
      <ImportsListPageContent />
    </PermissionGuard>
  );
}

function ImportsListPageContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, permissionDialogProps } = usePermissionGuard();
  
  const { importReceipts, pagedImportReceipts, loading, error } = useSelector(
    (state: RootState) => state.importReceipt
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // Filter states
  const [searchCode, setSearchCode] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
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

  // Load initial data
  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  // Fetch import receipts with filters
  useEffect(() => {
    const params: any = {
      page: page + 1,
      pageSize: rowsPerPage,
    };

    if (searchCode) params.code = searchCode;
    if (filterWarehouse) params.warehouseId = filterWarehouse;
    if (filterStatus) params.status = filterStatus;
    if (dateFrom) params.dateFrom = new Date(dateFrom);
    if (dateTo) params.dateTo = new Date(dateTo);

    dispatch(fetchImportReceipts(params));
  }, [dispatch, page, rowsPerPage, searchCode, filterWarehouse, filterStatus, dateFrom, dateTo]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle view detail
  const handleView = (receipt: ImportReceiptTableResponse) => {
    router.push(`/commercial/inventory/imports/${receipt.id}`);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(
      fetchImportReceipts({
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchCode('');
    setFilterWarehouse('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Status mapping
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
      COMPLETED: { label: 'Hoàn thành', type: 'success' },
      PENDING: { label: 'Chờ xử lý', type: 'warning' },
      CANCELLED: { label: 'Đã hủy', type: 'error' },
    };
    return statusMap[status] || { label: status, type: 'info' };
  };

  // Table columns
  const columns: Column<ImportReceiptTableResponse>[] = [
    {
      id: 'code',
      label: 'Mã phiếu',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'warehouseName',
      label: 'Kho nhập',
      minWidth: 150,
    },
    {
      id: 'supplierName',
      label: 'Nhà cung cấp',
      minWidth: 150,
      format: (value) => value || '-',
    },
    {
      id: 'totalPrice',
      label: 'Tổng tiền',
      minWidth: 130,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={500} color="error.main">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      id: 'itemsCount',
      label: 'Số mặt hàng',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip label={value} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value) => {
        const status = value as string;
        // Map to StatusChip compatible status
        const statusMap: Record<string, string> = {
          COMPLETED: 'completed',
          PENDING: 'pending',
          CANCELLED: 'cancelled',
        };
        return <StatusChip status={statusMap[status] || status} />;
      },
    },
    {
      id: 'createdByName',
      label: 'Người tạo',
      minWidth: 150,
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 150,
      format: (value) => format(new Date(value as Date), 'dd/MM/yyyy HH:mm', { locale: vi }),
    },
  ];

  const activeFiltersCount = [searchCode, filterWarehouse, filterStatus, dateFrom, dateTo].filter(Boolean).length;

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Quản lý Phiếu Nhập Kho"
        actions={[
          {
            label: 'Tạo phiếu nhập',
            icon: <AddIcon />,
            onClick: guardAction(PERMISSIONS.IMPORT_RECEIPT.CREATE, () => router.push('/commercial/inventory/imports/create')),
            variant: 'contained',
          },
          {
            label: 'Làm mới',
            icon: <RefreshIcon />,
            onClick: handleRefresh,
            variant: 'outlined',
          },
        ]}
      />

      {loading && <LoadingOverlay open={loading} />}

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'code',
            label: 'Mã phiếu',
            placeholder: 'Tìm theo mã phiếu...',
            value: searchCode,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'code') setSearchCode(value);
        }}
        filters={[
          {
            id: 'warehouse',
            label: 'Kho',
            type: 'select',
            value: filterWarehouse,
            options: warehouses.map((w) => ({ label: w.name, value: w.id })),
          },
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            value: filterStatus,
            options: [
              { label: 'Hoàn thành', value: ReceiptStatus.COMPLETED },
              { label: 'Chờ xử lý', value: ReceiptStatus.PENDING },
              { label: 'Đã hủy', value: ReceiptStatus.CANCELLED },
            ],
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'warehouse') setFilterWarehouse(value);
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Additional date filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Từ ngày"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
      </Box>

      {/* Summary Stats */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Tổng số phiếu: <strong>{pagedImportReceipts?.totalCount || 0}</strong>
        </Typography>
        {pagedImportReceipts && (
          <Typography variant="body2" color="text.secondary">
            Trang {page + 1} / {pagedImportReceipts.totalPages}
          </Typography>
        )}
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={importReceipts}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={pagedImportReceipts?.totalCount || 0}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        onView={handleView}
        rowKey="id"
        emptyMessage="Chưa có phiếu nhập kho nào"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
