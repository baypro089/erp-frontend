'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  LoadingOverlay,
} from '@libs/src/components/common';
import type { Column, DataTableAction } from '@libs/src/components/common/DataTable';
import {
  fetchReturnRequests,
  clearError,
} from '@libs/src/features/return-request/return-request.slice';
import { ReturnStatus } from '@libs/shared/enums/return-status.enum';
import type { ReturnRequesTableResponse } from '@libs/shared/types/return-request.type';

const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: 'Chờ xử lý',
  [ReturnStatus.COMPLETED]: 'Hoàn tất',
  [ReturnStatus.REJECTED]: 'Từ chối',
};

const RETURN_STATUS_COLOR: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: 'warning',
  [ReturnStatus.COMPLETED]: 'success',
  [ReturnStatus.REJECTED]: 'error',
};

export default function ReturnsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { pagedReturnRequests, loading, error } = useSelector(
    (state: RootState) => state.returnRequest
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadData = () => {
    dispatch(
      fetchReturnRequests({
        code: searchQuery || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  };

  const handleSearch = () => {
    setPage(0);
    loadData();
  };

  const columns: Column<ReturnRequesTableResponse>[] = [
    {
      id: 'code',
      label: 'Mã phiếu',
      minWidth: 150,
      format: (_val, row) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'orderCode',
      label: 'Mã đơn hàng',
      minWidth: 150,
    },
    {
      id: 'customerName',
      label: 'Khách hàng',
      minWidth: 180,
    },
    {
      id: 'returnAmount',
      label: 'Tiền hoàn trả',
      minWidth: 150,
      align: 'right',
      format: (_val, row) => (
        <Typography variant="body2">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.returnAmount)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 130,
      format: (_val, row) => (
        <Chip
          label={RETURN_STATUS_LABELS[row.status as ReturnStatus] ?? row.status}
          color={(RETURN_STATUS_COLOR[row.status as ReturnStatus] ?? 'default') as any}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 140,
      format: (_val, row) =>
        new Date(row.createdAt).toLocaleDateString('vi-VN'),
    },
  ];

  const tableActions: DataTableAction<ReturnRequesTableResponse>[] = [
    {
      icon: <ViewIcon fontSize="small" />,
      label: 'Xem chi tiết',
      color: 'primary',
      onClick: (row) => router.push(`/commercial/returns/${row.id}`),
    },
  ];

  return (
    <Box>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Phiếu Trả Hàng / Bảo Hành"
        subtitle="Quản lý các yêu cầu trả hàng và xử lý bảo hành"
        breadcrumbs={[
          { label: 'Thương mại', href: '/commercial/dashboards' },
          { label: 'Trả hàng' },
        ]}
        actions={[
          {
            label: 'Tải lại',
            onClick: loadData,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: '+ Tạo Đơn Trả Hàng',
            onClick: () => router.push('/commercial/returns/initiate'),
            icon: <AddIcon />,
            variant: 'contained',
            color: 'primary',
          },
        ]}
      />

      <FilterBar
        searchFields={[
          {
            id: 'code',
            label: 'Tìm kiếm',
            placeholder: 'Tìm theo mã phiếu...',
            value: searchQuery,
          },
        ]}
        onSearchChange={(_fieldId, value) => {
          setSearchQuery(value);
          if (value === '') handleSearch();
        }}
      />

      <DataTable
        columns={columns}
        data={pagedReturnRequests?.items ?? []}
        totalRows={pagedReturnRequests?.totalCount ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        loading={loading}
        actions={tableActions}
        emptyMessage="Chưa có phiếu trả hàng nào"
        rowKey="id"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
