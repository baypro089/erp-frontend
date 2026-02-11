'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Button,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  StatusChip,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import {
  GeneratePayrollDialog,
  PayslipDetailDialog,
} from '@libs/src/components/payslip';
import {
  fetchPayslips,
  generatePayroll,
  markPayslipAsPaid,
  clearError,
  clearGenerationResult,
} from '@libs/src/features/payslip/payslip.slice';
import type { PayslipResponse, PaySlipTableResponse } from '@libs/shared/types/payslips.type';

export default function PayrollPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    payslips,
    totalCount,
    totalPages,
    loading,
    error,
    operationLoading,
    operationError,
    generationResult,
  } = useSelector((state: RootState) => state.payslip);

  // Dialog states
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
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

  // Reload payslips when filters or pagination changes
  useEffect(() => {
    dispatch(
      fetchPayslips({
        month: filterMonth,
        year: filterYear,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  }, [dispatch, filterMonth, filterYear, page, rowsPerPage, refreshCounter]);

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

  // Show result dialog after generation
  useEffect(() => {
    if (generationResult) {
      setOpenResultDialog(true);
      setOpenGenerateDialog(false);
    }
  }, [generationResult]);

  // Define table columns
  const columns: Column<PaySlipTableResponse>[] = [
    {
      id: 'employeeCode',
      label: 'Mã NV',
      minWidth: 120,
      format: (value, row) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {row.employee.employeeCode}
        </Typography>
      ),
    },
    {
      id: 'fullName',
      label: 'Họ và tên',
      minWidth: 200,
      format: (value, row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employee.fullName}
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
      id: 'actualWorkDays',
      label: 'Ngày công',
      minWidth: 100,
      align: 'center',
      format: (value, row) => (
        <Typography variant="body2">
          {value}/{row.standardWorkDays}
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
      minWidth: 130,
      align: 'center',
      format: (value) => (
        <StatusChip
          status={(value as boolean) ? 'active' : 'pending'}
          label={(value as boolean) ? 'Đã trả' : 'Chưa trả'}
          showIcon
        />
      ),
    },
  ];

  const handleGeneratePayroll = async (month: number, year: number) => {
    try {
      await dispatch(generatePayroll({ month, year })).unwrap();
      setSnackbar({
        open: true,
        message: 'Tính lương thành công!',
        severity: 'success',
      });
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      // Error already handled by redux
    }
  };

  const handleRowClick = (payslip: PaySlipTableResponse) => {
    setSelectedPayslip(payslip);
    setOpenDetailDialog(true);
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await dispatch(markPayslipAsPaid(id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Đã đánh dấu thanh toán thành công!',
        severity: 'success',
      });
      setOpenDetailDialog(false);
      setRefreshCounter((prev) => prev + 1);
    } catch (err) {
      // Error already handled by redux
    }
  };

  const handleCloseResultDialog = () => {
    setOpenResultDialog(false);
    dispatch(clearGenerationResult());
    setRefreshCounter((prev) => prev + 1);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${(i + 1).toString().padStart(2, '0')}`,
  }));

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  return (
    <Box sx={{ p: 3 }}>
      <LoadingOverlay open={loading} />

      <PageHeader
        title="Quản lý phiếu lương"
        subtitle="Tính và quản lý phiếu lương nhân viên"
        actions={[
          {
            label: 'Làm mới',
            onClick: () => setRefreshCounter((prev) => prev + 1),
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Tính lương tháng này',
            onClick: () => setOpenGenerateDialog(true),
            icon: <CalculateIcon />,
            variant: 'contained',
          },
        ]}
      />

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

      {/* Generate Payroll Dialog */}
      <GeneratePayrollDialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        onSubmit={handleGeneratePayroll}
        loading={operationLoading}
      />

      {/* Payslip Detail Dialog */}
      <PayslipDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        payslipId={selectedPayslip?.id || ''}
        onMarkAsPaid={handleMarkAsPaid}
        isMarkingPaid={operationLoading}
        showMarkPaidButton={true}
      />

      {/* Generation Result Dialog */}
      <Dialog
        open={openResultDialog}
        onClose={handleCloseResultDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Kết quả tính lương</DialogTitle>
        <DialogContent dividers>
          {generationResult && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Tháng:</strong> {generationResult.month.toString().padStart(2, '0')}/
                  {generationResult.year}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Tổng nhân viên:</strong> {generationResult.totalEmployees}
                </Typography>
                <Typography variant="body1" color="success.main" gutterBottom>
                  <strong>Thành công:</strong> {generationResult.successCount}
                </Typography>
                {generationResult.failedCount > 0 && (
                  <Typography variant="body1" color="error.main" gutterBottom>
                    <strong>Thất bại:</strong> {generationResult.failedCount}
                  </Typography>
                )}
              </Box>

              {generationResult.items && generationResult.items.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Chi tiết:
                  </Typography>
                  <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {generationResult.items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.status === 'SUCCESS' ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.employeeName}
                          secondary={item.status === 'FAILED' ? item.error : 'Thành công'}
                          secondaryTypographyProps={{
                            color: item.status === 'FAILED' ? 'error' : 'success.main',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultDialog} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

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
