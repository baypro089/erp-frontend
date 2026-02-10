'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { PayslipResponse } from '@libs/shared/types/payslips.type';
import { useRef } from 'react';

interface PayslipDetailDialogProps {
  open: boolean;
  onClose: () => void;
  payslip: PayslipResponse | null;
  onMarkAsPaid?: (id: string) => void;
  isMarkingPaid?: boolean;
  showMarkPaidButton?: boolean;
}

export default function PayslipDetailDialog({
  open,
  onClose,
  payslip,
  onMarkAsPaid,
  isMarkingPaid = false,
  showMarkPaidButton = true,
}: PayslipDetailDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const monthYear = `${payslip.month.toString().padStart(2, '0')}/${payslip.year}`;

  // Calculate deductions and allowances from details
  const allowances = Object.entries(payslip.details || {})
    .filter(([key]) => key.toLowerCase().includes('allowance') || key.toLowerCase().includes('phụ cấp'))
    .reduce((sum, [, value]) => sum + value, 0);

  const unpaidLeaveDeduction = payslip.unpaidLeaveDays * (payslip.baseSalary / payslip.standardWorkDays);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: '#f5f5f5',
        },
      }}
    >
      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Paper-style payslip */}
        <Box
          ref={printAreaRef}
          sx={{
            bgcolor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '@media print': {
              boxShadow: 'none',
              p: 2,
            },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
                letterSpacing: 1,
              }}
            >
              PHIẾU LƯƠNG
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              THÁNG {monthYear}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Employee Info */}
          <Box sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 0.5, fontWeight: 600, width: '30%' }}>
                    Mã nhân viên:
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 0.5 }}>
                    {payslip.employee.employeeCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 0.5, fontWeight: 600 }}>
                    Họ và tên:
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 0.5 }}>
                    {payslip.employee.fullName}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 0.5, fontWeight: 600 }}>
                    Phòng ban:
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 0.5 }}>
                    {payslip.employee.department?.name || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 0.5, fontWeight: 600 }}>
                    Chức vụ:
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 0.5 }}>
                    {payslip.employee.currentPosition?.name || 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Salary Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              CHI TIẾT LƯƠNG
            </Typography>
            <Table size="small">
              <TableBody>
                {/* Base Salary */}
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1 }}>
                    Lương cứng
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1, textAlign: 'right' }}>
                    {formatCurrency(payslip.baseSalary)}
                  </TableCell>
                </TableRow>

                {/* Work Days */}
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1, pl: 3, fontSize: '0.875rem', color: 'text.secondary' }}>
                    Số ngày chuẩn: {payslip.standardWorkDays} ngày
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1, pl: 3, fontSize: '0.875rem', color: 'text.secondary' }}>
                    Số ngày làm việc: {payslip.actualWorkDays} ngày
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1 }}></TableCell>
                </TableRow>

                {/* Allowances */}
                {allowances > 0 && (
                  <TableRow>
                    <TableCell sx={{ border: 'none', py: 1, color: 'success.main' }}>
                      (+) Phụ cấp
                    </TableCell>
                    <TableCell sx={{ border: 'none', py: 1, textAlign: 'right', color: 'success.main' }}>
                      +{formatCurrency(allowances)}
                    </TableCell>
                  </TableRow>
                )}

                {/* Unpaid Leave Deduction */}
                {payslip.unpaidLeaveDays > 0 && (
                  <TableRow>
                    <TableCell sx={{ border: 'none', py: 1, color: 'error.main' }}>
                      (-) Nghỉ không lương ({payslip.unpaidLeaveDays} ngày)
                    </TableCell>
                    <TableCell sx={{ border: 'none', py: 1, textAlign: 'right', color: 'error.main' }}>
                      -{formatCurrency(unpaidLeaveDeduction)}
                    </TableCell>
                  </TableRow>
                )}

                {/* Other details */}
                {Object.entries(payslip.details || {}).map(([key, value]) => {
                  if (key.toLowerCase().includes('allowance') || key.toLowerCase().includes('phụ cấp')) {
                    return null;
                  }
                  return (
                    <TableRow key={key}>
                      <TableCell sx={{ border: 'none', py: 1, pl: 3, fontSize: '0.875rem' }}>
                        {key}
                      </TableCell>
                      <TableCell sx={{ border: 'none', py: 1, textAlign: 'right', fontSize: '0.875rem' }}>
                        {formatCurrency(value)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          <Divider sx={{ mb: 2, borderStyle: 'dashed', borderWidth: 2 }} />

          {/* Final Salary */}
          <Box
            sx={{
              bgcolor: 'primary.lighter',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              TỔNG THỰC LĨNH:
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'success.main',
              }}
            >
              {formatCurrency(payslip.finalSalary)}
            </Typography>
          </Box>

          {/* Status and Date */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={payslip.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              color={payslip.isPaid ? 'success' : 'warning'}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              Ngày tạo: {formatDate(payslip.createdAt)}
            </Typography>
          </Box>

          {/* Note */}
          {payslip.note && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Ghi chú:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {payslip.note}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 2,
          gap: 1,
          '@media print': {
            display: 'none',
          },
        }}
      >
        {showMarkPaidButton && !payslip.isPaid && onMarkAsPaid && (
          <Button
            onClick={() => onMarkAsPaid(payslip.id)}
            variant="outlined"
            color="success"
            disabled={isMarkingPaid}
            startIcon={<CheckCircleIcon />}
          >
            Đánh dấu đã trả
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />}>
          In phiếu lương
        </Button>
      </DialogActions>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  );
}
