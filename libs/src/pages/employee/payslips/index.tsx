'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  MenuItem,
  TextField,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import { PayslipDetailDialog } from '@libs/src/components/payslip';
import {
  fetchMyPayslips,
  clearError,
} from '@libs/src/features/payslip/payslip.slice';
import type { PayslipResponse, PaySlipTableResponse } from '@libs/shared/types/payslips.type';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchUserById } from '@libs/src/features/user/user.slice';

export default function EmployeePayslipsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    payslips,
    totalCount,
    loading,
    error,
  } = useSelector((state: RootState) => state.payslip);

  // Get current auth user
  const { user, isAuth } = useSelector((state: RootState) => state.auth);
  
  // Get detailed user info with employee
  const { currentUser } = useSelector((state: RootState) => state.user);

  // Dialog states
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PaySlipTableResponse | null>(null);

  // Filter states
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());

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

  // Load current user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      await dispatch(fetchCurrentUser());
    };
    loadUserData();
  }, [dispatch]);

  // Load detailed user info when auth user is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserById(user.id));
    }
  }, [dispatch, user?.id]);

  // Reload payslips when filters or pagination changes
  useEffect(() => {
    // Only fetch if user is authenticated and has employee data
    if (!isAuth || !currentUser?.employee?.id) {
      return;
    }

    dispatch(
      fetchMyPayslips({
        employeeId: currentUser.employee.id,
        month: filterMonth,
        year: filterYear,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  }, [dispatch, filterMonth, filterYear, page, rowsPerPage, refreshCounter, isAuth, currentUser?.employee?.id]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Define table columns
  const columns: Column<PaySlipTableResponse>[] = [
    {
      id: 'standardWorkDays',
      label: 'Ngày chuẩn',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Typography variant="body2">
          {value} ngày
        </Typography>
      ),
    },
    {
      id: 'actualWorkDays',
      label: 'Ngày làm việc',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value} ngày
        </Typography>
      ),
    },
    {
      id: 'baseSalary',
      label: 'Lương cứng',
      minWidth: 130,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value as number)}
        </Typography>
      ),
    },
    {
      id: 'finalSalary',
      label: 'Thực lĩnh',
      minWidth: 150,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={700} color="success.main">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value as number)}
        </Typography>
      ),
    },
    {
      id: 'isPaid',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={(value as boolean) ? 'Đã trả' : 'Chưa trả'}
          color={(value as boolean) ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  const handleRowClick = (payslip: PaySlipTableResponse) => {
    setSelectedPayslip(payslip);
    setOpenDetailDialog(true);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${(i + 1).toString().padStart(2, '0')}`,
  }));

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  // Get latest payslip for summary card
  const latestPayslip = payslips.length > 0 ? payslips[0] : null;

  return (
    <Box sx={{ p: 3 }}>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Phiếu lương của tôi"
        subtitle="Xem lịch sử phiếu lương và chi tiết thu nhập"
        actions={[
          {
            label: 'Làm mới',
            onClick: () => setRefreshCounter((prev) => prev + 1),
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
        ]}
      />

      {/* Summary Cards */}
      {currentUser?.employee && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Mã nhân viên
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {currentUser.employee.employeeCode}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Lương tháng này
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {latestPayslip ? new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(latestPayslip.finalSalary) : 'Chưa có'}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarMonthIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày công tháng này
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {latestPayslip ? `${latestPayslip.actualWorkDays}/${latestPayslip.standardWorkDays}` : 'Chưa có'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filter Bar */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          select
          label="Tháng"
          value={filterMonth}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Năm"
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ flex: 1 }} />

        <Typography variant="body2" color="text.secondary">
          Tổng: <strong>{totalCount}</strong> phiếu lương
        </Typography>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={payslips}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        loading={loading}
        onView={handleRowClick}
        emptyMessage="Chưa có phiếu lương nào"
      />

      {/* Payslip Detail Dialog */}
      <PayslipDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        payslipId={selectedPayslip?.id || undefined}
        showMarkPaidButton={false}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
