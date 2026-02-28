'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
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
import { useEffect, useRef } from 'react';
import { AppDispatch, RootState } from '@libs/src/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPayslipById } from '@libs/src/features/payslip/payslip.slice';
import { fetchSalaryComponents } from '@libs/src/features/system-setting/system-setting.slice';
import { groupPayslipItems } from '@libs/src/utils/payslip-helper';

interface PayslipDetailDialogProps {
  open: boolean;
  onClose: () => void;
  payslipId?: string;
  onMarkAsPaid?: (id: string) => void;
  isMarkingPaid?: boolean;
  showMarkPaidButton?: boolean;
}

export default function PayslipDetailDialog({
  open,
  onClose,
  payslipId = undefined,
  onMarkAsPaid,
  isMarkingPaid = false,
  showMarkPaidButton = true,
}: PayslipDetailDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { currentPayslip, operationError, operationLoading } = useSelector((state: RootState) => state.payslip);
  const { salaryComponents } = useSelector((state: RootState) => state.systemSetting);
  
  useEffect(() => {
    if (open && payslipId) {
      dispatch(getPayslipById(payslipId));
      dispatch(fetchSalaryComponents());
    }
  }, [open, payslipId, dispatch]);

  // Early returns after all hooks
  if (!payslipId) return null;

  const payslip = currentPayslip;
  if (!payslip) return null;

  // Calculate base salary by work days
  const baseSalaryByWorkDays = 
    payslip.standardWorkDays > 0 
      ? (payslip.baseSalary * payslip.actualWorkDays) / payslip.standardWorkDays 
      : payslip.baseSalary;

  // Separate earnings and deductions
  const { earnings, deductions } = groupPayslipItems(payslip, salaryComponents);

  // Calculate totals
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0) + baseSalaryByWorkDays;
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

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
        {/* Printable Payslip */}
        <Box
          ref={printAreaRef}
          id="print-area"
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
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            {/* Company Logo and Info */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  bgcolor: 'primary.lighter',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  ERP
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  CÔNG TY CỔ PHẦN ERP
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điện thoại: (028) 1234 5678 | Email: contact@erp.vn
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                color: 'text.primary',
                mb: 1,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              PHIẾU LƯƠNG THÁNG {monthYear}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Employee Info - 2 Column Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Họ và tên:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {payslip.employee.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Phòng ban:
              </Typography>
              <Typography variant="body1">
                {payslip.employee.department?.name || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Mã nhân viên:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {payslip.employee.employeeCode}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Chức vụ:
              </Typography>
              <Typography variant="body1">
                {payslip.employee.currentPosition?.name || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Salary Details - 2 Column Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            {/* Left Column - EARNINGS */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'success.main',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'success.main',
                }}
              >
                THU NHẬP
              </Typography>

              {/* Base Salary */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2">
                  Lương cơ bản (Ngày: {payslip.actualWorkDays})
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(baseSalaryByWorkDays)}
                </Typography>
              </Box>

              {/* Earnings List */}
              {earnings.map((item) => (
                <Box key={item.code} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(item.amount)}
                  </Typography>
                </Box>
              ))}

              {/* Total Earnings */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 1.5,
                  borderTop: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  Tổng thu nhập
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(totalEarnings)}
                </Typography>
              </Box>
            </Box>

            {/* Right Column - DEDUCTIONS */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'error.main',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'error.main',
                }}
              >
                KHẤU TRỪ
              </Typography>

              {/* Deductions List */}
              {deductions.length > 0 ? (
                <>
                  {deductions.map((item) => (
                    <Box key={item.code} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        - {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  ))}

                  {/* Total Deductions */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 2,
                      pt: 1.5,
                      borderTop: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Tổng khấu trừ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                      - {formatCurrency(totalDeductions)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Không có khoản khấu trừ
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderStyle: 'dashed', borderWidth: 2 }} />

          {/* Summary Section - NET SALARY */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 3,
              borderRadius: 1,
              borderTop: '3px solid',
              borderColor: 'primary.main',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Lương thực lĩnh
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
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

          {/* Signature Section */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 3,
              mt: 4,
              pt: 3,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Người lập phiếu
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                (Ký, họ tên)
              </Typography>
              <Box sx={{ mt: 6 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Người nhận
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                (Ký, họ tên)
              </Typography>
              <Box sx={{ mt: 6 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {payslip.employee.fullName}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Giám đốc
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                (Ký, đóng dấu, họ tên)
              </Typography>
              <Box sx={{ mt: 6 }} />
            </Box>
          </Box>
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
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          body {
            background: white;
            color: black;
          }
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
            background: white;
            color: black;
          }
        }
      `}</style>
    </Dialog>
  );
}
